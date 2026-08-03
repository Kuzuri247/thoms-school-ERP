const pool = require('../config/db');
const bcrypt = require('bcrypt');

async function fix() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Get or create section for Class 10 (id: 12)
    const [sec10] = await conn.query('SELECT id FROM sections WHERE class_id = 12 LIMIT 1');
    let sectionId10;
    if (sec10.length > 0) {
      sectionId10 = sec10[0].id;
    } else {
      const [newSec] = await conn.query('INSERT INTO sections (class_id, name) VALUES (12, "A")');
      sectionId10 = newSec.insertId;
    }

    // Move student 29 to Class 10 section
    await conn.query('UPDATE students SET section_id = ? WHERE id = 29', [sectionId10]);
    console.log('Moved Rohan Sharma (student_id 29) to Class 10!');

    // Add Aanya Verma to Class 10
    const pass = await bcrypt.hash('123456', 8);
    const [uRes] = await conn.query(
      'INSERT INTO users (email, password, role, full_name, phone, gender, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['aanya.verma10@student.thomson.edu', pass, 'student', 'Aanya Verma', '9876543220', 'Female', 'Active']
    );
    const uId = uRes.insertId;
    const [sRes] = await conn.query(
      `INSERT INTO students (user_id, section_id, admission_no, roll_no, first_name, last_name, gender, date_of_birth, address, status)
       VALUES (?, ?, 'TS-2026-10-002', '102', 'Aanya', 'Verma', 'Female', '2010-08-20', '45 Park Street, Delhi', 'Active')`,
      [uId, sectionId10]
    );

    await conn.query(
      `INSERT INTO guardians (student_id, relation, full_name, phone, occupation) VALUES (?, 'father', 'Vikas Verma', '9876543221', 'Doctor')`,
      [sRes.insertId]
    );

    await conn.commit();
    console.log('SUCCESS: Added Aanya Verma to Class 10!');
  } catch (e) {
    if (conn) await conn.rollback();
    console.error(e);
    process.exitCode = 1;
  } finally {
    if (conn) conn.release();
  }
}
fix();
