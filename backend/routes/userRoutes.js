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
    let paramId = req.params.id;
    if (
      !paramId ||
      paramId === "undefined" ||
      paramId === "null" ||
      paramId === "me"
    ) {
      paramId = req.user?.id;
    }

    // 1. Resolve user record (by users.id, students.id, or staff_profiles.id)
    let [users] = await pool.query(
      "SELECT id, email, full_name, role, phone, class, section, status, created_at FROM users WHERE id = ?",
      [paramId],
    );

    if (users.length === 0) {
      const [stuByDbId] = await pool.query(
        "SELECT u.id, u.email, u.full_name, u.role, u.phone, u.class, u.section, u.status, u.created_at FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?",
        [paramId],
      );
      if (stuByDbId.length > 0) {
        users = stuByDbId;
      } else {
        const [staffByDbId] = await pool.query(
          "SELECT u.id, u.email, u.full_name, u.role, u.phone, u.class, u.section, u.status, u.created_at FROM staff_profiles sp JOIN users u ON sp.user_id = u.id WHERE sp.id = ?",
          [paramId],
        );
        if (staffByDbId.length > 0) {
          users = staffByDbId;
        }
      }
    }

    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = users[0];
    const userId = user.id;
    const isSelf = Number(req.user?.id) === Number(userId);
    const isAdmin = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(req.user?.role);
    const isTeacher = req.user?.role === ROLES.TEACHER;
    const isTargetStudent = user.role === ROLES.STUDENT;

    // Access check: allow if self, admin, or teacher
    if (!isSelf && !isAdmin && !isTeacher) {
      return res.status(403).json({
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
            [student.student_db_id],
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
          console.warn("Failed to fetch student guardians:", gErr);
        }

        profileData = {
          ...profileData,
          ...student,
          ...guardianFields,
          full_name:
            profileData.full_name ||
            `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
            null,
          class_name: student.class_name || profileData.class || null,
          profile_type: "student",
        };
      } else {
        profileData = {
          ...profileData,
          class_name: profileData.class || null,
          profile_type: "student",
          admission_no: `STU-${String(userId).padStart(4, "0")}`,
          roll_no: `R-${String(userId).padStart(3, "0")}`,
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
        profileData = {
          ...profileData,
          employee_code: null,
          designation: null,
          department: null,
          qualification: null,
          joining_date: null,
          profile_type: "staff",
          profile_incomplete: true,
        };
      }
    }

    res.json({ success: true, data: profileData });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/users/:id/profile - Update user profile details in DB
router.put("/:id/profile", verifyToken, async (req, res) => {
  try {
    let paramId = req.params.id;
    if (
      !paramId ||
      paramId === "undefined" ||
      paramId === "null" ||
      paramId === "me"
    ) {
      paramId = req.user?.id;
    }

    let targetUserId = paramId;
    const [uCheck] = await pool.query("SELECT id FROM users WHERE id = ?", [
      paramId,
    ]);
    if (uCheck.length === 0) {
      const [stuCheck] = await pool.query(
        "SELECT user_id FROM students WHERE id = ?",
        [paramId],
      );
      if (stuCheck.length > 0) targetUserId = stuCheck[0].user_id;
      else {
        const [staffCheck] = await pool.query(
          "SELECT user_id FROM staff_profiles WHERE id = ?",
          [paramId],
        );
        if (staffCheck.length > 0) targetUserId = staffCheck[0].user_id;
      }
    }

    const userId = targetUserId;
    const isSelf = Number(req.user?.id) === Number(userId);
    const isAdmin = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(req.user?.role);

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const {
      full_name,
      email,
      phone,
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

    // Validate email format if provided
    if (email && typeof email === "string") {
      const trimmedEmail = email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid email format" });
      }
      // Check for existing email belonging to another user
      const [existingEmail] = await pool.query(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [trimmedEmail, userId],
      );
      if (existingEmail.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Email is already in use by another account.",
        });
      }
    }

    // 1. Update Base User Table (Passwords must use /api/auth/change-password)
    const userUpdateQuery =
      "UPDATE users SET full_name = COALESCE(?, full_name), email = COALESCE(?, email), phone = COALESCE(?, phone) WHERE id = ?";
    const userParams = [
      full_name || null,
      email ? email.trim() : null,
      phone || null,
      userId,
    ];

    try {
      await pool.query(userUpdateQuery, userParams);
    } catch (dbErr) {
      if (dbErr.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          success: false,
          message: "Email is already in use by another account.",
        });
      }
      throw dbErr;
    }

    // 2. Fetch User Role to update corresponding profile tables
    const [[targetUser]] = await pool.query(
      "SELECT role FROM users WHERE id = ?",
      [userId],
    );

    if (targetUser && targetUser.role === ROLES.STUDENT) {
      // Update Students table
      const [stuRows] = await pool.query(
        "SELECT id FROM students WHERE user_id = ?",
        [userId],
      );
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
          ],
        );

        // Update Guardians Table
        if (father_name) {
          await pool.query(
            `INSERT INTO guardians (student_id, relation, full_name, phone, occupation)
             VALUES (?, 'father', ?, ?, ?)
             ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone = VALUES(phone), occupation = VALUES(occupation)`,
            [
              studentId,
              father_name,
              father_phone || null,
              father_occupation || null,
            ],
          );
        }
        if (mother_name) {
          await pool.query(
            `INSERT INTO guardians (student_id, relation, full_name, phone, occupation)
             VALUES (?, 'mother', ?, ?, ?)
             ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone = VALUES(phone), occupation = VALUES(occupation)`,
            [
              studentId,
              mother_name,
              mother_phone || null,
              mother_occupation || null,
            ],
          );
        }
        if (guardian_name) {
          const rel = guardian_relation || "guardian";
          await pool.query(
            `INSERT INTO guardians (student_id, relation, full_name, phone)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone = VALUES(phone)`,
            [studentId, rel, guardian_name, guardian_phone || null],
          );
        }
      } else {
        const fname =
          first_name || (full_name ? full_name.split(" ")[0] : null);
        const lname =
          last_name ||
          (full_name ? full_name.split(" ").slice(1).join(" ") : null);
        const admNo = `STU-${String(userId).padStart(4, "0")}`;
        const rollNo = `R-${String(userId).padStart(3, "0")}`;

        const [stuResult] = await pool.query(
          `INSERT INTO students (user_id, admission_no, roll_no, first_name, last_name, gender, blood_group, religion, nationality, address, city, state, pincode, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            admNo,
            rollNo,
            fname,
            lname,
            gender || "male",
            blood_group || null,
            religion || null,
            nationality || "Indian",
            address || null,
            city || null,
            state || null,
            pincode || null,
            "Active",
          ],
        );
        const newStudentId = stuResult.insertId;

        if (father_name) {
          await pool.query(
            `INSERT INTO guardians (student_id, relation, full_name, phone, occupation) VALUES (?, 'father', ?, ?, ?)`,
            [
              newStudentId,
              father_name,
              father_phone || null,
              father_occupation || null,
            ],
          );
        }
        if (mother_name) {
          await pool.query(
            `INSERT INTO guardians (student_id, relation, full_name, phone, occupation) VALUES (?, 'mother', ?, ?, ?)`,
            [
              newStudentId,
              mother_name,
              mother_phone || null,
              mother_occupation || null,
            ],
          );
        }
        if (guardian_name) {
          const rel = guardian_relation || "guardian";
          await pool.query(
            `INSERT INTO guardians (student_id, relation, full_name, phone) VALUES (?, ?, ?, ?)`,
            [newStudentId, rel, guardian_name, guardian_phone || null],
          );
        }
      }
    } else {
      // Update Staff Profiles Table
      const [staffRows] = await pool.query(
        "SELECT id FROM staff_profiles WHERE user_id = ?",
        [userId],
      );
      const fname = first_name || (full_name ? full_name.split(" ")[0] : null);
      const lname =
        last_name ||
        (full_name ? full_name.split(" ").slice(1).join(" ") : null);
      const empCode =
        employee_code || `TS-EMP-${String(userId).padStart(3, "0")}`;

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
          ],
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
            designation || null,
            department || null,
            qualification || null,
            phone || null,
            emergency_contact || null,
            address || null,
            gender || null,
            date_of_birth || null,
            joining_date || null,
          ],
        );
      }
    }

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
