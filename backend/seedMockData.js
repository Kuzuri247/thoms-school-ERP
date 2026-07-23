const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('d:/thoms-school-ERP/backend/node_modules/dotenv').config({ path: 'd:/thoms-school-ERP/backend/.env' });

async function seed() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_erp'
    });

    console.log('Connected to database. Starting comprehensive demo seed...');

    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 8);

    // 1. Create Academic Session
    const [sessionRes] = await connection.query(`
      INSERT INTO academic_sessions (name, start_date, end_date, is_current) 
      VALUES ('2026-2027', '2026-04-01', '2027-03-31', 1)
      ON DUPLICATE KEY UPDATE is_current=1
    `);
    let sessionId = sessionRes.insertId;
    if (!sessionId) {
      let [sessRow] = await connection.query(`SELECT id FROM academic_sessions WHERE name='2026-2027'`);
      sessionId = sessRow[0].id;
    }

    // 2. Create Class and Section
    await connection.query(`INSERT IGNORE INTO classes (name, numeric_value) VALUES ('Class 10', 10)`);
    let [classRow] = await connection.query(`SELECT id FROM classes WHERE name='Class 10'`);
    const classId = classRow[0].id;

    await connection.query(`INSERT IGNORE INTO sections (class_id, name, capacity) VALUES (?, 'A', 40)`, [classId]);
    let [secRow] = await connection.query(`SELECT id FROM sections WHERE class_id=? AND name='A'`, [classId]);
    const sectionId = secRow[0].id;

    // Helper to insert user
    async function createUser(email, role, fullName) {
      let [existing] = await connection.query('SELECT id FROM users WHERE email=?', [email]);
      if (existing.length > 0) return existing[0].id;

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

    async function createStudent(userId, admnNo, fname, lname, roll) {
      await connection.query(`
        INSERT INTO students (user_id, admission_no, roll_no, first_name, last_name, section_id, session_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
        ON DUPLICATE KEY UPDATE section_id=VALUES(section_id)
      `, [userId, admnNo, roll, fname, lname, sectionId, sessionId]);

      let [stuRow] = await connection.query('SELECT id FROM students WHERE user_id = ?', [userId]);
      return stuRow[0]?.id;
    }

    // 3. Create Super Admin
    let saId = await createUser('superadmin@erp.com', 'super_admin', 'Super Admin Official');

    // 4. Create Admins
    let admin1Id = await createUser('admin1@erp.com', 'admin', 'Principal Admin');
    await createStaff(admin1Id, 'ADM001', 'Principal', 'Admin', 'School Administrator', 'Management');
    
    let admin2Id = await createUser('admin2@erp.com', 'admin', 'Vice Principal Admin');
    await createStaff(admin2Id, 'ADM002', 'Vice', 'Principal', 'Vice Administrator', 'Management');

    // 5. Create Cashier
    let cashierId = await createUser('cashier1@erp.com', 'cashier', 'Senior Cashier Desk');
    await createStaff(cashierId, 'CSH001', 'Senior', 'Cashier', 'Finance Officer', 'Finance');

    // 6. Create Teachers
    let tch1Id = await createUser('teacher1@erp.com', 'teacher', 'Mathematics HOD (Teacher 1)');
    await createStaff(tch1Id, 'TCH001', 'Rajesh', 'Sharma', 'HOD Mathematics', 'Academics');

    let tch2Id = await createUser('teacher2@erp.com', 'teacher', 'Science Faculty (Teacher 2)');
    await createStaff(tch2Id, 'TCH002', 'Anita', 'Deshmukh', 'Science Faculty', 'Academics');

    let tch3Id = await createUser('teacher3@erp.com', 'teacher', 'English Faculty (Teacher 3)');
    await createStaff(tch3Id, 'TCH003', 'Vikram', 'Mehta', 'English Faculty', 'Academics');

    // 7. Create Bus Staff
    let busStaffId = await createUser('busstaff1@erp.com', 'busstaff', 'Driver Ramesh (Bus Staff)');
    await createStaff(busStaffId, 'BUS001', 'Ramesh', 'Yadav', 'Senior Bus Driver', 'Transport');

    // 8. Create Students
    const studentDbIds = [];
    for (let i = 1; i <= 5; i++) {
      let uId = await createUser(`student${i}@erp.com`, 'student', `Student ${i} Kumar`);
      let sId = await createStudent(uId, `ADM-2026-0${i}`, `Student${i}`, 'Kumar', `100${i}`);
      studentDbIds.push(sId);
    }

    // 9. Subjects
    await connection.query("INSERT IGNORE INTO subjects (name, code, class_id, max_marks, pass_marks) VALUES ('Mathematics', 'MATH-10', ?, 100, 35)", [classId]);
    await connection.query("INSERT IGNORE INTO subjects (name, code, class_id, max_marks, pass_marks) VALUES ('Science', 'SCI-10', ?, 100, 35)", [classId]);
    await connection.query("INSERT IGNORE INTO subjects (name, code, class_id, max_marks, pass_marks) VALUES ('English', 'ENG-10', ?, 100, 35)", [classId]);

    let [subjRows] = await connection.query("SELECT id FROM subjects WHERE class_id = ?", [classId]);
    const mathId = subjRows[0]?.id;
    const sciId = subjRows[1]?.id;
    const engId = subjRows[2]?.id;

    // 10. Teacher assignments (Teacher 1 is Class Teacher of Section A)
    if (mathId && sciId && engId) {
      await connection.query(`
        INSERT INTO teacher_assignments (teacher_user_id, section_id, subject_id, session_id, is_class_teacher) 
        VALUES (?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE is_class_teacher=1
      `, [tch1Id, sectionId, mathId, sessionId]);

      await connection.query(`
        INSERT INTO teacher_assignments (teacher_user_id, section_id, subject_id, session_id, is_class_teacher) 
        VALUES (?, ?, ?, ?, 0)
        ON DUPLICATE KEY UPDATE is_class_teacher=0
      `, [tch2Id, sectionId, sciId, sessionId]);

      await connection.query(`
        INSERT INTO teacher_assignments (teacher_user_id, section_id, subject_id, session_id, is_class_teacher) 
        VALUES (?, ?, ?, ?, 0)
        ON DUPLICATE KEY UPDATE is_class_teacher=0
      `, [tch3Id, sectionId, engId, sessionId]);
    }

    // 11. Exam Weightage (20% + 20% + 60% = 100%)
    await connection.query(`
      INSERT INTO exam_weightage (session_id, class_id, half_year, internal_1_weight, internal_2_weight, semester_weight)
      VALUES (?, NULL, 'H1', 20.00, 20.00, 60.00)
      ON DUPLICATE KEY UPDATE internal_1_weight=20.00, internal_2_weight=20.00, semester_weight=60.00
    `, [sessionId]);

    // 12. Notices (Global & Work notices)
    let dStr = new Date().toISOString().split('T')[0];
    await connection.query(`
      INSERT INTO notices (title, content, notice_type, type, published_by, is_published, publish_date) 
      VALUES ('Welcome to Academic Year 2026-2027', 'Official Thomson ERP is now live for all students, teachers, cashiers, and administrators.', 'general', 'global', ?, 1, ?)
    `, [saId, dStr]);

    await connection.query(`
      INSERT INTO notices (title, content, notice_type, type, target_role, target_section_id, published_by, is_published, publish_date) 
      VALUES ('Class 10 Science Assignment Notice', 'Complete Chapters 1 to 3 revision questions before Friday.', 'academic', 'work', 'student', ?, ?, 1, ?)
    `, [sectionId, tch1Id, dStr]);

    // 13. Transport Route & Stops
    await connection.query(`
      INSERT INTO transport_routes (route_no, name, bus_no, driver_name, driver_phone, busstaff_user_id) 
      VALUES ('R-101', 'North Express Route', 'KA-01-EQ-9900', 'Ramesh Yadav', '9876543210', ?)
      ON DUPLICATE KEY UPDATE bus_no=VALUES(bus_no)
    `, [busStaffId]);

    let [routeRows] = await connection.query("SELECT id FROM transport_routes WHERE route_no = 'R-101'");
    const routeId = routeRows[0]?.id;

    if (routeId) {
      await connection.query(`
        INSERT INTO transport_stops (route_id, stop_name, stop_order, pickup_time, drop_time, monthly_fare) 
        VALUES (?, 'Central Circle Stop', 1, '07:30:00', '15:30:00', 1800.00)
      `, [routeId]);

      let [stopRows] = await connection.query("SELECT id FROM transport_stops WHERE route_id = ?", [routeId]);
      const stopId = stopRows[0]?.id;

      if (stopId && studentDbIds[0]) {
        await connection.query(`
          INSERT INTO student_transport (student_id, route_id, stop_id, session_id, pickup_type) 
          VALUES (?, ?, ?, ?, 'both')
          ON DUPLICATE KEY UPDATE pickup_type='both'
        `, [studentDbIds[0], routeId, stopId, sessionId]);
      }
    }

    // 14. Attendance Register (Last 5 days)
    for (let i = 0; i < 5; i++) {
      let d = new Date();
      d.setDate(d.getDate() - i);
      let dateStr = d.toISOString().split('T')[0];
      for (const sId of studentDbIds) {
        await connection.query(`
          INSERT INTO attendance (student_id, section_id, date, status, marked_by) 
          VALUES (?, ?, ?, 'present', ?)
          ON DUPLICATE KEY UPDATE status='present'
        `, [sId, sectionId, dateStr, tch1Id]);
      }
    }

    // 15. Timetable Schedule (Periods 1 & 2 for Mon-Fri)
    for (let day = 1; day <= 5; day++) {
      await connection.query(`
        INSERT INTO timetables (section_id, subject_id, teacher_user_id, day_of_week, period_no, start_time, end_time, session_id) 
        VALUES (?, ?, ?, ?, 1, '09:00:00', '09:45:00', ?)
        ON DUPLICATE KEY UPDATE start_time='09:00:00'
      `, [sectionId, mathId, tch1Id, day, sessionId]);

      await connection.query(`
        INSERT INTO timetables (section_id, subject_id, teacher_user_id, day_of_week, period_no, start_time, end_time, session_id) 
        VALUES (?, ?, ?, ?, 2, '09:45:00', '10:30:00', ?)
        ON DUPLICATE KEY UPDATE start_time='09:45:00'
      `, [sectionId, sciId, tch2Id, day, sessionId]);
    }

    // 16. Fee Structure & Fee Records
    await connection.query("INSERT IGNORE INTO fee_categories (name, description) VALUES ('Tuition Fee', 'Quarterly Tuition Fee')");
    let [fcRows] = await connection.query("SELECT id FROM fee_categories WHERE name='Tuition Fee'");
    const feeCatId = fcRows[0]?.id;

    if (feeCatId) {
      await connection.query(`
        INSERT INTO fee_structures (session_id, class_id, category_id, amount, due_date) 
        VALUES (?, ?, ?, 7500.00, ?)
        ON DUPLICATE KEY UPDATE amount=7500.00
      `, [sessionId, classId, feeCatId, dStr]);

      for (const sId of studentDbIds) {
        const isPaid = sId % 2 === 1;
        await connection.query(`
          INSERT INTO fee_records (student_id, session_id, category_id, total_amount, paid_amount, due_date, status) 
          VALUES (?, ?, ?, 7500.00, ?, ?, ?)
          ON DUPLICATE KEY UPDATE paid_amount=VALUES(paid_amount), status=VALUES(status)
        `, [sId, sessionId, feeCatId, isPaid ? 7500.00 : 0.00, dStr, isPaid ? 'PAID' : 'PENDING']);
      }
    }

    // 17. Exams & Marks
    await connection.query(`
      INSERT INTO exams (name, session_id, class_id, exam_type, half_year, start_date, end_date, status) 
      VALUES ('Internal Assessment 1', ?, ?, 'internal_1', 'H1', ?, ?, 'completed')
      ON DUPLICATE KEY UPDATE status='completed'
    `, [sessionId, classId, dStr, dStr]);

    let [exRows] = await connection.query("SELECT id FROM exams WHERE name='Internal Assessment 1'");
    const examId = exRows[0]?.id;

    if (examId && mathId && sciId) {
      for (const sId of studentDbIds) {
        await connection.query(`
          INSERT INTO marks (exam_id, student_id, subject_id, marks_obtained, max_marks, grade, entered_by) 
          VALUES (?, ?, ?, 88.50, 100.00, 'A', ?)
          ON DUPLICATE KEY UPDATE marks_obtained=88.50
        `, [examId, sId, mathId, tch1Id]);

        await connection.query(`
          INSERT INTO marks (exam_id, student_id, subject_id, marks_obtained, max_marks, grade, entered_by) 
          VALUES (?, ?, ?, 79.00, 100.00, 'B', ?)
          ON DUPLICATE KEY UPDATE marks_obtained=79.00
        `, [examId, sId, sciId, tch2Id]);
      }
    }

    // 18. Homework
    if (mathId) {
      await connection.query(`
        INSERT INTO homework (section_id, subject_id, title, description, assigned_by, assigned_date, due_date, session_id) 
        VALUES (?, ?, 'Quadratic Equations Practice Set', 'Solve Exercise 4.1 to 4.3 in notebook.', ?, ?, ?, ?)
      `, [sectionId, mathId, tch1Id, dStr, dStr, sessionId]);
    }

    console.log('\n======================================================');
    console.log(' SUCCESS: Comprehensive Demo Seed Completed!');
    console.log('======================================================');
    console.log('Demo Login Credentials (Default Password: password123)');
    console.log('------------------------------------------------------');
    console.log('1. Super Admin:  superadmin@erp.com  / password123');
    console.log('2. Admin:        admin1@erp.com      / password123');
    console.log('3. Cashier:      cashier1@erp.com    / password123');
    console.log('4. Teacher:      teacher1@erp.com    / password123');
    console.log('5. Bus Staff:    busstaff1@erp.com   / password123');
    console.log('6. Student:      student1@erp.com    / password123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
}

seed();
