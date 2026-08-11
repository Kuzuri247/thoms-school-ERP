const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { verifyToken, isSuperAdmin } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');
const pool = require('../config/db');

const { generateAdmissionNo, generateRollNo } = require('../utils/identifierGenerator');

// Create user (Admin and Super Admin)
router.post('/users', [verifyToken, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)], async (req, res) => {
    let conn;
    try {
        let {
            email, password, role, class_name, section, full_name, phone, gender,
            department, designation, qualification, joining_date, address, dob, date_of_birth,
            emergency_contact, status, is_class_teacher, class_id, subject_name, subject_assignments
        } = req.body;

        if (!full_name || !full_name.trim()) {
            return res.status(400).json({ success: false, message: 'Full name is required' });
        }

        const trimmedEmail = (email || '').trim();
        if (!trimmedEmail) {
            return res.status(400).json({ success: false, message: 'Primary email address is required' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            return res.status(400).json({ success: false, message: 'Invalid primary email address format' });
        }

        const trimmedPhone = (phone || '').trim();
        if (!trimmedPhone || !/^\d{10}$/.test(trimmedPhone)) {
            return res.status(400).json({ success: false, message: 'Contact phone number must be exactly 10 digits' });
        }

        const trimmedEmergency = (emergency_contact || '').trim();
        if (trimmedEmergency && !/^\d{10}$/.test(trimmedEmergency)) {
            return res.status(400).json({ success: false, message: 'Emergency contact phone number must be exactly 10 digits' });
        }

        conn = await pool.getConnection();
        await conn.beginTransaction();

        const effectiveRole = role || 'teacher';

        if (req.user.role === ROLES.ADMIN && effectiveRole === ROLES.SUPER_ADMIN) {
            await conn.rollback();
            return res.status(403).json({ success: false, message: 'Admins cannot assign elevated super_admin role' });
        }

        const isTempPassword = !password || !password.trim();
        const rawPassword = isTempPassword ? crypto.randomBytes(6).toString('hex') : password.trim();
        const hashedPassword = await bcrypt.hash(rawPassword, 8);

        const finalEmail = trimmedEmail;

        const [result] = await conn.query(
            'INSERT INTO users (email, password, role, class, section, full_name, phone, gender, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [finalEmail, hashedPassword, effectiveRole, class_name || null, section || null, full_name.trim(), trimmedPhone, gender || 'Male', 'active']
        );
        const newUserId = result.insertId;
        const empCode = `TS-EMP-${String(newUserId).padStart(3, '0')}`;

        // If staff role, insert into staff_profiles
        if (['teacher', 'admin', 'cashier', 'staff'].includes(effectiveRole)) {
            const fname = full_name.trim().split(' ')[0] || 'Staff';
            const lname = full_name.trim().split(' ').slice(1).join(' ') || '';
            const dobVal = dob || date_of_birth || null;
            const joinDateVal = joining_date || new Date().toISOString().split('T')[0];

            await conn.query(
                `INSERT INTO staff_profiles (
                    user_id, employee_code, first_name, last_name, gender, date_of_birth,
                    phone, emergency_contact, address, designation, department, joining_date, qualification, status
                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                     first_name = VALUES(first_name),
                     last_name = VALUES(last_name),
                     gender = VALUES(gender),
                     date_of_birth = VALUES(date_of_birth),
                     phone = VALUES(phone),
                     emergency_contact = VALUES(emergency_contact),
                     address = VALUES(address),
                     designation = VALUES(designation),
                     department = VALUES(department),
                     joining_date = VALUES(joining_date),
                     qualification = VALUES(qualification),
                     status = VALUES(status)`,
                [
                    newUserId, empCode, fname, lname, gender || 'Male', dobVal,
                    trimmedPhone, trimmedEmergency || null, address || null,
                    designation || effectiveRole, department || 'General Staff', joinDateVal, qualification || null, 'active'
                ]
            );
        }

        // If teacher role with class assignments
        if (effectiveRole === 'teacher') {
            const { assignClassTeacher, assignSubjectTeacher } = require('../modules/staff/teacherAssignment.service');
            const [[activeSession]] = await conn.query('SELECT id FROM academic_sessions WHERE is_current = 1 LIMIT 1');
            const sessionId = activeSession?.id || 1;

            // Handle primary homeroom class assignment if selected
            if (class_id) {
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

                if (is_class_teacher) {
                    // Switch any existing class teacher to subject teacher & assign new teacher as Class Teacher
                    await assignClassTeacher(newUserId, targetSectionId, sessionId, conn);
                    if (subjectId) {
                        await conn.query(
                            'UPDATE teacher_assignments SET subject_id = ? WHERE teacher_user_id = ? AND section_id = ? AND session_id = ? AND is_class_teacher = 1',
                            [subjectId, newUserId, targetSectionId, sessionId]
                        );
                    }
                } else if (subjectId) {
                    // Assign as Subject Teacher only when subjectId is present
                    await assignSubjectTeacher(newUserId, targetSectionId, subjectId, sessionId, conn);
                }
            }

            // Process multiple additional subject assignments across other classes
            if (Array.isArray(subject_assignments) && subject_assignments.length > 0) {
                for (const sa of subject_assignments) {
                    if (!sa.class_id || !sa.subject_name || !String(sa.subject_name).trim()) continue;

                    const saClassId = sa.class_id;
                    const saSubjName = String(sa.subject_name).trim();

                    const [secRows] = await conn.query('SELECT id FROM sections WHERE class_id = ? LIMIT 1', [saClassId]);
                    let targetSectionId;
                    if (secRows.length > 0) {
                        targetSectionId = secRows[0].id;
                    } else {
                        const [newSec] = await conn.query('INSERT INTO sections (class_id, name) VALUES (?, ?)', [saClassId, 'A']);
                        targetSectionId = newSec.insertId;
                    }

                    const [subRows] = await conn.query('SELECT id FROM subjects WHERE name = ? LIMIT 1', [saSubjName]);
                    let subjectId;
                    if (subRows.length > 0) {
                        subjectId = subRows[0].id;
                    } else {
                        const [newSub] = await conn.query('INSERT INTO subjects (name, code) VALUES (?, ?)', [saSubjName, saSubjName.slice(0, 4).toUpperCase()]);
                        subjectId = newSub.insertId;
                    }

                    await assignSubjectTeacher(newUserId, targetSectionId, subjectId, sessionId, conn);
                }
            }
        }

        await conn.commit();

        res.status(201).json({
          success: true,
          message: 'Staff account provisioned successfully',
          id: newUserId,
          temp_password: isTempPassword ? rawPassword : undefined,
          data: {
            id: newUserId,
            full_name: full_name.trim(),
            email: finalEmail,
            role: effectiveRole,
            department: department || 'General Staff',
            designation: designation || effectiveRole,
            employee_code: empCode,
            phone: trimmedPhone,
            gender: gender || 'Male',
            qualification: qualification || null,
            status: 'active'
          }
        });
    } catch (error) {
        if (conn) await conn.rollback();
        console.error('Error creating user:', error);
        res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
            success: false,
            message: error.code === 'ER_DUP_ENTRY' ? 'User with this email address already exists' : error.message
        });
    } finally {
        if (conn) conn.release();
    }
});

// GET /api/admin/classes-with-teachers - List all classes with current Class Teacher name
router.get('/classes-with-teachers', [verifyToken, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)], async (req, res) => {
    try {
        const [[activeSession]] = await pool.query('SELECT id FROM academic_sessions WHERE is_current = 1 LIMIT 1');
        const activeSessionId = activeSession?.id || 1;

        const [rows] = await pool.query(`
            SELECT c.id AS class_id, c.name AS class_name, c.numeric_value,
                   sec.id AS section_id, sec.name AS section_name,
                   u.id AS teacher_user_id, u.full_name AS class_teacher_name, u.email AS class_teacher_email
            FROM classes c
            LEFT JOIN sections sec ON sec.class_id = c.id
            LEFT JOIN teacher_assignments ta ON ta.section_id = sec.id AND ta.is_class_teacher = 1 AND (ta.session_id = ? OR ta.session_id IS NULL)
            LEFT JOIN users u ON ta.teacher_user_id = u.id
            ORDER BY c.numeric_value
        `, [activeSessionId]);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all users (Admin and Super Admin)
router.get('/users', [verifyToken, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)], async (req, res) => {
    try {
        const [[activeSession]] = await pool.query('SELECT id FROM academic_sessions WHERE is_current = 1 LIMIT 1');
        const activeSessionId = activeSession?.id || 1;

        const [rows] = await pool.query(`
            SELECT u.id, u.email, u.full_name, u.role, u.gender, u.phone, u.status,
                   u.class as class_name, u.section, u.created_at,
                   sp.employee_code, sp.department, sp.designation, sp.qualification, sp.joining_date,
                   (
                     SELECT GROUP_CONCAT(
                       DISTINCT CONCAT(c.name, ' - ', sec.name, IF(ta.is_class_teacher = 1, ' (Class Teacher)', ''))
                       ORDER BY ta.is_class_teacher DESC, c.numeric_value ASC
                       SEPARATOR ', '
                     )
                     FROM teacher_assignments ta
                     JOIN sections sec ON ta.section_id = sec.id
                     JOIN classes c ON sec.class_id = c.id
                     WHERE ta.teacher_user_id = u.id AND (ta.session_id = ? OR ta.session_id IS NULL)
                   ) AS assigned_classes,
                   (
                     SELECT GROUP_CONCAT(DISTINCT CONCAT(c.name, ' - ', sec.name) ORDER BY c.numeric_value ASC SEPARATOR ', ')
                     FROM teacher_assignments ta
                     JOIN sections sec ON ta.section_id = sec.id
                     JOIN classes c ON sec.class_id = c.id
                     WHERE ta.teacher_user_id = u.id AND ta.is_class_teacher = 1 AND (ta.session_id = ? OR ta.session_id IS NULL)
                   ) AS homeroom_class,
                   (
                     SELECT GROUP_CONCAT(DISTINCT CONCAT(c.name, ' - ', sec.name) ORDER BY c.numeric_value ASC SEPARATOR ', ')
                     FROM teacher_assignments ta
                     JOIN sections sec ON ta.section_id = sec.id
                     JOIN classes c ON sec.class_id = c.id
                     WHERE ta.teacher_user_id = u.id AND (ta.is_class_teacher IS NULL OR ta.is_class_teacher = 0) AND (ta.session_id = ? OR ta.session_id IS NULL)
                   ) AS subject_classes
            FROM users u
            LEFT JOIN staff_profiles sp ON sp.user_id = u.id
            ORDER BY u.created_at DESC
        `, [activeSessionId, activeSessionId, activeSessionId]);
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

        // Reject self-deletion for ALL roles (including SUPER_ADMIN)
        if (String(req.user.id) === String(targetUserId)) {
            return res.status(403).json({ success: false, message: 'Self-deletion is not permitted. You cannot delete your logged-in account.' });
        }

        // Admins cannot delete Super Admin accounts
        if (req.user.role !== ROLES.SUPER_ADMIN && targetUser.role === ROLES.SUPER_ADMIN) {
            return res.status(403).json({ success: false, message: 'Only Super Admins can delete Super Admin accounts' });
        }

        // Prevent deletion of the last remaining Super Admin
        if (targetUser.role === ROLES.SUPER_ADMIN) {
            const [[{ saCount }]] = await pool.query("SELECT COUNT(*) AS saCount FROM users WHERE role = 'super_admin'");
            if (saCount <= 1) {
                return res.status(403).json({ success: false, message: 'Cannot delete the last remaining Super Admin account' });
            }
        }

        await pool.query('DELETE FROM users WHERE id = ?', [targetUserId]);
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update user profile or toggle status (Admin and Super Admin)
router.put('/users/:id', [verifyToken, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)], async (req, res) => {
    let conn;
    try {
        const { password, role, class_name, section, email, full_name, phone, gender, status } = req.body;
        conn = await pool.getConnection();
        await conn.beginTransaction();

        const [[existingUser]] = await conn.query('SELECT role, email, full_name, phone, gender, status FROM users WHERE id = ?', [req.params.id]);
        if (!existingUser) {
            await conn.rollback();
            return res.status(404).json({ success: false, message: 'User account not found' });
        }

        // Target-role guard: Non-Super Admins cannot modify Super Admin accounts
        if (req.user.role !== ROLES.SUPER_ADMIN && existingUser.role === ROLES.SUPER_ADMIN) {
            await conn.rollback();
            return res.status(403).json({ success: false, message: 'Only Super Admins can modify Super Admin accounts' });
        }

        const newRole = role || existingUser.role;
        if (req.user.role === ROLES.ADMIN && newRole === ROLES.SUPER_ADMIN) {
            await conn.rollback();
            return res.status(403).json({ success: false, message: 'Admins cannot assign elevated super_admin role' });
        }

        // Coerce & validate status
        const ALLOWED_STATUSES = ['active', 'inactive', 'suspended', 'on_leave', 'graduated', 'transferred', 'left'];
        const rawStatus = status !== undefined && status !== null ? String(status).trim().toLowerCase() : '';
        if (rawStatus && !ALLOWED_STATUSES.includes(rawStatus)) {
            await conn.rollback();
            return res.status(400).json({ success: false, message: `Invalid status value. Must be one of: ${ALLOWED_STATUSES.join(', ')}` });
        }
        const newStatus = rawStatus || (existingUser.status || 'active').toLowerCase();

        // Validate email format if provided
        const newEmail = email !== undefined && email !== null ? String(email).trim() : existingUser.email;
        if (email !== undefined && (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail))) {
            await conn.rollback();
            return res.status(400).json({ success: false, message: 'Invalid primary email address format' });
        }

        // Validate phone format if provided
        let newPhone = existingUser.phone;
        if (phone !== undefined) {
            const trimmedP = phone !== null ? String(phone).trim() : '';
            if (trimmedP && !/^\d{10}$/.test(trimmedP)) {
                await conn.rollback();
                return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits' });
            }
            newPhone = trimmedP || null;
        }

        const newFullName = full_name !== undefined && full_name !== null ? String(full_name).trim() : existingUser.full_name;
        const newGender = gender || existingUser.gender;

        if (password && String(password).trim()) {
            const hashedPassword = await bcrypt.hash(String(password).trim(), 8);
            await conn.query(
                'UPDATE users SET password = ?, role = ?, class = ?, section = ?, email = ?, full_name = ?, phone = ?, gender = ?, status = ? WHERE id = ?', 
                [hashedPassword, newRole, class_name || null, section || null, newEmail, newFullName, newPhone, newGender, newStatus, req.params.id]
            );
        } else {
            await conn.query(
                'UPDATE users SET role = ?, class = ?, section = ?, email = ?, full_name = ?, phone = ?, gender = ?, status = ? WHERE id = ?', 
                [newRole, class_name || null, section || null, newEmail, newFullName, newPhone, newGender, newStatus, req.params.id]
            );
        }

        // Sync status with staff_profiles or students table
        if (['teacher', 'admin', 'cashier', 'staff'].includes(newRole)) {
            await conn.query('UPDATE staff_profiles SET status = ? WHERE user_id = ?', [newStatus, req.params.id]);
        } else if (newRole === 'student') {
            await conn.query('UPDATE students SET status = ? WHERE user_id = ?', [newStatus, req.params.id]);
        }

        await conn.commit();
        res.status(200).json({ success: true, message: 'User account updated successfully', status: newStatus });
    } catch (error) {
        if (conn) await conn.rollback();
        console.error('Error updating user profile:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (conn) conn.release();
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
        const parts = String(date).split('T')[0].split('-');
        if (parts.length !== 3 || !parts.every((p) => /^\d+$/.test(p))) {
            return res.status(400).json({ success: false, message: 'Invalid attendance date format' });
        }
        const yr = parseInt(parts[0], 10);
        const mo = parseInt(parts[1], 10);
        const dy = parseInt(parts[2], 10);
        const dt = new Date(yr, mo - 1, dy);
        if (dt.getFullYear() !== yr || dt.getMonth() !== mo - 1 || dt.getDate() !== dy) {
            return res.status(400).json({ success: false, message: 'Invalid attendance date' });
        }
        if (dt.getDay() === 0) {
            return res.status(400).json({ success: false, message: 'Attendance cannot be marked on Sundays' });
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
            ORDER BY CAST(s.roll_no AS UNSIGNED) ASC, s.last_name ASC, s.first_name ASC
        `, [classId]);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get graduated students / Alumni list (Admin / Super Admin)
router.get('/graduates', [verifyToken, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)], async (req, res) => {
    try {
        const { session_id, page = 1, limit = 100 } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(500, Math.max(1, parseInt(limit, 10) || 100));
        const offset = (pageNum - 1) * limitNum;

        let sql = `
            SELECT s.id AS student_id, s.user_id, s.admission_no, s.roll_no, s.first_name, s.last_name,
                   s.gender, s.status, s.session_id, u.email, u.phone, 'Graduated' AS class_name, 'Alumni' AS section_name
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE (s.status = 'graduated' OR u.status = 'graduated')
        `;
        const params = [];

        let countSql = `
            SELECT COUNT(*) AS total
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE (s.status = 'graduated' OR u.status = 'graduated')
        `;
        const countParams = [];
        if (session_id) {
            countSql += ` AND s.session_id = ?`;
            countParams.push(session_id);
        }
        const [[{ total }]] = await pool.query(countSql, countParams);

        sql += ` ORDER BY s.last_name ASC, s.first_name ASC LIMIT ? OFFSET ?`;
        params.push(limitNum, offset);

        const [rows] = await pool.query(sql, params);
        res.json({ success: true, data: rows, total, page: pageNum, limit: limitNum });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create a new student (Admin / Super Admin)
router.post('/students', [verifyToken, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)], async (req, res) => {
    let conn;
    try {
        const {
            first_name, last_name, email, phone, gender, dob, address,
            class_id, admission_no, roll_no,
            father_name, father_phone, father_occupation,
            mother_name, mother_phone, mother_occupation,
            guardian_name, guardian_phone, guardian_relation
        } = req.body;

        if (!first_name || !first_name.trim()) {
            return res.status(400).json({ success: false, message: 'First name is required' });
        }

        const trimmedEmail = (email || '').trim();
        if (!trimmedEmail) {
            return res.status(400).json({ success: false, message: 'Primary student email address is required' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            return res.status(400).json({ success: false, message: 'Invalid primary email address format' });
        }

        const normPhone = (phone || '').trim() || null;
        const normFatherPhone = (father_phone || '').trim() || null;
        const normMotherPhone = (mother_phone || '').trim() || null;
        const normGuardianPhone = (guardian_phone || '').trim() || null;

        if (normPhone && !/^\d{10}$/.test(normPhone)) {
            return res.status(400).json({ success: false, message: 'Student phone number must be exactly 10 digits' });
        }
        if (normFatherPhone && !/^\d{10}$/.test(normFatherPhone)) {
            return res.status(400).json({ success: false, message: 'Father phone number must be exactly 10 digits' });
        }
        if (normMotherPhone && !/^\d{10}$/.test(normMotherPhone)) {
            return res.status(400).json({ success: false, message: 'Mother phone number must be exactly 10 digits' });
        }
        if (normGuardianPhone && !/^\d{10}$/.test(normGuardianPhone)) {
            return res.status(400).json({ success: false, message: 'Guardian phone number must be exactly 10 digits' });
        }

        conn = await pool.getConnection();
        await conn.beginTransaction();

        const fullName = `${first_name.trim()} ${last_name ? last_name.trim() : ''}`.trim();
        const finalEmail = trimmedEmail;

        const tempPassword = crypto.randomBytes(6).toString('hex');
        const hashedPassword = await bcrypt.hash(tempPassword, 8);

        // 1. Insert into users table
        const [userResult] = await conn.query(
            'INSERT INTO users (email, password, role, full_name, phone, gender, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [finalEmail, hashedPassword, ROLES.STUDENT, fullName, normPhone, gender || 'Male', 'active']
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

        const [[activeSession]] = await conn.query('SELECT name FROM academic_sessions WHERE is_current = 1 LIMIT 1');
        const sessionYear = activeSession?.name ? parseInt(activeSession.name.split('-')[0]) || new Date().getFullYear() : new Date().getFullYear();

        const finalAdmissionNo = admission_no && admission_no.trim() ? admission_no.trim() : generateAdmissionNo(userId, sessionYear);
        const finalRollNo = roll_no && roll_no.trim() ? roll_no.trim() : generateRollNo(userId);

        // 3. Insert into students table
        const [stuResult] = await conn.query(
            `INSERT INTO students (user_id, section_id, admission_no, roll_no, first_name, last_name, gender, date_of_birth, address, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, targetSectionId, finalAdmissionNo, finalRollNo, first_name.trim(), last_name ? last_name.trim() : null, gender || 'Male', dob || null, address || null, 'active']
        );
        const studentId = stuResult.insertId;

        // 4. Insert Guardians if provided
        const fatherNameVal = father_name && father_name.trim() ? father_name.trim() : null;
        const fatherOccVal = father_occupation && father_occupation.trim() ? father_occupation.trim() : null;
        if (fatherNameVal) {
            await conn.query(
                `INSERT INTO guardians (student_id, relation, full_name, phone, occupation) VALUES (?, 'father', ?, ?, ?)`,
                [studentId, fatherNameVal, normFatherPhone, fatherOccVal]
            );
        }
        if (mother_name && mother_name.trim()) {
            await conn.query(
                `INSERT INTO guardians (student_id, relation, full_name, phone, occupation) VALUES (?, 'mother', ?, ?, ?)`,
                [studentId, mother_name.trim(), normMotherPhone, mother_occupation && mother_occupation.trim() ? mother_occupation.trim() : null]
            );
        }
        if (guardian_name && guardian_name.trim()) {
            const rel = guardian_relation || 'guardian';
            await conn.query(
                `INSERT INTO guardians (student_id, relation, full_name, phone) VALUES (?, ?, ?, ?)`,
                [studentId, rel, guardian_name.trim(), normGuardianPhone]
            );
        }

        await conn.commit();

        res.status(201).json({
            success: true,
            message: 'Student added successfully',
            temp_password: tempPassword,
            data: {
                student_id: studentId,
                user_id: userId,
                admission_no: finalAdmissionNo,
                roll_no: finalRollNo,
                first_name: first_name.trim(),
                last_name: last_name ? last_name.trim() : '',
                full_name: fullName,
                email: finalEmail,
                phone: normPhone || '',
                father_name: fatherNameVal || '',
                father_occupation: fatherOccVal || '',
                class_id: class_id || null,
                status: 'active',
            }
        });
    } catch (error) {
        if (conn) await conn.rollback();
        console.error('Error adding student:', error);
        res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
            success: false,
            message: error.code === 'ER_DUP_ENTRY' ? 'Student with this email or admission number already exists.' : error.message
        });
    } finally {
        if (conn) conn.release();
    }
});

module.exports = router;
