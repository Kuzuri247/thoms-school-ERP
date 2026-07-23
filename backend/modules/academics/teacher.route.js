const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const { verifyToken } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { attachTeacherContext } = require('../../middleware/teacherContext');
const { ROLES } = require('../../config/constants');

router.get('/classes', verifyToken, authorize(ROLES.TEACHER), attachTeacherContext, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT sec.id AS section_id, c.id AS class_id, c.name AS class_name, sec.name AS section_name,
             sub.id AS subject_id, sub.name AS subject_name, ta.is_class_teacher
      FROM teacher_assignments ta
      JOIN sections sec ON ta.section_id = sec.id
      JOIN classes c ON sec.class_id = c.id
      LEFT JOIN subjects sub ON ta.subject_id = sub.id
      WHERE ta.teacher_user_id = ?
    `, [req.user.id]);

    const classes = rows.map(r => ({
      id: r.class_id,
      section_id: r.section_id,
      name: `${r.class_name} - ${r.section_name}`,
      subject_id: r.subject_id,
      subject: r.subject_name || 'General',
      role: r.is_class_teacher ? 'Class Teacher' : 'Subject Teacher',
      is_class_teacher: Boolean(r.is_class_teacher)
    }));

    res.json({ success: true, data: classes, teacherContext: req.teacherContext });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/classes/:classId/students', verifyToken, authorize(ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const { classId } = req.params;
    const [rows] = await pool.query(`
      SELECT s.id, s.admission_no AS roll, s.roll_no, CONCAT(s.first_name, ' ', s.last_name) AS name, 
             'Present' AS attendance, 0 AS englishMark
      FROM students s
      JOIN sections sec ON s.section_id = sec.id
      WHERE sec.class_id = ? OR sec.id = ?
      ORDER BY s.roll_no, s.first_name
    `, [classId, classId]);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/my-timetable', verifyToken, authorize(ROLES.TEACHER), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.id, t.day_of_week, t.period_no, t.start_time, t.end_time,
             c.name AS class_name, sec.name AS section_name, sub.name AS subject_name
      FROM timetables t
      JOIN sections sec ON t.section_id = sec.id
      JOIN classes c ON sec.class_id = c.id
      JOIN subjects sub ON t.subject_id = sub.id
      WHERE t.teacher_user_id = ?
      ORDER BY t.day_of_week, t.period_no
    `, [req.user.id]);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
