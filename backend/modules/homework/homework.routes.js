// backend/modules/homework/homework.routes.js
const router = require('express').Router();
const { verifyToken } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { attachTeacherContext } = require('../../middleware/teacherContext');
const { ROLES } = require('../../config/constants');
const svc = require('./homework.service');
const pool = require('../../config/db');

// Teacher assigns homework
router.post('/', verifyToken, authorize(ROLES.TEACHER), attachTeacherContext, async (req, res) => {
  try {
    const { section_id, subject_id, title, description, attachment_path, due_date, session_id } = req.body;
    if (!section_id || !title || !due_date) {
      return res.status(400).json({ success: false, message: 'Section, title, and due_date are required' });
    }

    const ctx = req.teacherContext;
    const isClassTeacher = ctx?.classTeacherOf === Number(section_id);
    const isSubjectTeacher = ctx?.subjectSections?.some(
      s => Number(s.section_id) === Number(section_id) && (!subject_id || Number(s.subject_id) === Number(subject_id))
    );

    if (!isClassTeacher && !isSubjectTeacher) {
      return res.status(403).json({ success: false, message: 'Not authorized to assign homework to this section or subject' });
    }

    let activeSessionId = session_id;
    if (!activeSessionId) {
      const [[sess]] = await pool.query('SELECT id FROM academic_sessions WHERE is_current = 1 LIMIT 1');
      activeSessionId = sess?.id || 1;
    }

    const homeworkId = await svc.create({
      section_id,
      subject_id,
      title,
      description,
      attachment_path,
      due_date,
      session_id: activeSessionId,
    }, req.user.id);

    res.status(201).json({ success: true, message: 'Homework assigned successfully', homeworkId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Teacher lists homework for a section
router.get('/section/:sectionId', verifyToken, authorize(ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const rows = await svc.listForSection(req.params.sectionId);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Student fetches assigned homework / work
router.get('/student/my-work', verifyToken, authorize(ROLES.STUDENT), async (req, res) => {
  try {
    const [[student]] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const rows = await svc.getForStudent(student.id);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
