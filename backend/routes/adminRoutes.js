const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { verifyToken, isSuperAdmin } = require('../middleware/auth');
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_erp'
});

router.post('/users', [verifyToken, isSuperAdmin], async (req, res) => {
    let { email, password, role, class_name, section } = req.body;
    try {
        if (!password && role === 'student') {
            password = '123456';
        } else if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }
        const hashedPassword = await bcrypt.hash(password, 8);
        const [result] = await pool.query(
            'INSERT INTO users (email, password, role, class, section) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, role, class_name || null, section || null]
        );
        res.status(201).json({ message: 'User created successfully', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all users (Super Admin only)
router.get('/users', [verifyToken, isSuperAdmin], async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, email, role, class as class_name, section, created_at FROM users');
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
    const { password, role, class_name, section } = req.body;
    try {
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 8);
            await pool.query('UPDATE users SET password = ?, role = ?, class = ?, section = ? WHERE id = ?', 
                [hashedPassword, role, class_name || null, section || null, req.params.id]);
        } else {
            await pool.query('UPDATE users SET role = ?, class = ?, section = ? WHERE id = ?', 
                [role, class_name || null, section || null, req.params.id]);
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

module.exports = router;

