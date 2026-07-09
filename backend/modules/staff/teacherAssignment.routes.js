// backend/modules/staff/teacherAssignment.routes.js
const router = require('express').Router();
const { verifyToken } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { ROLES } = require('../../config/constants');
const svc = require('./teacherAssignment.service');

const canManage = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

// Assign a teacher as class teacher of a section
router.post('/class-teacher', verifyToken, authorize(...canManage), async (req, res) => {
  const { teacher_user_id, section_id, session_id } = req.body;
  await svc.assignClassTeacher(teacher_user_id, section_id, session_id);
  res.status(201).json({ success: true, message: 'Class teacher assigned' });
});

// Assign a teacher as subject teacher for a section
router.post('/subject-teacher', verifyToken, authorize(...canManage), async (req, res) => {
  const { teacher_user_id, section_id, subject_id, session_id } = req.body;
  await svc.assignSubjectTeacher(teacher_user_id, section_id, subject_id, session_id);
  res.status(201).json({ success: true, message: 'Subject teacher assigned' });
});

router.delete('/:assignmentId', verifyToken, authorize(...canManage), async (req, res) => {
  await svc.removeAssignment(req.params.assignmentId);
  res.json({ success: true, message: 'Assignment removed' });
});

// Teacher views own assignments
router.get('/my-assignments', verifyToken, authorize(ROLES.TEACHER), async (req, res) => {
  const pool = require('../../config/db');
  const [[session]] = await pool.query('SELECT id FROM academic_sessions WHERE is_current = 1 LIMIT 1');
  const rows = await svc.listForTeacher(req.user.id, session.id);
  res.json({ success: true, data: rows });
});

// Admin/Super Admin view of all teachers + assignments
router.get('/all', verifyToken, authorize(...canManage, ROLES.SUPER_ADMIN), async (req, res) => {
  const rows = await svc.listAllTeachersWithAssignments();
  res.json({ success: true, data: rows });
});

module.exports = router;