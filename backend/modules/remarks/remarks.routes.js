const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const { verifyToken } = require("../../middleware/auth");
const { ROLES } = require("../../config/constants");

/**
 * GET /api/remarks/student/:studentId
 * Fetch all monthly remarks for a specific student by student_id or user_id
 */
router.get("/student/:studentId", verifyToken, async (req, res) => {
  try {
    const paramId = req.params.studentId;

    // Resolve student_id if paramId is user_id
    const [stuRows] = await pool.query(
      `SELECT s.id AS student_id, s.user_id, s.first_name, s.last_name, sec.id AS section_id, c.name AS class_name, sec.name AS section_name
       FROM students s
       LEFT JOIN sections sec ON s.section_id = sec.id
       LEFT JOIN classes c ON sec.class_id = c.id
       WHERE s.id = ? OR s.user_id = ?`,
      [paramId, paramId],
    );

    if (stuRows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const studentId = stuRows[0].student_id;

    const [remarks] = await pool.query(
      `SELECT sr.id, sr.student_id, sr.teacher_user_id, sr.section_id, sr.session_id,
              sr.month, sr.year, sr.remark, sr.tags, sr.created_at, sr.updated_at,
              COALESCE(CONCAT(sp.first_name, ' ', sp.last_name), u.full_name, 'Class Teacher') AS teacher_name,
              sp.designation AS teacher_designation,
              c.name AS class_name, sec.name AS section_name
       FROM student_remarks sr
       LEFT JOIN users u ON sr.teacher_user_id = u.id
       LEFT JOIN staff_profiles sp ON u.id = sp.user_id
       LEFT JOIN sections sec ON sr.section_id = sec.id
       LEFT JOIN classes c ON sec.class_id = c.id
       WHERE sr.student_id = ?
       ORDER BY sr.year DESC, sr.month DESC, sr.created_at DESC`,
      [studentId],
    );

    res.json({ success: true, data: remarks });
  } catch (error) {
    console.error("Error fetching student remarks:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/remarks/section/:sectionId
 * Fetch student roster for a section with monthly remarks for CURRENT month & year (or specified)
 */
router.get("/section/:sectionId", verifyToken, async (req, res) => {
  try {
    const { sectionId } = req.params;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // If teacher, strictly enforce current month & year
    const isTeacher = req.user.role === ROLES.TEACHER;
    const month = isTeacher ? currentMonth : parseInt(req.query.month) || currentMonth;
    const year = isTeacher ? currentYear : parseInt(req.query.year) || currentYear;

    // Fetch active students in section
    const [students] = await pool.query(
      `SELECT s.id AS student_id, s.user_id, s.admission_no, s.roll_no,
              s.first_name, s.last_name, CONCAT(s.first_name, ' ', s.last_name) AS full_name
       FROM students s
       WHERE s.section_id = ? AND s.status = 'active'
       ORDER BY CAST(s.roll_no AS UNSIGNED), s.first_name`,
      [sectionId],
    );

    // Fetch existing remarks for this section/month/year
    const [existingRemarks] = await pool.query(
      `SELECT id AS remark_id, student_id, remark, tags, teacher_user_id, updated_at
       FROM student_remarks
       WHERE section_id = ? AND month = ? AND year = ?`,
      [sectionId, month, year],
    );

    const remarkMap = {};
    existingRemarks.forEach((r) => {
      remarkMap[r.student_id] = r;
    });

    const result = students.map((stu) => {
      const rem = remarkMap[stu.student_id];
      let tagArray = [];
      if (rem && rem.tags) {
        try {
          tagArray = typeof rem.tags === "string" && rem.tags.startsWith("[")
            ? JSON.parse(rem.tags)
            : rem.tags.split(",").map((t) => t.trim()).filter(Boolean);
        } catch (e) {
          tagArray = rem.tags.split(",").map((t) => t.trim()).filter(Boolean);
        }
      }

      return {
        ...stu,
        remark_id: rem ? rem.remark_id : null,
        remark: rem ? rem.remark : "",
        tags: tagArray,
        teacher_user_id: rem ? rem.teacher_user_id : null,
        updated_at: rem ? rem.updated_at : null,
        month,
        year,
      };
    });

    res.json({ success: true, data: result, month, year });
  } catch (error) {
    console.error("Error fetching section remarks:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/remarks/batch
 * Batch save/update monthly remarks for class students (Locked to current month & year for teachers)
 */
router.post("/batch", verifyToken, async (req, res) => {
  let conn;
  try {
    const { section_id, remarks } = req.body;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const userId = req.user.id;
    const userRole = req.user.role;
    const isAdmin = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(userRole);

    // For teachers, strictly lock month and year to current month & year
    const month = isAdmin ? parseInt(req.body.month) || currentMonth : currentMonth;
    const year = isAdmin ? parseInt(req.body.year) || currentYear : currentYear;

    if (!section_id || !Array.isArray(remarks)) {
      return res.status(400).json({
        success: false,
        message: "section_id and remarks array are required.",
      });
    }

    // Authorization check if user is not admin
    if (!isAdmin) {
      const [assignment] = await pool.query(
        `SELECT id FROM teacher_assignments
         WHERE teacher_user_id = ? AND section_id = ? AND is_class_teacher = 1`,
        [userId, section_id],
      );

      if (assignment.length === 0) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied: Only assigned Class Teachers can submit monthly remarks for this section.",
        });
      }
    }

    // Get active session ID if available
    const [[activeSession]] = await pool.query(
      "SELECT id FROM academic_sessions WHERE is_current = 1 LIMIT 1",
    );
    const sessionId = activeSession ? activeSession.id : null;

    conn = await pool.getConnection();
    await conn.beginTransaction();

    for (const item of remarks) {
      const studentId = item.student_id;
      const remarkText = (item.remark || "").trim();
      const tagsData = Array.isArray(item.tags)
        ? JSON.stringify(item.tags)
        : (item.tags || "").trim();

      if (!studentId) continue;

      if (remarkText.length > 0 || (Array.isArray(item.tags) && item.tags.length > 0) || tagsData.length > 0) {
        await conn.query(
          `INSERT INTO student_remarks (student_id, teacher_user_id, section_id, session_id, month, year, remark, tags)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             remark = VALUES(remark),
             tags = VALUES(tags),
             teacher_user_id = VALUES(teacher_user_id),
             session_id = VALUES(session_id),
             updated_at = CURRENT_TIMESTAMP`,
          [
            studentId,
            userId,
            section_id,
            sessionId,
            month,
            year,
            remarkText,
            tagsData,
          ],
        );
      } else {
        // If both remark and tags are emptied out, delete entry for that month
        await conn.query(
          `DELETE FROM student_remarks WHERE student_id = ? AND month = ? AND year = ?`,
          [studentId, month, year],
        );
      }
    }

    await conn.commit();
    res.json({
      success: true,
      message: "Current month remarks saved successfully!",
      month,
      year,
    });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error("Error saving monthly remarks batch:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
