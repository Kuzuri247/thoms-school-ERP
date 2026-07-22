// backend/modules/attendance/attendance.service.js
const pool = require('../../config/db');

const markBulk = async (sectionId, date, records, markedBy) => {
  if (!records?.length) throw Object.assign(new Error('No records provided'), { status: 400 });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const rec of records) {
      await conn.query(
        `INSERT INTO attendance (student_id, section_id, date, status, marked_by, remarks)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks)`,
        [rec.student_id, sectionId, date, rec.status, markedBy, rec.remarks || null]
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

const getForSectionDate = async (sectionId, date) => {
  const [rows] = await pool.query(
    `SELECT a.status, a.remarks, s.id AS student_id, s.first_name, s.last_name, s.roll_no, s.admission_no
     FROM students s
     LEFT JOIN attendance a ON a.student_id = s.id AND a.date = ? AND a.section_id = ?
     WHERE s.section_id = ? AND s.status = 'active'
     ORDER BY s.roll_no`,
    [date, sectionId, sectionId]
  );
  return rows;
};

const getStudentSummary = async (studentId, month, year) => {
  const [rows] = await pool.query(
    `SELECT
       COUNT(*) AS total_days,
       SUM(status = 'present') AS present,
       SUM(status = 'absent') AS absent,
       SUM(status = 'late') AS late
     FROM attendance
     WHERE student_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
    [studentId, month, year]
  );
  return rows[0];
};

const getSectionSummary = async (sectionId, month, year) => {
  const [rows] = await pool.query(
    `SELECT s.id AS student_id, s.first_name, s.last_name,
       COUNT(a.id) AS total_marked,
       SUM(a.status = 'present') AS present,
       SUM(a.status = 'absent') AS absent
     FROM students s
     LEFT JOIN attendance a ON a.student_id = s.id AND MONTH(a.date) = ? AND YEAR(a.date) = ?
     WHERE s.section_id = ?
     GROUP BY s.id`,
    [month, year, sectionId]
  );
  return rows;
};

const getSectionCalendar = async (sectionId, month, year) => {
  let query = `
    SELECT 
      DATE_FORMAT(date, '%Y-%m-%d') AS date,
      COUNT(*) AS total_records,
      SUM(status = 'present') AS present_count,
      SUM(status = 'absent') AS absent_count,
      SUM(status = 'late') AS late_count,
      ROUND((SUM(status = 'present') / COUNT(*)) * 100, 1) AS present_percentage
    FROM attendance
    WHERE section_id = ?
  `;
  const params = [sectionId];
  if (month && year) {
    query += ` AND MONTH(date) = ? AND YEAR(date) = ?`;
    params.push(month, year);
  }
  query += ` GROUP BY date ORDER BY date DESC`;

  const [rows] = await pool.query(query, params);
  return rows;
};

module.exports = { markBulk, getForSectionDate, getStudentSummary, getSectionSummary, getSectionCalendar };