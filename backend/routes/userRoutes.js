const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const { verifyToken } = require("../middleware/auth");
const { authorize } = require("../middleware/rbac");
const { ROLES } = require("../config/constants");

// GET /api/users/:id/profile - Fetch comprehensive user profile
router.get("/:id/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const isSelf = Number(req.user?.id) === Number(userId);
    const isAdmin = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(req.user?.role);
    const isTeacher = req.user?.role === ROLES.TEACHER;

    // 1. Fetch base user info
    const [users] = await pool.query(
      "SELECT id, email, full_name, role, phone, class, section, status, created_at FROM users WHERE id = ?",
      [userId],
    );

    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = users[0];
    const isTargetStudent = user.role === ROLES.STUDENT;

    // Access check: allow if self, admin, teacher, or if target profile is a student
    if (!isSelf && !isAdmin && !isTeacher && !isTargetStudent) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Access denied: Cannot view this user profile",
        });
    }

    let profileData = { ...user };

    // 2. Fetch extended profile based on role
    if (isTargetStudent) {
      const [students] = await pool.query(
        `SELECT s.id AS student_db_id, s.admission_no, s.roll_no, s.first_name, s.last_name,
                s.date_of_birth, s.gender, s.blood_group, s.religion, s.nationality,
                s.address, s.city, s.state, s.pincode, s.admission_date,
                s.status AS student_status, c.name AS class_name
         FROM students s
         LEFT JOIN sections sec ON s.section_id = sec.id
         LEFT JOIN classes c ON sec.class_id = c.id
         WHERE s.user_id = ?`,
        [userId],
      );
      if (students.length > 0) {
        const student = students[0];
        let guardianFields = {};
        try {
          const [guardians] = await pool.query(
            "SELECT relation, full_name, phone, occupation FROM guardians WHERE student_id = ?",
            [student.student_db_id]
          );
          guardians.forEach((g) => {
            if (g.relation === "father") {
              guardianFields.father_name = g.full_name;
              guardianFields.father_phone = g.phone;
              guardianFields.father_occupation = g.occupation;
            } else if (g.relation === "mother") {
              guardianFields.mother_name = g.full_name;
              guardianFields.mother_phone = g.phone;
              guardianFields.mother_occupation = g.occupation;
            } else if (g.relation === "guardian") {
              guardianFields.guardian_name = g.full_name;
              guardianFields.guardian_phone = g.phone;
              guardianFields.guardian_relation = g.relation;
            }
          });
        } catch (gErr) {
          // Ignore guardian query error if schema empty
        }

        profileData = {
          ...profileData,
          ...student,
          ...guardianFields,
          full_name:
            profileData.full_name ||
            `${student.first_name || ""} ${student.last_name || ""}`.trim(),
          class_name: student.class_name || profileData.class || "Class 10",
          profile_type: "student",
        };
      }
    } else {
      // For staff, teachers, admins, principals, librarians, etc.
      const [staff] = await pool.query(
        `SELECT employee_code, first_name, last_name, date_of_birth, gender,
                phone AS emergency_phone, emergency_contact, address, designation,
                department, joining_date, qualification, salary, status AS staff_status
         FROM staff_profiles WHERE user_id = ?`,
        [userId],
      );
      if (staff.length > 0) {
        profileData = { ...profileData, ...staff[0], profile_type: "staff" };
      } else {
        // Fallback structure for staff member without record
        profileData = {
          ...profileData,
          employee_code: `TS-EMP-${String(userId).padStart(3, "0")}`,
          designation: user.role === "teacher" ? "Faculty Member" : "Staff Member",
          department: user.role === "teacher" ? "Academics" : "Administration",
          qualification: "Bachelor's Degree",
          joining_date: "2022-04-01",
          profile_type: "staff",
        };
      }
    }

    res.json({ success: true, data: profileData });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/users/:id/profile - Update user profile details and password in DB
router.put("/:id/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const isSelf = Number(req.user?.id) === Number(userId);
    const isAdmin = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(req.user?.role);

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const {
      full_name,
      email,
      phone,
      password,
      // Staff fields
      employee_code,
      first_name,
      last_name,
      designation,
      department,
      qualification,
      joining_date,
      address,
      gender,
      date_of_birth,
      emergency_contact,
      // Student fields
      blood_group,
      religion,
      nationality,
      city,
      state,
      pincode,
      previous_school,
      father_name,
      father_phone,
      father_occupation,
      mother_name,
      mother_phone,
      mother_occupation,
      guardian_name,
      guardian_phone,
      guardian_relation,
    } = req.body;

    // 1. Update Base User Table
    let userUpdateQuery = "UPDATE users SET full_name = COALESCE(?, full_name), email = COALESCE(?, email), phone = COALESCE(?, phone)";
    const userParams = [full_name || null, email || null, phone || null];

    // Handle Password Update if provided
    if (password && String(password).trim().length >= 6) {
      const hashedPassword = await bcrypt.hash(String(password).trim(), 8);
      userUpdateQuery += ", password = ?";
      userParams.push(hashedPassword);
    }

    userUpdateQuery += " WHERE id = ?";
    userParams.push(userId);

    await pool.query(userUpdateQuery, userParams);

    // 2. Fetch User Role to update corresponding profile tables
    const [[targetUser]] = await pool.query("SELECT role FROM users WHERE id = ?", [userId]);

    if (targetUser && targetUser.role === ROLES.STUDENT) {
      // Update Students table
      const [stuRows] = await pool.query("SELECT id FROM students WHERE user_id = ?", [userId]);
      if (stuRows.length > 0) {
        const studentId = stuRows[0].id;
        await pool.query(
          `UPDATE students SET
             first_name = COALESCE(?, first_name),
             last_name = COALESCE(?, last_name),
             date_of_birth = COALESCE(?, date_of_birth),
             gender = COALESCE(?, gender),
             blood_group = COALESCE(?, blood_group),
             religion = COALESCE(?, religion),
             nationality = COALESCE(?, nationality),
             address = COALESCE(?, address),
             city = COALESCE(?, city),
             state = COALESCE(?, state),
             pincode = COALESCE(?, pincode)
           WHERE id = ?`,
          [
            first_name || null,
            last_name || null,
            date_of_birth || null,
            gender || null,
            blood_group || null,
            religion || null,
            nationality || null,
            address || null,
            city || null,
            state || null,
            pincode || null,
            studentId,
          ]
        );

        // Update Guardians Table
        if (father_name) {
          await pool.query(
            `INSERT INTO guardians (student_id, relation, full_name, phone, occupation)
             VALUES (?, 'father', ?, ?, ?)
             ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone = VALUES(phone), occupation = VALUES(occupation)`,
            [studentId, father_name, father_phone || null, father_occupation || null]
          );
        }
        if (mother_name) {
          await pool.query(
            `INSERT INTO guardians (student_id, relation, full_name, phone, occupation)
             VALUES (?, 'mother', ?, ?, ?)
             ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone = VALUES(phone), occupation = VALUES(occupation)`,
            [studentId, mother_name, mother_phone || null, mother_occupation || null]
          );
        }
      }
    } else {
      // Update Staff Profiles Table
      const [staffRows] = await pool.query("SELECT id FROM staff_profiles WHERE user_id = ?", [userId]);
      const fname = first_name || (full_name ? full_name.split(" ")[0] : "Staff");
      const lname = last_name || (full_name ? full_name.split(" ").slice(1).join(" ") : "Member");
      const empCode = employee_code || `TS-EMP-${String(userId).padStart(3, "0")}`;

      if (staffRows.length > 0) {
        await pool.query(
          `UPDATE staff_profiles SET
             employee_code = COALESCE(?, employee_code),
             first_name = COALESCE(?, first_name),
             last_name = COALESCE(?, last_name),
             designation = COALESCE(?, designation),
             department = COALESCE(?, department),
             qualification = COALESCE(?, qualification),
             phone = COALESCE(?, phone),
             emergency_contact = COALESCE(?, emergency_contact),
             address = COALESCE(?, address),
             gender = COALESCE(?, gender),
             date_of_birth = COALESCE(?, date_of_birth),
             joining_date = COALESCE(?, joining_date)
           WHERE user_id = ?`,
          [
            employee_code || null,
            first_name || null,
            last_name || null,
            designation || null,
            department || null,
            qualification || null,
            phone || null,
            emergency_contact || null,
            address || null,
            gender || null,
            date_of_birth || null,
            joining_date || null,
            userId,
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO staff_profiles (user_id, employee_code, first_name, last_name, designation, department, qualification, phone, emergency_contact, address, gender, date_of_birth, joining_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            empCode,
            fname,
            lname,
            designation || "Staff Member",
            department || "General",
            qualification || "Bachelor's Degree",
            phone || null,
            emergency_contact || null,
            address || null,
            gender || "male",
            date_of_birth || null,
            joining_date || null,
          ]
        );
      }
    }

    res.json({ success: true, message: "Profile and credentials updated successfully in database" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
