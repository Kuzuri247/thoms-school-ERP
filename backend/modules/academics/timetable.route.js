const express = require('express');
const router = express.Router();
const controller = require('./academics.controller');
const pool = require('../../config/db');
const { verifyToken } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { ROLES } = require('../../config/constants');

router.get('/student/my-timetable', verifyToken, authorize(ROLES.STUDENT), async (req, res) => {
  try {
    const [[student]] = await pool.query(
      'SELECT s.section_id, sec.class_id FROM students s JOIN sections sec ON s.section_id = sec.id WHERE s.user_id = ?',
      [req.user.id]
    );
    if (!student || !student.section_id) {
      return res.status(404).json({ success: false, message: 'Student section not assigned' });
    }

    const [rows] = await pool.query(`
      SELECT t.id, t.day_of_week, t.period_no, t.start_time, t.end_time, t.room_no,
             s.name AS subject_name, u.full_name AS teacher_name
      FROM timetables t
      JOIN subjects s ON t.subject_id = s.id
      LEFT JOIN users u ON t.teacher_user_id = u.id
      WHERE t.section_id = ?
      ORDER BY t.day_of_week, t.period_no
    `, [student.section_id]);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/class/:classId', verifyToken, authorize(ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res, next) => {
  if (req.user.role === ROLES.STUDENT) {
    const [[student]] = await pool.query(
      'SELECT sec.class_id FROM students s JOIN sections sec ON s.section_id = sec.id WHERE s.user_id = ?',
      [req.user.id]
    );
    if (!student || String(student.class_id) !== String(req.params.classId)) {
      return res.status(403).json({ success: false, message: 'Cannot view timetable for other classes' });
    }
  }
  controller.getTimetableByClass(req, res, next);
});

module.exports = router;
