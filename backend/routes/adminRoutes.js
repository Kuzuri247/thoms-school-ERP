const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { verifyToken, isSuperAdmin } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');
const pool = require('../config/db');

// Create user (Admin and Super Admin)
router.post('/users', [verifyToken, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)], async (req, res) => {
    let { email, password, role, class_name, section, full_name, phone, gender, department, designation, status, is_class_teacher, class_id, subject_name } = req.body;
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        if (req.user.role === ROLES.ADMIN && role === ROLES.SUPER_ADMIN) {
            await conn.rollback();
            return res.status(403).json({ success: false, message: 'Admins cannot assign elevated super_admin role' });
        }

        const isTempPassword = !password || !password.trim();
        const rawPassword = isTempPassword ? crypto.randomBytes(6).toString('hex') : password.trim();
        const hashedPassword = await bcrypt.hash(rawPassword, 8);

        const randNum = Math.floor(1000 + Math.random() * 9000);
        const finalEmail = email && email.trim() ? email.trim() : `${(full_name || 'user').toLowerCase().replace(/[^a-z]/g, '')}${randNum}@stthomas.edu`;

        const [result] = await conn.query(
            'INSERT INTO users (email, password, role, class, section, full_name, phone, gender, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [finalEmail, hashedPassword, role || 'teacher', class_name || null, section || null, full_name || null, phone || null, gender || 'Male', status || 'Active']
        );
        const newUserId = result.insertId;

        // If staff role, insert into staff_profiles
        if (['teacher', 'admin', 'cashier', 'staff'].includes(role)) {
            const fname = full_name ? full_name.split(' ')[0] : 'Staff';
            const lname = full_name ? full_name.split(' ').slice(1).join(' ') : '';
            const empCode = `TS-EMP-${String(newUserId).padStart(3, '0')}`;
            await conn.query(
                `INSERT INTO staff_profiles (user_id, employee_code, first_name, last_name, department, designation, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE department = VALUES(department), designation = VALUES(designation)`,
                [newUserId, empCode, fname, lname, department || 'General Staff', designation || role, 'Active']
            );
        }

        // If teacher role with class_id assignment
        if (role === 'teacher' && class_id) {
            // 1. Resolve section_id
            const [secRows] = await conn.query('SELECT id FROM sections WHERE class_id = ? LIMIT 1', [class_id]);
            let targetSectionId;
            if (secRows.length > 0) {
                targetSectionId = secRows[0].id;
            } else {
                const [newSec] = await conn.query('INSERT INTO sections (class_id, name) VALUES (?, ?)', [class_id, 'A']);
                targetSectionId = newSec.insertId;
            }

            // 2. Resolve subject_id if subject_name provided
            let subjectId = null;
            if (subject_name && subject_name.trim()) {
                const [subRows] = await conn.query('SELECT id FROM subjects WHERE name = ? LIMIT 1', [subject_name.trim()]);
                if (subRows.length > 0) {
                    subjectId = subRows[0].id;
                } else {
                    const [newSub] = await conn.query('INSERT INTO subjects (name, code) VALUES (?, ?)', [subject_name.trim(), subject_name.trim().slice(0, 4).toUpperCase()]);
                    subjectId = newSub.insertId;
                }
            }

            const { assignClassTeacher, assignSubjectTeacher } = require('../modules/staff/teacherAssignment.service');
            const [[activeSession]] = await conn.query('SELECT id FROM academic_sessions WHERE is_current = 1 LIMIT 1');
            const sessionId = activeSession?.id || 1;

            if (is_class_teacher) {
                // Switch any existing class teacher to subject teacher & assign new teacher as Class Teacher
                await assignClassTeacher(newUserId, targetSectionId, sessionId, conn);
                if (subjectId) {
                    await assignSubjectTeacher(newUserId, targetSectionId, subjectId, sessionId, conn);
                }
            } else {
                // Assign as Subject Teacher only
                await assignSubjectTeacher(newUserId, targetSectionId, subjectId, sessionId, conn);
            }
        }

        await conn.commit();

        res.status(201).json({
          success: true,
          message: 'User created successfully',
          id: newUserId,
          temp_password: isTempPassword ? rawPassword : undefined,
          data: {
            id: newUserId,
            full_name,
            email: finalEmail,
            role,
            department: department || 'General Staff',
            phone,
            status: 'Active'
          }
        });
    } catch (error) {
        await conn.rollback();
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        conn.release();
    }
});

// GET /api/admin/classes-with-teachers - List all classes with current Class Teacher name
router.get('/classes-with-teachers', [verifyToken, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)], async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.id AS class_id, c.name AS class_name, c.numeric_value,
                   sec.id AS section_id, sec.name AS section_name,
                   u.id AS teacher_user_id, u.full_name AS class_teacher_name, u.email AS class_teacher_email
            FROM classes c
            LEFT JOIN sections sec ON sec.class_id = c.id
            LEFT JOIN teacher_assignments ta ON ta.section_id = sec.id AND ta.is_class_teacher = 1
            LEFT JOIN users u ON ta.teacher_user_id = u.id
            ORDER BY c.numeric_value
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all users (Admin and Super Admin)
router.get('/users', [verifyToken, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)], async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, email, full_name, role, class as class_name, section, created_at FROM users ORDER BY created_at DESC');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete user (Admin and Super Admin)
router.delete('/users/:id', [verifyToken, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)], async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const [[targetUser]] = await pool.query('SELECT id, role FROM users WHERE id = ?', [targetUserId]);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (req.user.role !== ROLES.SUPER_ADMIN) {
            if (targetUser.role === ROLES.SUPER_ADMIN) {
                return res.status(403).json({ success: false, message: 'Only Super Admins can delete Super Admin accounts' });
            }
            if (String(req.user.id) === String(targetUserId)) {
                return res.status(403).json({ success: false, message: 'Admins cannot delete their own account' });
            }
        }

        await pool.query('DELETE FROM users WHERE id = ?', [targetUserId]);
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update user (Admin and Super Admin)
router.put('/users/:id', [verifyToken, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)], async (req, res) => {
    const { password, role, class_name, section, email, full_name, phone, gender, status } = req.body;
    try {
        if (req.user.role === ROLES.ADMIN && role === ROLES.SUPER_ADMIN) {
            return res.status(403).json({ success: false, message: 'Admins cannot assign elevated super_admin role' });
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 8);
            await pool.query('UPDATE users SET password = ?, role = ?, class = ?, section = ?, email = ?, full_name = ?, phone = ?, gender = ?, status = ? WHERE id = ?', 
                [hashedPassword, role, class_name || null, section || null, email, full_name || null, phone || null, gender || 'Male', status || 'Active', req.params.id]);
        } else {
            await pool.query('UPDATE users SET role = ?, class = ?, section = ?, email = ?, full_name = ?, phone = ?, gender = ?, status = ? WHERE id = ?', 
                [role, class_name || null, section || null, email, full_name || null, phone || null, gender || 'Male', status || 'Active', req.params.id]);
        }
        res.status(200).json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get Settings (Super Admin only)
router.get('/settings', [verifyToken, isSuperAdmin], async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings');
        const settings = {};
        rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update Settings (Super Admin only)
router.post('/settings', [verifyToken, isSuperAdmin], async (req, res) => {
    const { settings } = req.body;
    try {
        for (const [key, value] of Object.entries(settings)) {
            await pool.query(
                'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [key, value, value]
            );
        }
        res.status(200).json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get student attendance for a date (Admin / Super Admin)
router.get('/attendance', [verifyToken, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)], async (req, res) => {
    const { date } = req.query;
    try {
        if (!date) return res.status(400).json({ success: false, message: 'Date query parameter is required' });
        const [rows] = await pool.query(`
            SELECT a.student_id, a.status, s.user_id 
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            WHERE a.date = ?
        `, [date]);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Save student attendance in bulk
router.post('/attendance', [verifyToken, authorize(ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN)], async (req, res) => {
    const { date, attendanceData } = req.body;
    try {
        if (!date || !attendanceData) {
            return res.status(400).json({ success: false, message: 'Date and attendance data are required' });
        }
        for (const [userId, status] of Object.entries(attendanceData)) {
            const [[student]] = await pool.query('SELECT id, section_id FROM students WHERE user_id = ?', [userId]);
            if (student) {
                await pool.query(
                    'INSERT INTO attendance (student_id, section_id, date, status, marked_by) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?',
                    [student.id, student.section_id, date, status, req.user.id, status]
                );
            }
        }
        res.status(200).json({ success: true, message: 'Attendance saved successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get System Statistics (Super Admin & Admin)
router.get('/stats', [verifyToken, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)], async (req, res) => {
    try {
        const [[{ total_students }]] = await pool.query("SELECT COUNT(*) AS total_students FROM users WHERE role = 'student'");
        const [[{ total_teachers }]] = await pool.query("SELECT COUNT(*) AS total_teachers FROM users WHERE role = 'teacher'");
        const [[{ total_admins }]] = await pool.query("SELECT COUNT(*) AS total_admins FROM users WHERE role IN ('admin', 'super_admin')");
        const [[{ total_staff }]] = await pool.query("SELECT COUNT(*) AS total_staff FROM users WHERE role IN ('cashier')");

        let total_revenue = null;
        if (req.user.role === 'super_admin') {
            const [[payRes]] = await pool.query("SELECT SUM(amount_paise)/100 AS total FROM razorpay_payments WHERE status = 'captured'");
            total_revenue = parseFloat(payRes?.total || 0);
            if (total_revenue === 0) {
                const [[frRes]] = await pool.query("SELECT SUM(paid_amount) AS total FROM fee_records");
                total_revenue = parseFloat(frRes?.total || 0);
            }
        }

        res.status(200).json({
            success: true,
            data: {
                total_students: total_students || 0,
                total_teachers: total_teachers || 0,
                total_admins: total_admins || 0,
                total_staff: total_staff || 0,
                total_revenue: total_revenue
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all classes (Admin / Super Admin) - no sections, each grade is a single class
router.get('/classes', [verifyToken, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)], async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.id AS class_id, c.name AS class_name, c.numeric_value
            FROM classes c
            ORDER BY c.numeric_value
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get students for a specific class (Admin / Super Admin)
router.get('/classes/:classId/students', [verifyToken, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)], async (req, res) => {
    try {
        const { classId } = req.params;
        const [rows] = await pool.query(`
            SELECT s.id AS student_id, s.user_id, s.admission_no, s.roll_no, s.first_name, s.last_name,
                   s.gender, s.blood_group, s.city, s.state, s.admission_date, s.status, s.address,
                   u.email, u.phone, c.id AS class_id, c.name AS class_name,
                   g_father.full_name AS father_name, g_guard.full_name AS guardian_name
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN sections sec ON s.section_id = sec.id
            LEFT JOIN classes c ON sec.class_id = c.id
            LEFT JOIN guardians g_father ON g_father.student_id = s.id AND g_father.relation = 'father'
            LEFT JOIN guardians g_guard ON g_guard.student_id = s.id AND g_guard.relation = 'guardian'
            WHERE c.id = ?
            ORDER BY s.roll_no, s.first_name
        `, [classId]);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create a new student (Admin / Super Admin)
router.post('/students', [verifyToken, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)], async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const {
            first_name, last_name, email, phone, gender, dob, address,
            class_id, admission_no, roll_no,
            father_name, father_phone, father_occupation,
            mother_name, mother_phone, mother_occupation,
            guardian_name, guardian_phone, guardian_relation
        } = req.body;

        if (!first_name || !first_name.trim()) {
            await conn.rollback();
            return res.status(400).json({ success: false, message: 'First name is required' });
        }

        const fullName = `${first_name.trim()} ${last_name ? last_name.trim() : ''}`.trim();
        const randNum = Math.floor(1000 + Math.random() * 9000);
        const stuEmail = email && email.trim() ? email.trim() : `${first_name.toLowerCase().replace(/[^a-z]/g, '')}${randNum}@student.stthomas.edu`;

        // Check duplicate email
        const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [stuEmail]);
        let finalEmail = stuEmail;
        if (existing.length > 0) {
            finalEmail = `${first_name.toLowerCase().replace(/[^a-z]/g, '')}${Date.now()}@student.stthomas.edu`;
        }

        const tempPassword = crypto.randomBytes(6).toString('hex');
        const hashedPassword = await bcrypt.hash(tempPassword, 8);

        // 1. Insert into users table
        const [userResult] = await conn.query(
            'INSERT INTO users (email, password, role, full_name, phone, gender, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [finalEmail, hashedPassword, ROLES.STUDENT, fullName, phone || null, gender || 'Male', 'Active']
        );
        const userId = userResult.insertId;

        // 2. Resolve section_id for the given class_id
        let targetSectionId = null;
        if (class_id) {
            const [secRows] = await conn.query('SELECT id FROM sections WHERE class_id = ? LIMIT 1', [class_id]);
            if (secRows.length > 0) {
                targetSectionId = secRows[0].id;
            } else {
                const [newSec] = await conn.query('INSERT INTO sections (class_id, name) VALUES (?, ?)', [class_id, 'A']);
                targetSectionId = newSec.insertId;
            }
        }

        const finalAdmissionNo = admission_no && admission_no.trim() ? admission_no.trim() : `TS-2026-${String(userId).padStart(4, '0')}`;
        const finalRollNo = roll_no && roll_no.trim() ? roll_no.trim() : `R-${String(userId).padStart(3, '0')}`;

        // 3. Insert into students table
        const [stuResult] = await conn.query(
            `INSERT INTO students (user_id, section_id, admission_no, roll_no, first_name, last_name, gender, date_of_birth, address, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, targetSectionId, finalAdmissionNo, finalRollNo, first_name.trim(), last_name ? last_name.trim() : null, gender || 'Male', dob || null, address || null, 'Active']
        );
        const studentId = stuResult.insertId;

        // 4. Insert Guardians if provided
        if (father_name && father_name.trim()) {
            await conn.query(
                `INSERT INTO guardians (student_id, relation, full_name, phone, occupation) VALUES (?, 'father', ?, ?, ?)`,
                [studentId, father_name.trim(), father_phone || null, father_occupation || null]
            );
        }
        if (mother_name && mother_name.trim()) {
            await conn.query(
                `INSERT INTO guardians (student_id, relation, full_name, phone, occupation) VALUES (?, 'mother', ?, ?, ?)`,
                [studentId, mother_name.trim(), mother_phone || null, mother_occupation || null]
            );
        }
        if (guardian_name && guardian_name.trim()) {
            const rel = guardian_relation || 'guardian';
            await conn.query(
                `INSERT INTO guardians (student_id, relation, full_name, phone) VALUES (?, ?, ?, ?)`,
                [studentId, rel, guardian_name.trim(), guardian_phone || null]
            );
        }

        await conn.commit();

        res.status(201).json({
            success: true,
            message: 'Student added successfully',
            data: {
                student_id: studentId,
                user_id: userId,
                admission_no: finalAdmissionNo,
                roll_no: finalRollNo,
                first_name: first_name.trim(),
                last_name: last_name ? last_name.trim() : '',
                full_name: fullName,
                email: finalEmail,
                phone: phone || '',
                class_id: class_id || null,
                status: 'Active',
            }
        });
    } catch (error) {
        await conn.rollback();
        console.error('Error adding student:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        conn.release();
    }
});

module.exports = router;
