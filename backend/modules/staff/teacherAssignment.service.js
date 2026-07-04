// backend/modules/staff/teacherAssignment.service.js
const pool = require('../../config/db');

/**
 * Assign a teacher as CLASS TEACHER of a section.
 * Enforces:
 *  - A section can only have one class teacher per session.
 *  - A teacher can only be class teacher of one section per session.
 */
const assignClassTeacher = async (teacherUserId, sectionId, sessionId) => {
  const [[existingForSection]] = await pool.query(
    'SELECT id FROM teacher_assignments WHERE section_id = ? AND session_id = ? AND is_class_teacher = 1',
    [sectionId, sessionId]
  );
  if (existingForSection) {
    throw Object.assign(new Error('This section already has a class teacher for this session'), { status: 409 });
  }

  const [[alreadyClassTeacherElsewhere]] = await pool.query(
    'SELECT id FROM teacher_assignments WHERE teacher_user_id = ? AND session_id = ? AND is_class_teacher = 1',
    [teacherUserId, sessionId]
  );
  if (alreadyClassTeacherElsewhere) {
    throw Object.assign(new Error('Teacher is already class teacher of another section this session'), { status: 409 });
  }

  await pool.query(
    `INSERT INTO teacher_assignments (teacher_user_id, section_id, session_id, is_class_teacher)
     VALUES (?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE is_class_teacher = 1`,
    [teacherUserId, sectionId, sessionId]
  );
};

/**
 * Assign a teacher as SUBJECT TEACHER for a section/subject.
 * No restriction — a teacher can teach multiple sections/subjects.
 */
const assignSubjectTeacher = async (teacherUserId, sectionId, subjectId, sessionId) => {
  await pool.query(
    `INSERT INTO teacher_assignments (teacher_user_id, section_id, subject_id, session_id, is_class_teacher)
     VALUES (?, ?, ?, ?, 0)
     ON DUPLICATE KEY UPDATE subject_id = VALUES(subject_id)`,
    [teacherUserId, sectionId, subjectId, sessionId]
  );
};

const removeAssignment = async (assignmentId) => {
  await pool.query('DELETE FROM teacher_assignments WHERE id = ?', [assignmentId]);
};

const listForTeacher = async (teacherUserId, sessionId) => {
  const [rows] = await pool.query(
    `SELECT ta.*, sec.name AS section_name, cl.name AS class_name, sub.name AS subject_name
     FROM teacher_assignments ta
     JOIN sections sec ON ta.section_id = sec.id
     JOIN classes cl ON sec.class_id = cl.id
     LEFT JOIN subjects sub ON ta.subject_id = sub.id
     WHERE ta.teacher_user_id = ? AND ta.session_id = ?`,
    [teacherUserId, sessionId]
  );
  return rows;
};

const listAllTeachersWithAssignments = async () => {
  const [rows] = await pool.query(
    `SELECT sp.employee_code, sp.first_name, sp.last_name, u.id AS user_id, u.email,
            ta.section_id, ta.is_class_teacher, sec.name AS section_name,
            cl.name AS class_name, sub.name AS subject_name
     FROM staff_profiles sp
     JOIN users u ON sp.user_id = u.id
     LEFT JOIN teacher_assignments ta ON ta.teacher_user_id = u.id
     LEFT JOIN sections sec ON ta.section_id = sec.id
     LEFT JOIN classes cl ON sec.class_id = cl.id
     LEFT JOIN subjects sub ON ta.subject_id = sub.id
     WHERE u.role = 'teacher'
     ORDER BY sp.first_name`
  );
  return rows;
};

module.exports = {
  assignClassTeacher,
  assignSubjectTeacher,
  removeAssignment,
  listForTeacher,
  listAllTeachersWithAssignments,
};