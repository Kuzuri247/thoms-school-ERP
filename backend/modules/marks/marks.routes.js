// backend/modules/marks/marks.routes.js
const router = require('express').Router();
const pool = require('../../config/db');
const { verifyToken } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { attachTeacherContext } = require('../../middleware/teacherContext');
const { ROLES } = require('../../config/constants');
const svc = require('./marks.service');

// Teacher enters marks: subject teacher for own subject, OR class teacher can override any subject in own section
router.post(
  '/exam/:examId/subject/:subjectId/bulk',
  verifyToken,
  authorize(ROLES.TEACHER),
  attachTeacherContext,
  async (req, res) => {
    const { subjectId } = req.params;
    const ctx = req.teacherContext;

    const isAssignedSubjectTeacher = ctx.subjectSections.some(s => String(s.subject_id) === String(subjectId));
    const isClassTeacherOverride = !!ctx.classTeacherOf;

    if (!isAssignedSubjectTeacher && !isClassTeacherOverride) {
      return res.status(403).json({ success: false, message: 'Not authorized to enter marks for this subject' });
    }

    await svc.bulkUpsert(req.params.examId, subjectId, req.body.entries, req.user.id);
    res.json({ success: true, message: 'Marks saved' });
  }
);

// Student views own report card for an exam
router.get('/student/:studentId/exam/:examId', verifyToken, async (req, res) => {
  if (req.user.role === ROLES.STUDENT) {
    const [[owns]] = await pool.query('SELECT id FROM students WHERE id = ? AND user_id = ?', [req.params.studentId, req.user.id]);
    if (!owns) return res.status(403).json({ success: false, message: 'Cannot view other student marks' });
  }
  const rows = await svc.getStudentReport(req.params.studentId, req.params.examId);
  res.json({ success: true, data: rows });
});

// Weighted half-year result (2 internals + semester)
router.get('/student/:studentId/half-year/:halfYear', verifyToken, async (req, res) => {
  const [[student]] = await pool.query(
    'SELECT s.session_id, sec.class_id, u.id AS user_id FROM students s JOIN users u ON s.user_id = u.id LEFT JOIN sections sec ON s.section_id = sec.id WHERE s.id = ?',
    [req.params.studentId]
  );
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  if (req.user.role === ROLES.STUDENT && student.user_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Cannot view other student marks' });
  }

  const rows = await svc.getHalfYearResult(req.params.studentId, student.session_id, req.params.halfYear, student.class_id);
  res.json({ success: true, data: rows });
});

module.exports = router;
