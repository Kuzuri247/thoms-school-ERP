const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function seed() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'school_erp'
        });

        console.log('Connected to database. Starting seed...');

        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 8);

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
        await connection.query(`
            INSERT IGNORE INTO classes (name, numeric_value) VALUES ('Class 1', 1)
        `);
        let [classRow] = await connection.query(`SELECT id FROM classes WHERE name='Class 1'`);
        const classId = classRow[0].id;

        await connection.query(`
            INSERT IGNORE INTO sections (class_id, name, capacity) VALUES (?, 'A', 40)
        `, [classId]);
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

        async function createStaff(userId, empCode, fname, lname, desc) {
            await connection.query(`
                INSERT IGNORE INTO staff_profiles (user_id, employee_code, first_name, last_name, designation)
                VALUES (?, ?, ?, ?, ?)
            `, [userId, empCode, fname, lname, desc]);
        }

        async function createStudent(userId, admnNo, fname, lname) {
            await connection.query(`
                INSERT IGNORE INTO students (user_id, admission_no, first_name, last_name, section_id, session_id)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [userId, admnNo, fname, lname, sectionId, sessionId]);
        }

        // 3. Create Super Admin
        let saId = await createUser('superadmin2@erp.com', 'super_admin', 'Super Admin');
        
        // 4. Create Admins
        for(let i=1; i<=2; i++) {
            let uId = await createUser(`admin${i}@erp.com`, 'admin', `Admin ${i}`);
            await createStaff(uId, `ADM00${i}`, 'Admin', `${i}`, 'Administrator');
        }

        // 5. Create Teachers
        for(let i=1; i<=3; i++) {
            let uId = await createUser(`teacher${i}@erp.com`, 'teacher', `Teacher ${i}`);
            await createStaff(uId, `TCH00${i}`, 'Teacher', `${i}`, 'Faculty');
        }

        // 6. Create Students
        for(let i=1; i<=10; i++) {
            let uId = await createUser(`student${i}@erp.com`, 'student', `Student ${i}`);
            await createStudent(uId, `STU20260${i}`, 'Student', `${i}`);
        }

        // 7. Create Other Staff
        let pId = await createUser('principal@erp.com', 'principal', 'Principal Name');
        await createStaff(pId, 'PRN001', 'Principal', 'Name', 'Principal');

        let vpId = await createUser('vp@erp.com', 'vp', 'VP Name');
        await createStaff(vpId, 'VP001', 'VP', 'Name', 'Vice Principal');

        let cId = await createUser('cashier@erp.com', 'cashier', 'Cashier Name');
        await createStaff(cId, 'CSH001', 'Cashier', 'Name', 'Cashier');

        let rId = await createUser('receptionist@erp.com', 'receptionist', 'Receptionist Name');
        await createStaff(rId, 'REC001', 'Receptionist', 'Name', 'Receptionist');

        let bsId = await createUser('busstaff@erp.com', 'busstaff', 'Bus Staff');
        await createStaff(bsId, 'BUS001', 'Bus', 'Staff', 'Driver');

        // Extended Seeds for all modules

        // Subjects
        await connection.query("INSERT IGNORE INTO subjects (name, code, class_id, max_marks, pass_marks) VALUES ('Mathematics', 'MATH', ?, 100, 35), ('Science', 'SCI', ?, 100, 35), ('English', 'ENG', ?, 100, 35)", [classId, classId, classId]);
        let [subjRows] = await connection.query("SELECT id FROM subjects");
        const mathId = subjRows[0]?.id;
        const sciId = subjRows[1]?.id;
        const engId = subjRows[2]?.id;

        // Teacher assignments
        let [tchRows] = await connection.query("SELECT user_id FROM staff_profiles WHERE designation = 'Faculty' LIMIT 3");
        if(tchRows.length >= 3) {
            await connection.query("INSERT IGNORE INTO teacher_assignments (teacher_user_id, section_id, subject_id, session_id, is_class_teacher) VALUES (?, ?, ?, ?, 1)", [tchRows[0].user_id, sectionId, mathId, sessionId]);
            await connection.query("INSERT IGNORE INTO teacher_assignments (teacher_user_id, section_id, subject_id, session_id, is_class_teacher) VALUES (?, ?, ?, ?, 0)", [tchRows[1].user_id, sectionId, sciId, sessionId]);
            await connection.query("INSERT IGNORE INTO teacher_assignments (teacher_user_id, section_id, subject_id, session_id, is_class_teacher) VALUES (?, ?, ?, ?, 0)", [tchRows[2].user_id, sectionId, engId, sessionId]);
        }

        // Notices
        let dStr = new Date().toISOString().split('T')[0];
        await connection.query("INSERT IGNORE INTO notices (title, content, notice_type, published_by, is_published, publish_date) VALUES ('Welcome to New Academic Year', 'We welcome all students.', 'general', ?, 1, ?)", [saId, dStr]);
        await connection.query("INSERT IGNORE INTO notices (title, content, notice_type, published_by, is_published, publish_date) VALUES ('Fee Collection Deadline', 'Please clear dues by 10th.', 'fee', ?, 1, ?)", [saId, dStr]);
        await connection.query("INSERT IGNORE INTO notices (title, content, notice_type, published_by, is_published, publish_date) VALUES ('Science Fair Registration', 'Register by Friday.', 'academic', ?, 1, ?)", [saId, dStr]);

        // Transport
        await connection.query("INSERT IGNORE INTO transport_routes (route_no, name, bus_no, driver_name, driver_phone, busstaff_user_id) VALUES ('R01', 'Route 1 - North', 'KA-01-E-1234', 'Rajesh Kumar', '9876543210', ?)", [bsId]);
        let [routeRows] = await connection.query("SELECT id FROM transport_routes LIMIT 1");
        const routeId = routeRows[0]?.id;
        await connection.query("INSERT IGNORE INTO transport_stops (route_id, stop_name, stop_order, pickup_time, drop_time, monthly_fare) VALUES (?, 'Main Square', 1, '07:15:00', '15:45:00', 1500)", [routeId]);
        let [stopRows] = await connection.query("SELECT id FROM transport_stops LIMIT 1");
        const stopId = stopRows[0]?.id;

        // Fetch students
        let [stuRows] = await connection.query("SELECT id, user_id FROM students LIMIT 10");

        // Assign transport
        for(const stu of stuRows) {
            await connection.query("INSERT IGNORE INTO student_transport (student_id, route_id, stop_id, session_id, pickup_type) VALUES (?, ?, ?, ?, 'both')", [stu.id, routeId, stopId, sessionId]);
        }

        // Attendance
        for(let i=0; i<5; i++) {
            let d = new Date();
            d.setDate(d.getDate() - i);
            let dateStr = d.toISOString().split('T')[0];
            for(const stu of stuRows) {
                await connection.query("INSERT IGNORE INTO attendance (student_id, section_id, date, status, marked_by) VALUES (?, ?, ?, 'present', ?)", [stu.id, sectionId, dateStr, tchRows[0]?.user_id]);
            }
        }

        // Timetable (day_of_week: 1=Mon..5=Fri)
        for(let day=1; day<=5; day++) {
            await connection.query("INSERT IGNORE INTO timetables (section_id, subject_id, teacher_user_id, day_of_week, period_no, start_time, end_time, session_id) VALUES (?, ?, ?, ?, 1, '09:00:00', '09:45:00', ?)", [sectionId, mathId, tchRows[0]?.user_id, day, sessionId]);
            await connection.query("INSERT IGNORE INTO timetables (section_id, subject_id, teacher_user_id, day_of_week, period_no, start_time, end_time, session_id) VALUES (?, ?, ?, ?, 2, '09:45:00', '10:30:00', ?)", [sectionId, sciId, tchRows[1]?.user_id, day, sessionId]);
        }

        // Fees
        await connection.query("INSERT IGNORE INTO fee_categories (name, description) VALUES ('Tuition Fee', 'Monthly Tuition')");
        let [fcRows] = await connection.query("SELECT id FROM fee_categories LIMIT 1");
        const feeCatId = fcRows[0]?.id;
        
        await connection.query("INSERT IGNORE INTO fee_structures (session_id, class_id, category_id, amount, due_date) VALUES (?, ?, ?, 2500, ?)", [sessionId, classId, feeCatId, dStr]);
        
        for(const stu of stuRows) {
            await connection.query("INSERT IGNORE INTO fee_records (student_id, session_id, category_id, total_amount, paid_amount, due_date, status) VALUES (?, ?, ?, 2500, 2500, ?, 'PAID')", [stu.id, sessionId, feeCatId, dStr]);
            let [frRows] = await connection.query("SELECT id FROM fee_records WHERE student_id = ? AND status = 'PAID' LIMIT 1", [stu.id]);
            await connection.query("INSERT IGNORE INTO receipts (receipt_no, razorpay_payment_id, fee_record_id, student_id) VALUES (?, 'MOCK_PAY_ID', ?, ?)", ['REC'+stu.id, frRows[0]?.id, stu.id]);
        }

        // Exams & Marks
        await connection.query("INSERT IGNORE INTO exams (name, session_id, class_id, exam_type, start_date, end_date, status) VALUES ('Mid Term Exam', ?, ?, 'mid_term', ?, ?, 'completed')", [sessionId, classId, dStr, dStr]);
        let [exRows] = await connection.query("SELECT id FROM exams LIMIT 1");
        const examId = exRows[0]?.id;
        
        for(const stu of stuRows) {
            await connection.query("INSERT IGNORE INTO marks (exam_id, student_id, subject_id, marks_obtained, max_marks, grade, entered_by) VALUES (?, ?, ?, 85, 100, 'A', ?)", [examId, stu.id, mathId, tchRows[0]?.user_id]);
            await connection.query("INSERT IGNORE INTO marks (exam_id, student_id, subject_id, marks_obtained, max_marks, grade, entered_by) VALUES (?, ?, ?, 78, 100, 'B', ?)", [examId, stu.id, sciId, tchRows[1]?.user_id]);
        }

        // Homework
        await connection.query("INSERT IGNORE INTO homework (section_id, subject_id, title, description, assigned_by, assigned_date, due_date, session_id) VALUES (?, ?, 'Algebra Practice', 'Complete ch 4', ?, ?, ?, ?)", [sectionId, mathId, tchRows[0]?.user_id, dStr, dStr, sessionId]);

        console.log('Seed completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
