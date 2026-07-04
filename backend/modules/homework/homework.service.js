// backend/modules/homework/homework.service.js
const pool = require('../../config/db');

const create = async (data, assignedBy) => {
  const [result] = await pool.query(
    `INSERT INTO homework (section_id, subject_id, title, description, attachment_path, assigned_by, assigned_date, due_date, session_id)
     VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, ?)`,
    [
      data.section_id,
      data.subject_id || null,
      data.title,
      data.description || null,
      data.attachment_path || null,
      assignedBy,
      data.due_date,
      data.session_id,
    ]
  );

  await pool.query(
    `INSERT INTO homework_submissions (homework_id, student_id, status)
     SELECT ?, id, 'pending' FROM students WHERE section_id = ? AND status = 'active'`,
    [result.insertId, data.section_id]
  );

  return result.insertId;
};

const updateStatus = async (homeworkId, studentId, status, markedBy, remarks) => {
  await pool.query(
    `UPDATE homework_submissions
     SET status = ?, remarks = ?, marked_by = ?, submitted_at = IF(? = 'completed', NOW(), submitted_at)
     WHERE homework_id = ? AND student_id = ?`,
    [status, remarks || null, markedBy, status, homeworkId, studentId]
  );
};

const listForSection = async (sectionId) => {
  const [rows] = await pool.query(
    `SELECT h.*, sub.name AS subject_name,
       COUNT(hs.id) AS total_students,
       SUM(hs.status = 'completed') AS completed_count
     FROM homework h
     LEFT JOIN subjects sub ON h.subject_id = sub.id
     LEFT JOIN homework_submissions hs ON hs.homework_id = h.id
     WHERE h.section_id = ?
     GROUP BY h.id
     ORDER BY h.due_date DESC`,
    [sectionId]
  );
  return rows;
};

const getSubmissionsForHomework = async (homeworkId) => {
  const [rows] = await pool.query(
    `SELECT hs.*, s.first_name, s.last_name, s.roll_no
     FROM homework_submissions hs
     JOIN students s ON hs.student_id = s.id
     WHERE hs.homework_id = ?
     ORDER BY s.roll_no`,
    [homeworkId]
  );
  return rows;
};

const getForStudent = async (studentId) => {
  const [rows] = await pool.query(
    `SELECT h.id AS homework_id, h.title, h.description, h.due_date, h.assigned_date,
            sub.name AS subject_name, hs.status, hs.remarks, hs.submitted_at
     FROM homework_submissions hs
     JOIN homework h ON hs.homework_id = h.id
     LEFT JOIN subjects sub ON h.subject_id = sub.id
     WHERE hs.student_id = ?
     ORDER BY h.due_date DESC`,
    [studentId]
  );
  return rows;
};

module.exports = { create, updateStatus, listForSection, getSubmissionsForHomework, getForStudent };