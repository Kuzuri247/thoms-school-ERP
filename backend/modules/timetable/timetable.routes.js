// backend/modules/timetable/timetable.routes.js
const router = require('express').Router();
const pool = require('../../config/db');
const { verifyToken } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { ROLES } = require('../../config/constants');

const canManage = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

// Admin creates a timetable slot (lecture or break)
router.post('/', verifyToken, authorize(...canManage), async (req, res) => {
  const { section_id, subject_id, teacher_user_id, day_of_week, period_no, start_time, end_time, session_id, is_break } = req.body;

  if (!is_break) {
    const [[clash]] = await pool.query(
      `SELECT id FROM timetables WHERE teacher_user_id = ? AND day_of_week = ? AND period_no = ? AND session_id = ?`,
      [teacher_user_id, day_of_week, period_no, session_id]
    );
    if (clash) return res.status(409).json({ success: false, message: 'Teacher already scheduled at this time' });
  }

  await pool.query(
    `INSERT INTO timetables (section_id, subject_id, teacher_user_id, day_of_week, period_no, start_time, end_time, session_id, is_break)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [section_id, subject_id || null, teacher_user_id, day_of_week, period_no, start_time, end_time, session_id, is_break ? 1 : 0]
  );
  res.status(201).json({ success: true, message: 'Timetable slot created' });
});

router.delete('/:id', verifyToken, authorize(...canManage), async (req, res) => {
  await pool.query('DELETE FROM timetables WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Slot removed' });
});

// Full timetable for a section (any authenticated role can view)
router.get('/section/:sectionId', verifyToken, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT t.*, sub.name AS subject_name, u.full_name AS teacher_name
     FROM timetables t
     LEFT JOIN subjects sub ON t.subject_id = sub.id
     LEFT JOIN users u ON t.teacher_user_id = u.id
     WHERE t.section_id = ? AND t.session_id = (SELECT id FROM academic_sessions WHERE is_current = 1)
     ORDER BY t.day_of_week, t.period_no`,
    [req.params.sectionId]
  );
  res.json({ success: true, data: rows });
});

// Teacher's own weekly schedule across all assigned classes (incl. breaks)
router.get('/my-schedule', verifyToken, authorize(ROLES.TEACHER), async (req, res) => {
  const [rows] = await pool.query(
    `SELECT t.*, sec.name AS section_name, cl.name AS class_name, sub.name AS subject_name
     FROM timetables t
     JOIN sections sec ON t.section_id = sec.id
     JOIN classes cl ON sec.class_id = cl.id
     LEFT JOIN subjects sub ON t.subject_id = sub.id
     WHERE t.teacher_user_id = ? AND t.session_id = (SELECT id FROM academic_sessions WHERE is_current = 1)
     ORDER BY t.day_of_week, t.period_no`,
    [req.user.id]
  );
  res.json({ success: true, data: rows });
});

module.exports = router;