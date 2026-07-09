const pool = require('../config/db');

/**
 * Attaches req.teacherContext = {
 *   classTeacherOf: sectionId|null,
 *   subjectSections: [{ section_id, subject_id }]
 * }
 * Only runs for role === 'teacher'; no-op for other roles.
 */
const attachTeacherContext = async (req, res, next) => {
  if (req.user.role !== 'teacher') return next();

  try {
    const [rows] = await pool.query(
      `SELECT section_id, subject_id, is_class_teacher
       FROM teacher_assignments
       WHERE teacher_user_id = ?
         AND session_id = (SELECT id FROM academic_sessions WHERE is_current = 1 LIMIT 1)`,
      [req.user.id]
    );

    req.teacherContext = {
      classTeacherOf: rows.find(r => r.is_class_teacher)?.section_id || null,
      subjectSections: rows
        .filter(r => r.subject_id)
        .map(r => ({ section_id: r.section_id, subject_id: r.subject_id })),
    };
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { attachTeacherContext };