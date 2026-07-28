const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken } = require("../middleware/auth");
const { authorize } = require("../middleware/rbac");
const { ROLES } = require("../config/constants");

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

    // Access check: allow if self, admin, teacher, or if target profile is a student (visible to all staff & peers)
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
                s.address, s.city, s.state, s.pincode, s.admission_date, s.status AS student_status,
                c.name AS class_name
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
          guardians.forEach(g => {
            if (g.relation === 'father') {
              guardianFields.father_name = g.full_name;
              guardianFields.father_phone = g.phone;
              guardianFields.father_occupation = g.occupation;
            } else if (g.relation === 'mother') {
              guardianFields.mother_name = g.full_name;
              guardianFields.mother_phone = g.phone;
              guardianFields.mother_occupation = g.occupation;
            } else if (g.relation === 'guardian') {
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
          full_name: profileData.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
          class_name: student.class_name || profileData.class || 'Class 10',
          profile_type: "student",
        };
      }
    } else {
      // For teacher, admin, principal, staff, etc.
      const [staff] = await pool.query(
        "SELECT employee_code, first_name, last_name, designation, department, joining_date, qualification, phone as emergency_phone FROM staff_profiles WHERE user_id = ?",
        [userId],
      );
      if (staff.length > 0) {
        profileData = { ...profileData, ...staff[0], profile_type: "staff" };
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
    const userId = req.params.id;
    const isSelf = Number(req.user?.id) === Number(userId);
    const isAdmin = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(req.user?.role);

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { full_name, email, phone, designation } = req.body;

    await pool.query(
      "UPDATE users SET full_name = COALESCE(?, full_name), email = COALESCE(?, email), phone = COALESCE(?, phone) WHERE id = ?",
      [full_name || null, email || null, phone || null, userId],
    );

    if (designation) {
      await pool.query(
        "UPDATE staff_profiles SET designation = ? WHERE user_id = ?",
        [designation, userId],
      );
    }

    res.json({ success: true, message: "Profile updated successfully in DB" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
