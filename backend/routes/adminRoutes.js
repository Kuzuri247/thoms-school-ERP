const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { verifyToken, isSuperAdmin } = require('../middleware/auth');
const pool = require('../config/db');

router.post('/users', [verifyToken, isSuperAdmin], async (req, res) => {
    let { email, password, role, class_name, section, full_name, phone, gender, status } = req.body;
    try {
        if (!password && role === 'student') {
            password = '123456';
        } else if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }
        const hashedPassword = await bcrypt.hash(password, 8);
        const [result] = await pool.query(
            'INSERT INTO users (email, password, role, class, section, full_name, phone, gender, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [email, hashedPassword, role, class_name || null, section || null, full_name || null, phone || null, gender || 'Male', status || 'Active']
        );
        res.status(201).json({ message: 'User created successfully', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all users (Super Admin only)
router.get('/users', [verifyToken, isSuperAdmin], async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, email, full_name, role, class as class_name, section, created_at FROM users');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete user
router.delete('/users/:id', [verifyToken, isSuperAdmin], async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user (Super Admin only)
router.put('/users/:id', [verifyToken, isSuperAdmin], async (req, res) => {
    const { password, role, class_name, section, email, full_name, phone, gender, status } = req.body;
    try {
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 8);
            await pool.query('UPDATE users SET password = ?, role = ?, class = ?, section = ?, email = ?, full_name = ?, phone = ?, gender = ?, status = ? WHERE id = ?', 
                [hashedPassword, role, class_name || null, section || null, email, full_name || null, phone || null, gender || 'Male', status || 'Active', req.params.id]);
        } else {
            await pool.query('UPDATE users SET role = ?, class = ?, section = ?, email = ?, full_name = ?, phone = ?, gender = ?, status = ? WHERE id = ?', 
                [role, class_name || null, section || null, email, full_name || null, phone || null, gender || 'Male', status || 'Active', req.params.id]);
        }
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        res.status(200).json({ message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get student attendance for a date
router.get('/attendance', [verifyToken], async (req, res) => {
    const { date } = req.query;
    try {
        if (!date) return res.status(400).json({ error: 'Date query parameter is required' });
        const [rows] = await pool.query(`
            SELECT a.student_id, a.status, s.user_id 
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            WHERE a.date = ?
        `, [date]);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save student attendance in bulk
router.post('/attendance', [verifyToken], async (req, res) => {
    const { date, attendanceData } = req.body;
    if (!['teacher', 'admin', 'super_admin'].includes(req.user?.role)) {
        return res.status(403).json({ error: 'Access denied' });
    }
    try {
        if (!date || !attendanceData) {
            return res.status(400).json({ error: 'Date and attendance data are required' });
        }
        for (const [userId, status] of Object.entries(attendanceData)) {
            // Find student id by user_id
            const [[student]] = await pool.query('SELECT id, section_id FROM students WHERE user_id = ?', [userId]);
            if (student) {
                await pool.query(
                    'INSERT INTO attendance (student_id, section_id, date, status, marked_by) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?',
                    [student.id, student.section_id, date, status, req.user.id, status]
                );
            }
        }
        res.status(200).json({ message: 'Attendance saved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

