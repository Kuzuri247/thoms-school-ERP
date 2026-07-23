// backend/modules/marks/marks.routes.js
const router = require('express').Router();
const pool = require('../../config/db');
const { verifyToken } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { attachTeacherContext } = require('../../middleware/teacherContext');
const { ROLES } = require('../../config/constants');
const svc = require('./marks.service');

// Configure exam term weightages (Admin & Super Admin only)
// App-layer validation: internal_1_weight + internal_2_weight + semester_weight MUST sum to 100.00%
router.post(
  '/weightage',
  verifyToken,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  async (req, res) => {
    try {
      const { session_id, class_id, half_year, internal_1_weight, internal_2_weight, semester_weight } = req.body;
      
      const w1 = parseFloat(internal_1_weight || 0);
      const w2 = parseFloat(internal_2_weight || 0);
      const w3 = parseFloat(semester_weight || 0);

      if (Math.round((w1 + w2 + w3) * 100) / 100 !== 100) {
        return res.status(400).json({
          success: false,
          message: 'Total exam weightages must sum to exactly 100% (e.g. 20% + 20% + 60%)',
        });
      }

      const activeClassId = class_id ? Number(class_id) : null;

      const [result] = await pool.query(
        `INSERT INTO exam_weightage (session_id, class_id, half_year, internal_1_weight, internal_2_weight, semester_weight)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           internal_1_weight = VALUES(internal_1_weight),
           internal_2_weight = VALUES(internal_2_weight),
           semester_weight = VALUES(semester_weight)`,
        [session_id || 1, activeClassId, half_year || 'H1', w1, w2, w3]
      );

      res.status(200).json({
        success: true,
        message: 'Exam weightage configured successfully',
        id: result.insertId || result.id,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// Teacher enters marks: subject teacher for own subject, OR class teacher can override any subject in own section
router.post(
  '/exam/:examId/subject/:subjectId/bulk',
  verifyToken,
  authorize(ROLES.TEACHER),
  attachTeacherContext,
  async (req, res) => {
    try {
      const { subjectId } = req.params;
      const ctx = req.teacherContext;

      const isAssignedSubjectTeacher = ctx.subjectSections?.some(s => String(s.subject_id) === String(subjectId));
      const isClassTeacherOverride = !!ctx.classTeacherOf;

      if (!isAssignedSubjectTeacher && !isClassTeacherOverride) {
        return res.status(403).json({ success: false, message: 'Not authorized to enter marks for this subject' });
      }

      await svc.bulkUpsert(req.params.examId, subjectId, req.body.entries, req.user.id);
      res.json({ success: true, message: 'Marks saved successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// Student fetches own marks directly (Parameterless Self-Ownership)
router.get('/student/my-marks', verifyToken, authorize(ROLES.STUDENT), async (req, res) => {
  try {
    const [[student]] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const [rows] = await pool.query(`
      SELECT m.*, s.name as subject_name, e.name as exam_name
      FROM marks m
      JOIN subjects s ON m.subject_id = s.id
      JOIN exams e ON m.exam_id = e.id
      WHERE m.student_id = ?
    `, [student.id]);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Student views own report card for an exam (Self Student, Admin, Super Admin)
router.get('/student/:studentId/exam/:examId', verifyToken, authorize(ROLES.STUDENT, ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    if (req.user.role === ROLES.STUDENT) {
      const [[owns]] = await pool.query('SELECT id FROM students WHERE id = ? AND user_id = ?', [req.params.studentId, req.user.id]);
      if (!owns) return res.status(403).json({ success: false, message: 'Cannot view other student marks' });
    }
    const rows = await svc.getStudentReport(req.params.studentId, req.params.examId);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Weighted half-year result (2 internals + semester)
router.get('/student/:studentId/half-year/:halfYear', verifyToken, authorize(ROLES.STUDENT, ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// All marks for a student
router.get('/student/:studentId', verifyToken, authorize(ROLES.STUDENT, ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    if (req.user.role === ROLES.STUDENT) {
      const [[owns]] = await pool.query('SELECT id FROM students WHERE id = ? AND user_id = ?', [req.params.studentId, req.user.id]);
      if (!owns) return res.status(403).json({ success: false, message: 'Cannot view other student marks' });
    }
    const [rows] = await pool.query(`
      SELECT m.*, s.name as subject_name, e.name as exam_name
      FROM marks m
      JOIN subjects s ON m.subject_id = s.id
      JOIN exams e ON m.exam_id = e.id
      WHERE m.student_id = ?
    `, [req.params.studentId]);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
