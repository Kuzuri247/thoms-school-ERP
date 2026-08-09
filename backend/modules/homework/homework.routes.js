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
    const { section_id, subject_id, title, description, attachment_path, classroom_url, due_date, session_id } = req.body;
    if (!section_id || !title || !due_date) {
      return res.status(400).json({ success: false, message: 'Section, title, and due_date are required' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 1);

    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 4);

    const dueDateObj = new Date(due_date);
    dueDateObj.setHours(0, 0, 0, 0);

    if (dueDateObj < minDate) {
      return res.status(400).json({
        success: false,
        message: 'Homework due date must be at least 1 day ahead from today (tomorrow or later).'
      });
    }

    if (dueDateObj > maxDate) {
      return res.status(400).json({
        success: false,
        message: 'Homework due date cannot be more than 4 months in advance.'
      });
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
      classroom_url,
      due_date,
      session_id: activeSessionId,
    }, req.user.id);

    res.status(201).json({ success: true, message: 'Homework assigned successfully', homeworkId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Teacher lists homework assigned by themselves
router.get('/teacher', verifyToken, authorize(ROLES.TEACHER), async (req, res) => {
  try {
    const rows = await svc.listForTeacher(req.user.id);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin lists all homeworks across the institution
router.get('/admin/all', verifyToken, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const rows = await svc.listAllForAdmin();
    res.json({ success: true, data: rows });
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

// Student updates status (completed/pending)
router.put('/status', verifyToken, authorize(ROLES.STUDENT), async (req, res) => {
  try {
    const { homework_id, status, remarks } = req.body;
    const [[student]] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    await svc.updateStatus(homework_id, student.id, status || 'completed', req.user.id, remarks);
    res.json({ success: true, message: 'Homework status updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Teacher or Admin deletes homework
router.delete('/:id', verifyToken, authorize(ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    if (req.user.role === ROLES.TEACHER) {
      const [[hw]] = await pool.query('SELECT assigned_by FROM homework WHERE id = ?', [req.params.id]);
      if (!hw || Number(hw.assigned_by) !== Number(req.user.id)) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this homework assignment' });
      }
    }
    await svc.deleteHomework(req.params.id);
    res.json({ success: true, message: 'Homework deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
