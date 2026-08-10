const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const rawHost = process.env.DB_HOST || 'localhost';
const cleanHost = rawHost.replace(/^(mysql:\/\/|https?:\/\/)/, '').split('/')[0].split(':')[0];
const useSSL = process.env.DB_SSL === 'true' || process.env.DB_SSL === 'REQUIRED' || cleanHost.includes('aivencloud.com');

async function seed() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: cleanHost,
      port: parseInt(process.env.DB_PORT || '28388'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'defaultdb',
      ssl: useSSL ? { rejectUnauthorized: false } : undefined,
      connectTimeout: 20000,
    });

    console.log('Connected to MySQL Database. Starting detailed mock database seed...');

    const defaultPassword = 'Thomson2026!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 8);

    // 1. Academic Session (Active session 2026-2027)
    await connection.query(`
      INSERT INTO academic_sessions (name, start_date, end_date, is_current) 
      VALUES ('2026-2027', '2026-04-01', '2027-03-31', 1)
      ON DUPLICATE KEY UPDATE is_current=1
    `);
    const [[sessRow]] = await connection.query(`SELECT id FROM academic_sessions WHERE name='2026-2027'`);
    const sessionId = sessRow.id;

    // Purge legacy data to avoid duplicates and mixed-up grades
    console.log('Purging legacy data...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    try {
      await connection.query('TRUNCATE TABLE marks');
      await connection.query('TRUNCATE TABLE exams');
      await connection.query('TRUNCATE TABLE attendance');
      await connection.query('TRUNCATE TABLE timetables');
      await connection.query('TRUNCATE TABLE homework');
      await connection.query('TRUNCATE TABLE teacher_assignments');
      await connection.query('TRUNCATE TABLE guardians');
      await connection.query('TRUNCATE TABLE students');
      await connection.query('TRUNCATE TABLE staff_profiles');
      await connection.query('TRUNCATE TABLE subjects');
      await connection.query('TRUNCATE TABLE sections');
      await connection.query('TRUNCATE TABLE classes');
      await connection.query("DELETE FROM users WHERE email LIKE '%@thomson.edu' OR role IN ('student', 'teacher', 'cashier')");
    } finally {
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    }

    // 2. Classes & Sections (14 Standards: LKG, UKG, Class 1 to 12 in exact serial order 1 to 14)
    const classDefs = [
      { name: 'LKG', num: 1 },
      { name: 'UKG', num: 2 },
      { name: 'Class 1', num: 3 },
      { name: 'Class 2', num: 4 },
      { name: 'Class 3', num: 5 },
      { name: 'Class 4', num: 6 },
      { name: 'Class 5', num: 7 },
      { name: 'Class 6', num: 8 },
      { name: 'Class 7', num: 9 },
      { name: 'Class 8', num: 10 },
      { name: 'Class 9', num: 11 },
      { name: 'Class 10', num: 12 },
      { name: 'Class 11', num: 13 },
      { name: 'Class 12', num: 14 },
    ];

    const classIds = {};
    const sectionIds = {};

    for (const c of classDefs) {
      await connection.query(`INSERT INTO classes (name, numeric_value) VALUES (?, ?)`, [c.name, c.num]);
      const [[cRow]] = await connection.query(`SELECT id FROM classes WHERE name=?`, [c.name]);
      classIds[c.name] = cRow.id;

      sectionIds[c.name] = {};
      const secName = 'Section A';
      await connection.query(`INSERT INTO sections (class_id, name, capacity) VALUES (?, ?, 40)`, [cRow.id, secName]);
      const [[sRow]] = await connection.query(`SELECT id FROM sections WHERE class_id=? AND name=?`, [cRow.id, secName]);
      sectionIds[c.name][secName] = sRow.id;
    }

    // Helper functions
    async function createUser(email, role, fullName) {
      let [existing] = await connection.query('SELECT id FROM users WHERE email=?', [email]);
      if (existing.length > 0) {
        await connection.query("UPDATE users SET password=?, role=?, full_name=?, status='active' WHERE id=?", [hashedPassword, role, fullName, existing[0].id]);
        return existing[0].id;
      }

      const [res] = await connection.query(`
        INSERT INTO users (email, password, role, full_name, status)
        VALUES (?, ?, ?, ?, 'active')
      `, [email, hashedPassword, role, fullName]);
      return res.insertId;
    }

    async function createStaff(userId, empCode, fname, lname, desc, dept = 'Academics') {
      await connection.query(`
        INSERT INTO staff_profiles (user_id, employee_code, first_name, last_name, designation, department)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE designation=VALUES(designation)
      `, [userId, empCode, fname, lname, desc, dept]);
    }

    async function createStudent(userId, admnNo, fname, lname, roll, sectionId) {
      let [existingStu] = await connection.query('SELECT id FROM students WHERE user_id = ?', [userId]);
      if (existingStu.length > 0) {
        await connection.query('UPDATE students SET section_id = ?, first_name = ?, last_name = ?, roll_no = ? WHERE id = ?', [sectionId, fname, lname, roll, existingStu[0].id]);
        return existingStu[0].id;
      }
      await connection.query(`
        INSERT INTO students (user_id, admission_no, roll_no, first_name, last_name, section_id, session_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
        ON DUPLICATE KEY UPDATE section_id=VALUES(section_id), roll_no=VALUES(roll_no)
      `, [userId, admnNo, roll, fname, lname, sectionId, sessionId]);

      let [[stuRow]] = await connection.query('SELECT id FROM students WHERE user_id = ?', [userId]);
      return stuRow?.id;
    }

    // 3. Super Admin & Admins & Cashiers
    let saId = await createUser('superadmin@thomson.edu', 'super_admin', 'Super Admin Official');

    let admin1Id = await createUser('admin@thomson.edu', 'admin', 'Principal Rajesh Sharma');
    await createStaff(admin1Id, 'ADM001', 'Rajesh', 'Sharma', 'Principal & Director', 'Management');
    
    let admin2Id = await createUser('admin2@thomson.edu', 'admin', 'Vice Principal Meenakshi');
    await createStaff(admin2Id, 'ADM002', 'Meenakshi', 'Sundaram', 'Vice Principal', 'Management');

    let cashier1Id = await createUser('cashier@thomson.edu', 'cashier', 'Senior Cashier Vikram');
    await createStaff(cashier1Id, 'CSH001', 'Vikram', 'Mehta', 'Senior Cashier & Fee Incharge', 'Finance');

    let cashier2Id = await createUser('cashier2@thomson.edu', 'cashier', 'Accountant Sunita');
    await createStaff(cashier2Id, 'CSH002', 'Sunita', 'Kapoor', 'Accounts Officer', 'Finance');

    // 4. Subjects per Class Standard (English, Mathematics, Science, Physics, Chemistry, Social Studies, Computer Science)
    const subjectList = ['English', 'Mathematics', 'Science', 'Physics', 'Chemistry', 'Social Studies', 'Computer Science'];
    const subjectIdsByClass = {};

    for (const [clsName, cId] of Object.entries(classIds)) {
      subjectIdsByClass[clsName] = {};
      for (const subjName of subjectList) {
        const code = `${subjName.substring(0, 4).toUpperCase()}-${cId}`;
        await connection.query("INSERT IGNORE INTO subjects (name, code, class_id, max_marks, pass_marks) VALUES (?, ?, ?, 100, 35)", [subjName, code, cId]);
        const [[subRow]] = await connection.query("SELECT id FROM subjects WHERE class_id = ? AND name = ?", [cId, subjName]);
        if (subRow) subjectIdsByClass[clsName][subjName] = subRow.id;
      }
    }

    // 5. Teachers & Assignments (Each teacher has a specific subject & teaches at least 2 classes)
    const teachersData = [
      { email: 'teacher.lkg@thomson.edu', code: 'TCH001', fname: 'Sunita', lname: 'Sharma', subject: 'English', desc: 'Class Teacher - LKG', homeroomCls: 'LKG', teachClasses: ['LKG', 'UKG', 'Class 1'] },
      { email: 'teacher.ukg@thomson.edu', code: 'TCH002', fname: 'Priya', lname: 'Verma', subject: 'English', desc: 'Class Teacher - UKG', homeroomCls: 'UKG', teachClasses: ['UKG', 'Class 2', 'Class 3'] },
      { email: 'teacher.c1@thomson.edu', code: 'TCH003', fname: 'Ramesh', lname: 'Gupta', subject: 'Mathematics', desc: 'Class Teacher - Class 1', homeroomCls: 'Class 1', teachClasses: ['Class 1', 'LKG', 'Class 2'] },
      { email: 'teacher.c2@thomson.edu', code: 'TCH004', fname: 'Kavita', lname: 'Singh', subject: 'Mathematics', desc: 'Class Teacher - Class 2', homeroomCls: 'Class 2', teachClasses: ['Class 2', 'Class 4', 'Class 5'] },
      { email: 'teacher.c3@thomson.edu', code: 'TCH005', fname: 'Manoj', lname: 'Kumar', subject: 'Science', desc: 'Class Teacher - Class 3', homeroomCls: 'Class 3', teachClasses: ['Class 3', 'Class 1', 'Class 4'] },
      { email: 'teacher.c4@thomson.edu', code: 'TCH006', fname: 'Rekha', lname: 'Patel', subject: 'Science', desc: 'Class Teacher - Class 4', homeroomCls: 'Class 4', teachClasses: ['Class 4', 'Class 5', 'Class 6'] },
      { email: 'teacher.c5@thomson.edu', code: 'TCH007', fname: 'Amit', lname: 'Joshi', subject: 'Social Studies', desc: 'Class Teacher - Class 5', homeroomCls: 'Class 5', teachClasses: ['Class 5', 'Class 6', 'Class 7'] },
      { email: 'teacher.c6@thomson.edu', code: 'TCH008', fname: 'Suman', lname: 'Rao', subject: 'Social Studies', desc: 'Class Teacher - Class 6', homeroomCls: 'Class 6', teachClasses: ['Class 6', 'Class 7', 'Class 8'] },
      { email: 'teacher.c7@thomson.edu', code: 'TCH009', fname: 'Deepak', lname: 'Kulkarni', subject: 'Computer Science', desc: 'Class Teacher - Class 7', homeroomCls: 'Class 7', teachClasses: ['Class 7', 'Class 8', 'Class 9'] },
      { email: 'teacher.c8@thomson.edu', code: 'TCH010', fname: 'Arvind', lname: 'Sharma', subject: 'Computer Science', desc: 'Class Teacher - Class 8', homeroomCls: 'Class 8', teachClasses: ['Class 8', 'Class 9', 'Class 10'] },
      { email: 'teacher.c9@thomson.edu', code: 'TCH011', fname: 'Anita', lname: 'Deshmukh', subject: 'English', desc: 'Class Teacher - Class 9', homeroomCls: 'Class 9', teachClasses: ['Class 9', 'Class 10', 'Class 11'] },
      { email: 'teacher@thomson.edu', code: 'TCH012', fname: 'Rajesh', lname: 'Verma', subject: 'Mathematics', desc: 'Class Teacher - Class 10 (HOD)', homeroomCls: 'Class 10', teachClasses: ['Class 10', 'Class 11', 'Class 12'] },
      { email: 'teacher.c11@thomson.edu', code: 'TCH013', fname: 'Dr. S. K.', lname: 'Gupta', subject: 'Physics', desc: 'Class Teacher - Class 11', homeroomCls: 'Class 11', teachClasses: ['Class 11', 'Class 10', 'Class 12'] },
      { email: 'teacher.c12@thomson.edu', code: 'TCH014', fname: 'Meenakshi', lname: 'Sundaram', subject: 'Chemistry', desc: 'Class Teacher - Class 12', homeroomCls: 'Class 12', teachClasses: ['Class 12', 'Class 10', 'Class 11'] },
      { email: 'teacher.phy@thomson.edu', code: 'TCH020', fname: 'Dr. Vikram', lname: 'Sarabhai', subject: 'Physics', desc: 'Physics Senior Lecturer', homeroomCls: null, teachClasses: ['Class 9', 'Class 10', 'Class 11', 'Class 12'] },
      { email: 'teacher.chem@thomson.edu', code: 'TCH021', fname: 'Priyanka', lname: 'Sen', subject: 'Chemistry', desc: 'Chemistry Senior Lecturer', homeroomCls: null, teachClasses: ['Class 9', 'Class 10', 'Class 11', 'Class 12'] },
      { email: 'teacher.eng@thomson.edu', code: 'TCH022', fname: 'David', lname: 'Miller', subject: 'English', desc: 'English Senior Lecturer', homeroomCls: null, teachClasses: ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'] },
    ];

    const teacherUserIds = {};
    const classTeacherInfoByClass = {}; // class -> { uId, subjectName, subjectId }

    for (const t of teachersData) {
      const uId = await createUser(t.email, 'teacher', `Prof. ${t.fname} ${t.lname}`);
      await createStaff(uId, t.code, t.fname, t.lname, t.desc, 'Academics');
      teacherUserIds[t.email] = uId;

      // Assign teacher to their classes
      for (const clsName of t.teachClasses) {
        const secId = sectionIds[clsName] ? sectionIds[clsName]['Section A'] : null;
        const isHomeroom = t.homeroomCls === clsName;
        const subjId = subjectIdsByClass[clsName] ? subjectIdsByClass[clsName][t.subject] : null;

        if (secId && subjId) {
          const [existingAssig] = await connection.query(
            "SELECT id FROM teacher_assignments WHERE section_id = ? AND subject_id = ? AND session_id = ?",
            [secId, subjId, sessionId]
          );
          if (existingAssig.length === 0) {
            await connection.query(`
              INSERT INTO teacher_assignments (teacher_user_id, section_id, subject_id, session_id, is_class_teacher) 
              VALUES (?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE is_class_teacher=VALUES(is_class_teacher)
            `, [uId, secId, subjId, sessionId, isHomeroom ? 1 : 0]);
          }
        }

        if (isHomeroom) {
          if (subjId) {
            classTeacherInfoByClass[clsName] = {
              uId,
              fname: t.fname,
              lname: t.lname,
              subjectName: t.subject,
              subjectId: subjId,
            };
          } else {
            console.warn(`Missing subject '${t.subject}' for class teacher of ${clsName}`);
          }
        }
      }
    }

    // 6. Students (3-5 Students in EACH Grade, Surname Sorted, Roll numbers 1, 2, 3, 4, 5)
    const rawStudentList = [
      // LKG
      { fname: 'Vihaan', lname: 'Sharma', cls: 'LKG', admn: 'TS-2026-LKG-01', email: 'vihaan.lkg@thomson.edu' },
      { fname: 'Diya', lname: 'Deshmukh', cls: 'LKG', admn: 'TS-2026-LKG-02', email: 'diya.lkg@thomson.edu' },
      { fname: 'Aarav', lname: 'Bhatia', cls: 'LKG', admn: 'TS-2026-LKG-03', email: 'aarav.lkg@thomson.edu' },
      { fname: 'Kavya', lname: 'Malhotra', cls: 'LKG', admn: 'TS-2026-LKG-04', email: 'kavya.lkg@thomson.edu' },

      // UKG
      { fname: 'Kabir', lname: 'Gupta', cls: 'UKG', admn: 'TS-2026-UKG-01', email: 'kabir.ukg@thomson.edu' },
      { fname: 'Ananya', lname: 'Agarwal', cls: 'UKG', admn: 'TS-2026-UKG-02', email: 'ananya.ukg@thomson.edu' },
      { fname: 'Reyansh', lname: 'Roy', cls: 'UKG', admn: 'TS-2026-UKG-03', email: 'reyansh.ukg@thomson.edu' },
      { fname: 'Myra', lname: 'Mehta', cls: 'UKG', admn: 'TS-2026-UKG-04', email: 'myra.ukg@thomson.edu' },

      // Class 1
      { fname: 'Reyansh', lname: 'Verma', cls: 'Class 1', admn: 'TS-2026-C01-01', email: 'reyansh.c1@thomson.edu' },
      { fname: 'Diya', lname: 'Patel', cls: 'Class 1', admn: 'TS-2026-C01-02', email: 'diya.c1@thomson.edu' },
      { fname: 'Rohan', lname: 'Chawla', cls: 'Class 1', admn: 'TS-2026-C01-03', email: 'rohan.c1@thomson.edu' },
      { fname: 'Ishaan', lname: 'Singh', cls: 'Class 1', admn: 'TS-2026-C01-04', email: 'ishaan.c1@thomson.edu' },

      // Class 2
      { fname: 'Dhruv', lname: 'Singh', cls: 'Class 2', admn: 'TS-2026-C02-01', email: 'dhruv.c2@thomson.edu' },
      { fname: 'Myra', lname: 'Kapoor', cls: 'Class 2', admn: 'TS-2026-C02-02', email: 'myra.c2@thomson.edu' },
      { fname: 'Aditya', lname: 'Nair', cls: 'Class 2', admn: 'TS-2026-C02-03', email: 'aditya.c2@thomson.edu' },
      { fname: 'Siddharth', lname: 'Rao', cls: 'Class 2', admn: 'TS-2026-C02-04', email: 'siddharth.c2@thomson.edu' },

      // Class 3
      { fname: 'Kabir', lname: 'Kulkarni', cls: 'Class 3', admn: 'TS-2026-C03-01', email: 'kabir.c3@thomson.edu' },
      { fname: 'Anvi', lname: 'Joshi', cls: 'Class 3', admn: 'TS-2026-C03-02', email: 'anvi.c3@thomson.edu' },
      { fname: 'Yash', lname: 'Sharma', cls: 'Class 3', admn: 'TS-2026-C03-03', email: 'yash.c3@thomson.edu' },
      { fname: 'Anika', lname: 'Mehta', cls: 'Class 3', admn: 'TS-2026-C03-04', email: 'anika.c3@thomson.edu' },

      // Class 4
      { fname: 'Sai', lname: 'Reddy', cls: 'Class 4', admn: 'TS-2026-C04-01', email: 'sai.c4@thomson.edu' },
      { fname: 'Isha', lname: 'Nair', cls: 'Class 4', admn: 'TS-2026-C04-02', email: 'isha.c4@thomson.edu' },
      { fname: 'Tanvi', lname: 'Patel', cls: 'Class 4', admn: 'TS-2026-C04-03', email: 'tanvi.c4@thomson.edu' },
      { fname: 'Arjun', lname: 'Verma', cls: 'Class 4', admn: 'TS-2026-C04-04', email: 'arjun.c4@thomson.edu' },

      // Class 5
      { fname: 'Advait', lname: 'Rao', cls: 'Class 5', admn: 'TS-2026-C05-01', email: 'advait.c5@thomson.edu' },
      { fname: 'Sara', lname: 'Das', cls: 'Class 5', admn: 'TS-2026-C05-02', email: 'sara.c5@thomson.edu' },
      { fname: 'Avani', lname: 'Sen', cls: 'Class 5', admn: 'TS-2026-C05-03', email: 'avani.c5@thomson.edu' },
      { fname: 'Karan', lname: 'Trivedi', cls: 'Class 5', admn: 'TS-2026-C05-04', email: 'karan.c5@thomson.edu' },

      // Class 6
      { fname: 'Yash', lname: 'Kulkarni', cls: 'Class 6', admn: 'TS-2026-C06-01', email: 'yash.c6@thomson.edu' },
      { fname: 'Riya', lname: 'Chawla', cls: 'Class 6', admn: 'TS-2026-C06-02', email: 'riya.c6@thomson.edu' },
      { fname: 'Atharva', lname: 'Pillai', cls: 'Class 6', admn: 'TS-2026-C06-03', email: 'atharva.c6@thomson.edu' },
      { fname: 'Sneha', lname: 'Sharma', cls: 'Class 6', admn: 'TS-2026-C06-04', email: 'sneha.c6@thomson.edu' },

      // Class 7
      { fname: 'Atharva', lname: 'Sen', cls: 'Class 7', admn: 'TS-2026-C07-01', email: 'atharva.c7@thomson.edu' },
      { fname: 'Pari', lname: 'Yadav', cls: 'Class 7', admn: 'TS-2026-C07-02', email: 'pari.c7@thomson.edu' },
      { fname: 'Shlok', lname: 'Bose', cls: 'Class 7', admn: 'TS-2026-C07-03', email: 'shlok.c7@thomson.edu' },
      { fname: 'Rohan', lname: 'Zaveri', cls: 'Class 7', admn: 'TS-2026-C07-04', email: 'rohan.c7@thomson.edu' },

      // Class 8
      { fname: 'Shlok', lname: 'Bose', cls: 'Class 8', admn: 'TS-2026-C08-01', email: 'shlok.c8@thomson.edu' },
      { fname: 'Navya', lname: 'Pillai', cls: 'Class 8', admn: 'TS-2026-C08-02', email: 'navya.c8@thomson.edu' },
      { fname: 'Aarav', lname: 'Banerjee', cls: 'Class 8', admn: 'TS-2026-C08-03', email: 'aarav.c8@thomson.edu' },
      { fname: 'Vikram', lname: 'Singh', cls: 'Class 8', admn: 'TS-2026-C08-04', email: 'vikram.c8@thomson.edu' },

      // Class 9
      { fname: 'Ishita', lname: 'Joshi', cls: 'Class 9', admn: 'TS-2026-C09-01', email: 'ishita.c9@thomson.edu' },
      { fname: 'Karan', lname: 'Patel', cls: 'Class 9', admn: 'TS-2026-C09-02', email: 'karan.c9@thomson.edu' },
      { fname: 'Rahul', lname: 'Sharma', cls: 'Class 9', admn: 'TS-2026-C09-03', email: 'rahul.c9@thomson.edu' },
      { fname: 'Priyanka', lname: 'Verma', cls: 'Class 9', admn: 'TS-2026-C09-04', email: 'priyanka.c9@thomson.edu' },

      // Class 10 (5 students)
      { fname: 'Aarav', lname: 'Agarwal', cls: 'Class 10', admn: 'TS-2026-C10-01', email: 'student@thomson.edu' },
      { fname: 'Bhavya', lname: 'Chawla', cls: 'Class 10', admn: 'TS-2026-C10-02', email: 'bhavya.c10@thomson.edu' },
      { fname: 'Dev', lname: 'Patel', cls: 'Class 10', admn: 'TS-2026-C10-03', email: 'dev.c10@thomson.edu' },
      { fname: 'Ishita', lname: 'Sharma', cls: 'Class 10', admn: 'TS-2026-C10-04', email: 'ishita.c10@thomson.edu' },
      { fname: 'Riya', lname: 'Verma', cls: 'Class 10', admn: 'TS-2026-C10-05', email: 'riya.c10@thomson.edu' },

      // Class 11
      { fname: 'Siddharth', lname: 'Rao', cls: 'Class 11', admn: 'TS-2026-C11-01', email: 'siddharth.c11@thomson.edu' },
      { fname: 'Kavita', lname: 'Deshmukh', cls: 'Class 11', admn: 'TS-2026-C11-02', email: 'kavita.c11@thomson.edu' },
      { fname: 'Tanvi', lname: 'Sharma', cls: 'Class 11', admn: 'TS-2026-C11-03', email: 'tanvi.c11@thomson.edu' },
      { fname: 'Aditya', lname: 'Verma', cls: 'Class 11', admn: 'TS-2026-C11-04', email: 'aditya.c11@thomson.edu' },

      // Class 12
      { fname: 'Vivek', lname: 'Reddy', cls: 'Class 12', admn: 'TS-2026-C12-01', email: 'vivek.c12@thomson.edu' },
      { fname: 'Pooja', lname: 'Nair', cls: 'Class 12', admn: 'TS-2026-C12-02', email: 'pooja.c12@thomson.edu' },
      { fname: 'Ananya', lname: 'Singh', cls: 'Class 12', admn: 'TS-2026-C12-03', email: 'ananya.c12@thomson.edu' },
      { fname: 'Vikram', lname: 'Verma', cls: 'Class 12', admn: 'TS-2026-C12-04', email: 'vikram.c12@thomson.edu' },
    ];

    // Group students by class and sort alphabetically by last_name, first_name
    const studentsByClass = {};
    for (const st of rawStudentList) {
      if (!studentsByClass[st.cls]) studentsByClass[st.cls] = [];
      studentsByClass[st.cls].push(st);
    }

    const studentDbIds = [];

    for (const [clsName, stList] of Object.entries(studentsByClass)) {
      // SORT BY SURNAME (last_name) ASC
      stList.sort((a, b) => {
        const cmpLname = a.lname.localeCompare(b.lname);
        if (cmpLname !== 0) return cmpLname;
        return a.fname.localeCompare(b.fname);
      });

      // Assign sequential Roll Number starting from 1
      stList.forEach((st, idx) => {
        st.roll = String(idx + 1);
      });

      for (const st of stList) {
        const uId = await createUser(st.email, 'student', `${st.fname} ${st.lname}`);
        const secId = sectionIds[st.cls]['Section A'];
        const sId = await createStudent(uId, st.admn, st.fname, st.lname, st.roll, secId);
        if (sId) {
          studentDbIds.push({ id: sId, userId: uId, name: `${st.fname} ${st.lname}`, sectionId: secId, cls: st.cls });
        }
      }
    }

    // 7. Attendance Records (Past 10 Days - Excluding Sundays)
    for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
      const d = new Date();
      d.setDate(d.getDate() - dayOffset);
      if (d.getDay() === 0) continue; // Skip Sundays

      const yr = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const dy = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yr}-${mo}-${dy}`;

      for (const st of studentDbIds) {
        const status = (st.id + dayOffset) % 7 === 0 ? 'absent' : (st.id + dayOffset) % 5 === 0 ? 'late' : 'present';
        await connection.query(`
          INSERT INTO attendance (student_id, section_id, date, status, marked_by) 
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE status=VALUES(status)
        `, [st.id, st.sectionId, dateStr, status, teacherUserIds['teacher@thomson.edu']]);
      }
    }

    // 8. Timetable Schedules across ALL Standards (7 Periods Mon-Fri)
    // CRITICAL USER REQUIREMENT:
    // Period 1 MUST BE the Class Teacher teaching their own subject in their own homeroom class!
    const timeSlots = [
      { period: 1, start: '08:30:00', end: '09:15:00' },
      { period: 2, start: '09:15:00', end: '10:00:00' },
      { period: 3, start: '10:00:00', end: '10:45:00' },
      // RECESS BREAK 10:45 - 11:15
      { period: 4, start: '11:15:00', end: '12:00:00' },
      { period: 5, start: '12:00:00', end: '12:45:00' },
      { period: 6, start: '12:45:00', end: '13:30:00' },
      { period: 7, start: '13:30:00', end: '14:15:00' },
    ];

    const occupiedTeacherSlots = new Set(); // `${day}_${period}_${teacher_user_id}`

    for (const [clsName, cId] of Object.entries(classIds)) {
      const secId = sectionIds[clsName]['Section A'];
      const classTeacherInfo = classTeacherInfoByClass[clsName];

      if (secId && classTeacherInfo) {
        // Fetch all teacher assignments for this section
        const [assignedRows] = await connection.query(`
          SELECT ta.teacher_user_id, ta.subject_id, sub.name AS subject_name
          FROM teacher_assignments ta
          JOIN subjects sub ON ta.subject_id = sub.id
          WHERE ta.section_id = ?
        `, [secId]);

        if (assignedRows.length > 0) {
          // Period 1 MUST BE Class Teacher's subject with Class Teacher
          const period1Assignment = {
            teacher_user_id: classTeacherInfo.uId,
            subject_id: classTeacherInfo.subjectId,
          };

          for (let day = 1; day <= 5; day++) {
            for (let pIdx = 0; pIdx < timeSlots.length; pIdx++) {
              const slot = timeSlots[pIdx];
              let assignment;

              if (slot.period === 1) {
                // Period 1: Class Teacher & Class Teacher Subject
                assignment = period1Assignment;
              } else {
                // Other periods: pick from assigned subject teachers avoiding teacher schedule conflict
                const otherAssigns = assignedRows.filter(a => a.teacher_user_id !== classTeacherInfo.uId);
                const poolList = otherAssigns.length > 0 ? otherAssigns : assignedRows;
                let chosen = poolList.find(candidate => !occupiedTeacherSlots.has(`${day}_${slot.period}_${candidate.teacher_user_id}`));
                if (!chosen) chosen = poolList[(pIdx + day) % poolList.length];
                assignment = chosen;
              }

              if (assignment && assignment.subject_id) {
                occupiedTeacherSlots.add(`${day}_${slot.period}_${assignment.teacher_user_id}`);
                await connection.query(`
                  INSERT INTO timetables (section_id, subject_id, teacher_user_id, day_of_week, period_no, start_time, end_time, session_id) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                  ON DUPLICATE KEY UPDATE start_time=VALUES(start_time), end_time=VALUES(end_time), subject_id=VALUES(subject_id), teacher_user_id=VALUES(teacher_user_id)
                `, [secId, assignment.subject_id, assignment.teacher_user_id, day, slot.period, slot.start, slot.end, sessionId]);
              }
            }
          }
        }
      }
    }

    // 9. Notices
    await connection.query('TRUNCATE TABLE notices');
    const todayStr = new Date().toISOString().split('T')[0];
    const noticesList = [
      { title: 'Welcome to Academic Year 2026-2027', content: 'Official Thomson ERP is live for all students, faculty, cashiers, and administrators.', type: 'global', ntype: 'general', role: null },
      { title: 'Mid-Term Board Examination Schedule', content: 'Mid-term board exams for Class 9th to 12th start next week. Admit cards will be issued from office.', type: 'global', ntype: 'exam', role: null },
      { title: 'Parent-Teacher Meeting (PTM)', content: 'Mandatory PTM scheduled for term evaluation and academic performance review.', type: 'global', ntype: 'general', role: null }
    ];

    for (const n of noticesList) {
      await connection.query(`
        INSERT INTO notices (title, content, notice_type, type, target_role, target_section_id, published_by, is_published, publish_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
      `, [n.title, n.content, n.ntype, n.type, n.role, null, saId, todayStr]);
    }

    // 10. Transport Routes & Assignments
    await connection.query(`
      INSERT INTO transport_routes (route_no, name, bus_no, driver_name, driver_phone) 
      VALUES ('R-101', 'North Express Route', 'KA-01-EQ-9900', 'Ramesh Yadav', '9876543210')
      ON DUPLICATE KEY UPDATE bus_no=VALUES(bus_no)
    `);

    await connection.query(`
      INSERT INTO transport_routes (route_no, name, bus_no, driver_name, driver_phone) 
      VALUES ('R-102', 'South City Shuttle', 'KA-01-EQ-4422', 'Suresh Verma', '9876543211')
      ON DUPLICATE KEY UPDATE bus_no=VALUES(bus_no)
    `);

    let [[rRow]] = await connection.query("SELECT id FROM transport_routes WHERE route_no = 'R-101'");
    if (rRow) {
      await connection.query(`
        INSERT IGNORE INTO transport_stops (route_id, stop_name, stop_order, pickup_time, drop_time, monthly_fare) 
        VALUES (?, 'Central Circle Stop', 1, '07:30:00', '15:30:00', 1800.00)
      `, [rRow.id]);

      let [[sStopRow]] = await connection.query("SELECT id FROM transport_stops WHERE route_id = ?", [rRow.id]);
      if (sStopRow && studentDbIds[0]) {
        await connection.query(`
          INSERT INTO student_transport (student_id, route_id, stop_id, session_id, pickup_type) 
          VALUES (?, ?, ?, ?, 'both')
          ON DUPLICATE KEY UPDATE pickup_type='both'
        `, [studentDbIds[0].id, rRow.id, sStopRow.id, sessionId]);
      }
    }

    // 11. Fee Structure & Records
    await connection.query("INSERT IGNORE INTO fee_categories (name, description) VALUES ('Tuition Fee', 'Quarterly Tuition Fee')");
    await connection.query("INSERT IGNORE INTO fee_categories (name, description) VALUES ('Exam Fee', 'Term Examination Fee')");

    let [[fcRow]] = await connection.query("SELECT id FROM fee_categories WHERE name='Tuition Fee'");
    if (fcRow) {
      for (const cId of Object.values(classIds)) {
        await connection.query(`
          INSERT INTO fee_structures (session_id, class_id, category_id, amount, due_date) 
          VALUES (?, ?, ?, 7500.00, ?)
          ON DUPLICATE KEY UPDATE amount=7500.00
        `, [sessionId, cId, fcRow.id, todayStr]);
      }

      for (const st of studentDbIds) {
        const isPaid = st.id % 2 === 1;
        const paidAmount = isPaid ? 7500.00 : (st.id % 3 === 0 ? 3750.00 : 0.00);
        const status = paidAmount === 7500.00 ? 'PAID' : (paidAmount > 0 ? 'PARTIAL' : 'PENDING');

        await connection.query(`
          INSERT INTO fee_records (student_id, session_id, category_id, total_amount, paid_amount, due_date, status) 
          VALUES (?, ?, ?, 7500.00, ?, ?, ?)
          ON DUPLICATE KEY UPDATE paid_amount=VALUES(paid_amount), status=VALUES(status)
        `, [st.id, sessionId, fcRow.id, paidAmount, todayStr, status]);
      }
    }

    // 12. Exams & Marks
    await connection.query(`
      INSERT INTO exams (name, session_id, class_id, exam_type, half_year, start_date, end_date, status) 
      VALUES ('Mid-Term Board Examination', ?, ?, 'semester', 'H1', ?, ?, 'completed')
      ON DUPLICATE KEY UPDATE status='completed'
    `, [sessionId, classIds['Class 10'], todayStr, todayStr]);

    let [[exRow]] = await connection.query("SELECT id FROM exams WHERE name='Mid-Term Board Examination'");
    const class10Math = subjectIdsByClass['Class 10'] ? subjectIdsByClass['Class 10']['Mathematics'] : null;
    const class10Phy = subjectIdsByClass['Class 10'] ? subjectIdsByClass['Class 10']['Physics'] : null;

    if (exRow && class10Math && class10Phy) {
      for (const st of studentDbIds.filter(s => s.cls === 'Class 10')) {
        await connection.query(`
          INSERT INTO marks (exam_id, student_id, subject_id, marks_obtained, max_marks, grade, entered_by) 
          VALUES (?, ?, ?, 92.50, 100.00, 'A+', ?)
          ON DUPLICATE KEY UPDATE marks_obtained=92.50
        `, [exRow.id, st.id, class10Math, teacherUserIds['teacher@thomson.edu']]);

        await connection.query(`
          INSERT INTO marks (exam_id, student_id, subject_id, marks_obtained, max_marks, grade, entered_by) 
          VALUES (?, ?, ?, 84.00, 100.00, 'A', ?)
          ON DUPLICATE KEY UPDATE marks_obtained=84.00
        `, [exRow.id, st.id, class10Phy, teacherUserIds['teacher.phy@thomson.edu']]);
      }
    }

    // 13. Homework
    if (class10Math) {
      const class10SecA = sectionIds['Class 10']['Section A'];
      const [[existingHw1]] = await connection.query(
        "SELECT id FROM homework WHERE section_id = ? AND subject_id = ? AND title = ?",
        [class10SecA, class10Math, 'Quadratic Equations Worksheet']
      );
      if (!existingHw1) {
        await connection.query(`
          INSERT INTO homework (section_id, subject_id, title, description, classroom_url, assigned_by, assigned_date, due_date, session_id) 
          VALUES (?, ?, 'Quadratic Equations Worksheet', 'Solve problems 1 to 25 from Exercise 4.2 in NCERT textbook.', 'https://classroom.google.com/c/MzkxOTk2MTQ0Njky', ?, ?, ?, ?)
        `, [class10SecA, class10Math, teacherUserIds['teacher@thomson.edu'], todayStr, todayStr, sessionId]);
      }
    } else {
      console.warn("Missing Mathematics subject ID for Class 10 homework seeding.");
    }

    console.log('\n======================================================');
    console.log(' SUCCESS: Detailed Mock Database Seed Completed!');
    console.log('======================================================');
    console.log('Demo Login Credentials (Default Password: Thomson2026!)');
    console.log('------------------------------------------------------');
    console.log('1. Super Admin:  superadmin@thomson.edu  / Thomson2026!');
    console.log('2. Admin:        admin@thomson.edu       / Thomson2026!');
    console.log('3. Cashier:      cashier@thomson.edu     / Thomson2026!');
    console.log('4. Class 10 Teacher: teacher@thomson.edu / Thomson2026!');
    console.log('5. Student:      student@thomson.edu     / Thomson2026!');
    console.log('======================================================\n');

    process.exitCode = 0;
  } catch (err) {
    console.error('Seed Error:', err);
    process.exitCode = 1;
  } finally {
    if (connection) await connection.end();
  }
}

seed();
