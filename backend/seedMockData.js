const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function seed() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_erp'
    });

    console.log('Connected to MySQL Database. Starting comprehensive extended demo seed...');

    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 8);

    // 1. Academic Session
    await connection.query(`
      INSERT INTO academic_sessions (name, start_date, end_date, is_current) 
      VALUES ('2026-2027', '2026-04-01', '2027-03-31', 1)
      ON DUPLICATE KEY UPDATE is_current=1
    `);
    const [[sessRow]] = await connection.query(`SELECT id FROM academic_sessions WHERE name='2026-2027'`);
    const sessionId = sessRow.id;

    // 2. Classes & Sections
    const classDefs = [
      { name: 'Class 8', num: 8 },
      { name: 'Class 9', num: 9 },
      { name: 'Class 10', num: 10 },
      { name: 'Class 11', num: 11 },
      { name: 'Class 12', num: 12 },
    ];

    const classIds = {};
    const sectionIds = {};

    for (const c of classDefs) {
      await connection.query(`INSERT IGNORE INTO classes (name, numeric_value) VALUES (?, ?)`, [c.name, c.num]);
      const [[cRow]] = await connection.query(`SELECT id FROM classes WHERE name=?`, [c.name]);
      classIds[c.name] = cRow.id;

      sectionIds[c.name] = {};
      for (const secName of ['Section A', 'Section B', 'Section C']) {
        await connection.query(`INSERT IGNORE INTO sections (class_id, name, capacity) VALUES (?, ?, 40)`, [cRow.id, secName]);
        const [[sRow]] = await connection.query(`SELECT id FROM sections WHERE class_id=? AND name=?`, [cRow.id, secName]);
        sectionIds[c.name][secName] = sRow.id;
      }
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
      await connection.query(`
        INSERT INTO students (user_id, admission_no, roll_no, first_name, last_name, section_id, session_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
        ON DUPLICATE KEY UPDATE section_id=VALUES(section_id)
      `, [userId, admnNo, roll, fname, lname, sectionId, sessionId]);

      let [[stuRow]] = await connection.query('SELECT id FROM students WHERE user_id = ?', [userId]);
      return stuRow?.id;
    }

    // 3. Super Admin
    let saId = await createUser('superadmin@erp.com', 'super_admin', 'Super Admin Official');

    // 4. Admins
    let admin1Id = await createUser('admin1@erp.com', 'admin', 'Principal Rajesh Sharma');
    await createStaff(admin1Id, 'ADM001', 'Rajesh', 'Sharma', 'Principal & Director', 'Management');
    
    let admin2Id = await createUser('admin2@erp.com', 'admin', 'Vice Principal Meenakshi');
    await createStaff(admin2Id, 'ADM002', 'Meenakshi', 'Sundaram', 'Vice Principal', 'Management');

    // 5. Cashiers
    let cashier1Id = await createUser('cashier1@erp.com', 'cashier', 'Senior Cashier Vikram');
    await createStaff(cashier1Id, 'CSH001', 'Vikram', 'Mehta', 'Senior Cashier & Fee Incharge', 'Finance');

    let cashier2Id = await createUser('cashier2@erp.com', 'cashier', 'Accountant Sunita');
    await createStaff(cashier2Id, 'CSH002', 'Sunita', 'Kapoor', 'Accounts Officer', 'Finance');

    // 6. Teachers
    const teachersData = [
      { email: 'teacher1@erp.com', code: 'TCH001', fname: 'Arvind', lname: 'Sharma', desc: 'HOD Mathematics', dept: 'Mathematics' },
      { email: 'teacher2@erp.com', code: 'TCH002', fname: 'Anita', lname: 'Deshmukh', desc: 'Senior Physics Lecturer', dept: 'Science' },
      { email: 'teacher3@erp.com', code: 'TCH003', fname: 'Ananya', lname: 'Roy', desc: 'English Faculty Lead', dept: 'English' },
      { email: 'teacher4@erp.com', code: 'TCH004', fname: 'Rajesh', lname: 'Verma', desc: 'Computer Science Faculty', dept: 'CS & IT' },
      { email: 'teacher5@erp.com', code: 'TCH005', fname: 'Suresh', lname: 'Kulkarni', desc: 'Chemistry Department Lead', dept: 'Science' }
    ];

    const teacherUserIds = [];
    for (const t of teachersData) {
      const uId = await createUser(t.email, 'teacher', `Prof. ${t.fname} ${t.lname}`);
      await createStaff(uId, t.code, t.fname, t.lname, t.desc, t.dept);
      teacherUserIds.push(uId);
    }

    // 7. Students (15 Students across sections)
    const studentNames = [
      { fname: 'Aarav', lname: 'Kumar', cls: 'Class 10', sec: 'Section A' },
      { fname: 'Riya', lname: 'Singh', cls: 'Class 10', sec: 'Section A' },
      { fname: 'Aditya', lname: 'Verma', cls: 'Class 10', sec: 'Section A' },
      { fname: 'Ananya', lname: 'Gupta', cls: 'Class 10', sec: 'Section B' },
      { fname: 'Rohan', lname: 'Mehta', cls: 'Class 10', sec: 'Section B' },
      { fname: 'Ishita', lname: 'Joshi', cls: 'Class 9', sec: 'Section A' },
      { fname: 'Karan', lname: 'Patel', cls: 'Class 9', sec: 'Section A' },
      { fname: 'Neha', lname: 'Sharma', cls: 'Class 9', sec: 'Section B' },
      { fname: 'Vivek', lname: 'Reddy', cls: 'Class 12', sec: 'Section A' },
      { fname: 'Pooja', lname: 'Nair', cls: 'Class 12', sec: 'Section A' },
      { fname: 'Siddharth', lname: 'Rao', cls: 'Class 11', sec: 'Section A' },
      { fname: 'Tanvi', lname: 'Chawla', cls: 'Class 11', sec: 'Section A' },
      { fname: 'Kabir', lname: 'Das', cls: 'Class 8', sec: 'Section A' },
      { fname: 'Diya', lname: 'Sen', cls: 'Class 8', sec: 'Section A' },
      { fname: 'Manish', lname: 'Yadav', cls: 'Class 10', sec: 'Section A' },
    ];

    const studentDbIds = [];
    for (let i = 0; i < studentNames.length; i++) {
      const st = studentNames[i];
      const indexNum = i + 1;
      const uEmail = `student${indexNum}@erp.com`;
      const uId = await createUser(uEmail, 'student', `${st.fname} ${st.lname}`);
      const secId = sectionIds[st.cls][st.sec];
      const sId = await createStudent(uId, `ADM-2026-${100 + indexNum}`, st.fname, st.lname, `${1000 + indexNum}`, secId);
      studentDbIds.push({ id: sId, userId: uId, name: `${st.fname} ${st.lname}`, sectionId: secId, cls: st.cls, sec: st.sec });
    }

    // 8. Subjects per Class
    const subjectList = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science', 'Social Studies', 'Biology'];
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

    // 9. Teacher Assignments
    const class10SecA = sectionIds['Class 10']['Section A'];
    const class10Math = subjectIdsByClass['Class 10']['Mathematics'];
    const class10Phy = subjectIdsByClass['Class 10']['Physics'];
    const class10Eng = subjectIdsByClass['Class 10']['English'];
    const class10CS = subjectIdsByClass['Class 10']['Computer Science'];

    if (class10Math && class10Phy && class10Eng && class10CS) {
      await connection.query(`
        INSERT INTO teacher_assignments (teacher_user_id, section_id, subject_id, session_id, is_class_teacher) 
        VALUES (?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE is_class_teacher=1
      `, [teacherUserIds[0], class10SecA, class10Math, sessionId]);

      await connection.query(`
        INSERT INTO teacher_assignments (teacher_user_id, section_id, subject_id, session_id, is_class_teacher) 
        VALUES (?, ?, ?, ?, 0) ON DUPLICATE KEY UPDATE is_class_teacher=0
      `, [teacherUserIds[1], class10SecA, class10Phy, sessionId]);

      await connection.query(`
        INSERT INTO teacher_assignments (teacher_user_id, section_id, subject_id, session_id, is_class_teacher) 
        VALUES (?, ?, ?, ?, 0) ON DUPLICATE KEY UPDATE is_class_teacher=0
      `, [teacherUserIds[2], class10SecA, class10Eng, sessionId]);

      await connection.query(`
        INSERT INTO teacher_assignments (teacher_user_id, section_id, subject_id, session_id, is_class_teacher) 
        VALUES (?, ?, ?, ?, 0) ON DUPLICATE KEY UPDATE is_class_teacher=0
      `, [teacherUserIds[3], class10SecA, class10CS, sessionId]);
    }

    // 10. Attendance Records (Past 10 Days)
    for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
      const d = new Date();
      d.setDate(d.getDate() - dayOffset);
      const dateStr = d.toISOString().split('T')[0];

      for (const st of studentDbIds) {
        const status = (st.id + dayOffset) % 7 === 0 ? 'absent' : (st.id + dayOffset) % 5 === 0 ? 'late' : 'present';
        await connection.query(`
          INSERT INTO attendance (student_id, section_id, date, status, marked_by) 
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE status=VALUES(status)
        `, [st.id, st.sectionId, dateStr, status, teacherUserIds[0]]);
      }
    }

    // 11. Timetable Schedule (Periods 1 to 4 Mon-Fri)
    for (let day = 1; day <= 5; day++) {
      await connection.query(`
        INSERT INTO timetables (section_id, subject_id, teacher_user_id, day_of_week, period_no, start_time, end_time, session_id) 
        VALUES (?, ?, ?, ?, 1, '08:30:00', '09:15:00', ?)
        ON DUPLICATE KEY UPDATE start_time='08:30:00'
      `, [class10SecA, class10Math, teacherUserIds[0], day, sessionId]);

      await connection.query(`
        INSERT INTO timetables (section_id, subject_id, teacher_user_id, day_of_week, period_no, start_time, end_time, session_id) 
        VALUES (?, ?, ?, ?, 2, '09:15:00', '10:00:00', ?)
        ON DUPLICATE KEY UPDATE start_time='09:15:00'
      `, [class10SecA, class10Phy, teacherUserIds[1], day, sessionId]);

      await connection.query(`
        INSERT INTO timetables (section_id, subject_id, teacher_user_id, day_of_week, period_no, start_time, end_time, session_id) 
        VALUES (?, ?, ?, ?, 3, '10:15:00', '11:00:00', ?)
        ON DUPLICATE KEY UPDATE start_time='10:15:00'
      `, [class10SecA, class10Eng, teacherUserIds[2], day, sessionId]);

      await connection.query(`
        INSERT INTO timetables (section_id, subject_id, teacher_user_id, day_of_week, period_no, start_time, end_time, session_id) 
        VALUES (?, ?, ?, ?, 4, '11:00:00', '11:45:00', ?)
        ON DUPLICATE KEY UPDATE start_time='11:00:00'
      `, [class10SecA, class10CS, teacherUserIds[3], day, sessionId]);
    }

    // 12. Notices (Global & Targeted Notices)
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

    // 13. Transport Routes, Vehicles, Stops & Student Assignments
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

    // 14. Fee Categories, Structures, and Records
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

    // 15. Examinations & Marks
    await connection.query(`
      INSERT INTO exams (name, session_id, class_id, exam_type, half_year, start_date, end_date, status) 
      VALUES ('Mid-Term Board Examination', ?, ?, 'semester', 'H1', ?, ?, 'completed')
      ON DUPLICATE KEY UPDATE status='completed'
    `, [sessionId, classIds['Class 10'], todayStr, todayStr]);

    let [[exRow]] = await connection.query("SELECT id FROM exams WHERE name='Mid-Term Board Examination'");
    if (exRow && class10Math && class10Phy) {
      for (const st of studentDbIds.filter(s => s.cls === 'Class 10')) {
        await connection.query(`
          INSERT INTO marks (exam_id, student_id, subject_id, marks_obtained, max_marks, grade, entered_by) 
          VALUES (?, ?, ?, 92.50, 100.00, 'A+', ?)
          ON DUPLICATE KEY UPDATE marks_obtained=92.50
        `, [exRow.id, st.id, class10Math, teacherUserIds[0]]);

        await connection.query(`
          INSERT INTO marks (exam_id, student_id, subject_id, marks_obtained, max_marks, grade, entered_by) 
          VALUES (?, ?, ?, 84.00, 100.00, 'A', ?)
          ON DUPLICATE KEY UPDATE marks_obtained=84.00
        `, [exRow.id, st.id, class10Phy, teacherUserIds[1]]);
      }
    }

    // 16. Homework Assignments
    if (class10Math) {
      const [[existingHw1]] = await connection.query(
        "SELECT id FROM homework WHERE section_id = ? AND subject_id = ? AND title = ?",
        [class10SecA, class10Math, 'Quadratic Equations Worksheet']
      );
      if (!existingHw1) {
        await connection.query(`
          INSERT INTO homework (section_id, subject_id, title, description, assigned_by, assigned_date, due_date, session_id) 
          VALUES (?, ?, 'Quadratic Equations Worksheet', 'Solve problems 1 to 25 from Exercise 4.2 in NCERT textbook.', ?, ?, ?, ?)
        `, [class10SecA, class10Math, teacherUserIds[0], todayStr, todayStr, sessionId]);
      }
    }

    if (class10Phy) {
      const [[existingHw2]] = await connection.query(
        "SELECT id FROM homework WHERE section_id = ? AND subject_id = ? AND title = ?",
        [class10SecA, class10Phy, 'Ray Diagrams & Refraction Worksheet']
      );
      if (!existingHw2) {
        await connection.query(`
          INSERT INTO homework (section_id, subject_id, title, description, assigned_by, assigned_date, due_date, session_id) 
          VALUES (?, ?, 'Ray Diagrams & Refraction Worksheet', 'Draw ray diagrams for concave and convex mirrors.', ?, ?, ?, ?)
        `, [class10SecA, class10Phy, teacherUserIds[1], todayStr, todayStr, sessionId]);
      }
    }

    console.log('\n======================================================');
    console.log(' SUCCESS: Extended Demo Database Seed Completed!');
    console.log('======================================================');
    console.log('Demo Login Credentials (Default Password: password123)');
    console.log('------------------------------------------------------');
    console.log('1. Super Admin:  superadmin@erp.com  / password123');
    console.log('2. Admin:        admin1@erp.com      / password123');
    console.log('3. Cashier:      cashier1@erp.com    / password123');
    console.log('4. Teacher:      teacher1@erp.com    / password123');
    console.log('5. Student:      student1@erp.com    / password123');
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
