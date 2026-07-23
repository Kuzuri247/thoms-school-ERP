const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const { verifyToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_erp'
});

router.get('/students', verifyToken, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, email, class, section FROM users WHERE role = "student"');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/change-password', verifyToken, async (req, res) => {
    const { newPassword } = req.body;
    try {
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 8);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const parsedId = isNaN(parseInt(email)) ? -1 : parseInt(email);
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ? OR id = ?', [email, parsedId]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = rows[0];
        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) return res.status(401).json({ error: 'Invalid Password' });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret_key', {
            expiresIn: 86400 // 24 hours
        });

        res.status(200).json({
            id: user.id,
            email: user.email,
            role: user.role,
            class: user.class,
            accessToken: token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const nodemailer = require('nodemailer');
router.get('/permissions', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT setting_value FROM settings WHERE setting_key = "role_permissions"');
        if (rows.length > 0) {
            res.status(200).json({ role_permissions: rows[0].setting_value });
        } else {
            res.status(200).json({ role_permissions: null });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        
        // Fetch SMTP settings
        const [settingRows] = await pool.query('SELECT setting_key, setting_value FROM settings WHERE setting_key IN ("smtp_host", "smtp_port", "smtp_user", "smtp_pass")');
        const settings = {};
        settingRows.forEach(row => settings[row.setting_key] = row.setting_value);

        if (!settings.smtp_host || !settings.smtp_user || !settings.smtp_pass) {
            return res.status(500).json({ error: 'SMTP settings are not configured properly. Contact Super Admin.' });
        }

        const transporter = nodemailer.createTransport({
            host: settings.smtp_host,
            port: parseInt(settings.smtp_port) || 587,
            secure: parseInt(settings.smtp_port) === 465,
            auth: {
                user: settings.smtp_user,
                pass: settings.smtp_pass
            }
        });

        // Mock token for demonstration
        const resetToken = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '1h' });
        const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

        await transporter.sendMail({
            from: `"Thomson ERP" <${settings.smtp_user}>`,
            to: email,
            subject: "Password Reset Request",
            text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
            html: `<p>You requested a password reset.</p><p><a href="${resetLink}">Click here to reset your password</a></p>`
        });

        res.status(200).json({ message: 'Password reset instructions sent to your email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send email. Check SMTP settings.' });
    }
});

module.exports = router;
