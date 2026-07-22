// backend/modules/attendance/attendance.routes.js
const router = require('express').Router();
const { verifyToken } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { attachTeacherContext } = require('../../middleware/teacherContext');
const { ROLES } = require('../../config/constants');
const svc = require('./attendance.service');
const pool = require('../../config/db');

// Class teacher marks attendance — ONLY for their own homeroom section
router.post('/mark', verifyToken, authorize(ROLES.TEACHER), attachTeacherContext, async (req, res) => {
  const { section_id, date, records } = req.body;

  if (!req.teacherContext?.classTeacherOf || req.teacherContext.classTeacherOf !== Number(section_id)) {
    return res.status(403).json({ success: false, message: 'Teachers can ONLY mark attendance for their assigned class' });
  }

  await svc.markBulk(section_id, date, records, req.user.id);
  res.json({ success: true, message: 'Attendance saved' });
});

// Attendance calendar view with present percentages
router.get('/calendar/:sectionId', verifyToken, authorize(ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  const { month, year } = req.query;
  const rows = await svc.getSectionCalendar(req.params.sectionId, month, year);
  res.json({ success: true, data: rows });
});

// Teacher/Admin views attendance sheet for a section+date
router.get('/section/:sectionId/date/:date', verifyToken, authorize(ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  const rows = await svc.getForSectionDate(req.params.sectionId, req.params.date);
  res.json({ success: true, data: rows });
});

// Student views own monthly attendance summary
router.get('/student/:studentId/summary/:month/:year', verifyToken, async (req, res) => {
  if (req.user.role === ROLES.STUDENT) {
    const [[owns]] = await pool.query('SELECT id FROM students WHERE id = ? AND user_id = ?', [req.params.studentId, req.user.id]);
    if (!owns) return res.status(403).json({ success: false, message: 'Cannot view other student attendance' });
  }
  const data = await svc.getStudentSummary(req.params.studentId, req.params.month, req.params.year);
  res.json({ success: true, data });
});

// Admin view section-wide monthly summary
router.get('/section/:sectionId/summary/:month/:year', verifyToken, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  const rows = await svc.getSectionSummary(req.params.sectionId, req.params.month, req.params.year);
  res.json({ success: true, data: rows });
});

module.exports = router;