// backend/modules/marks/marks.service.js
const pool = require('../../config/db');

const bulkUpsert = async (examId, subjectId, entries, enteredBy) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const e of entries) {
      await conn.query(
        `INSERT INTO marks (exam_id, student_id, subject_id, marks_obtained, max_marks, grade, entered_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE marks_obtained = VALUES(marks_obtained), grade = VALUES(grade)`,
        [examId, e.student_id, subjectId, e.marks, e.max_marks || 100, e.grade || null, enteredBy]
      );
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const getStudentReport = async (studentId, examId) => {
  const [rows] = await pool.query(
    `SELECT m.*, s.name AS subject_name, s.code, e.name AS exam_name, e.exam_type, e.half_year
     FROM marks m
     JOIN subjects s ON m.subject_id = s.id
     JOIN exams e ON m.exam_id = e.id
     WHERE m.student_id = ? AND m.exam_id = ?`,
    [studentId, examId]
  );
  return rows;
};

// Weighted half-year result using exam_weightage config
const getHalfYearResult = async (studentId, sessionId, halfYear, classId) => {
  const [[weight]] = await pool.query(
    'SELECT * FROM exam_weightage WHERE session_id = ? AND half_year = ?',
    [sessionId, halfYear]
  );
  const w = weight || { internal_1_weight: 20, internal_2_weight: 20, semester_weight: 60 };

  const [rows] = await pool.query(
    `SELECT sub.id AS subject_id, sub.name AS subject_name,
       MAX(CASE WHEN e.exam_type = 'internal_1' THEN (m.marks_obtained / m.max_marks) * 100 END) AS internal_1_pct,
       MAX(CASE WHEN e.exam_type = 'internal_2' THEN (m.marks_obtained / m.max_marks) * 100 END) AS internal_2_pct,
       MAX(CASE WHEN e.exam_type = 'semester' THEN (m.marks_obtained / m.max_marks) * 100 END) AS semester_pct
     FROM subjects sub
     LEFT JOIN marks m ON m.subject_id = sub.id AND m.student_id = ?
     LEFT JOIN exams e ON m.exam_id = e.id AND e.half_year = ? AND e.session_id = ?
     WHERE sub.class_id = ?
     GROUP BY sub.id, sub.name`,
    [studentId, halfYear, sessionId, classId]
  );

  return rows.map(r => {
    const weighted =
      ((r.internal_1_pct || 0) * (w.internal_1_weight / 100)) +
      ((r.internal_2_pct || 0) * (w.internal_2_weight / 100)) +
      ((r.semester_pct || 0) * (w.semester_weight / 100));
    return { ...r, weighted_percentage: Math.round(weighted * 100) / 100 };
  });
};

module.exports = { bulkUpsert, getStudentReport, getHalfYearResult };