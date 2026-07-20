const authService = require('./auth.service');

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTS);
  res.json({ success: true, message: 'Login successful', data: { user: result.user, accessToken: result.accessToken } });
};

exports.refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });
  const result = await authService.refresh(token);
  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTS);
  res.json({ success: true, data: { accessToken: result.accessToken } });
};

exports.logout = async (req, res) => {
  await authService.logout(req.user.id);
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out' });
};

exports.me = async (req, res) => {
  const pool = require('../../config/db');
  const [rows] = await pool.query(
    'SELECT id, email, full_name, role, status, last_login FROM users WHERE id = ?',
    [req.user.id]
  );
  const user = rows[0] || null;
  if (user) {
    if (user.role === 'student') {
      const [stuRows] = await pool.query('SELECT id as student_id, section_id FROM students WHERE user_id = ?', [user.id]);
      if (stuRows.length > 0) {
        user.student_id = stuRows[0].student_id;
        user.section_id = stuRows[0].section_id;
        const [secRows] = await pool.query('SELECT class_id FROM sections WHERE id = ?', [user.section_id]);
        user.class_id = secRows[0]?.class_id;
      }
    } else if (user.role === 'teacher') {
      const [tchRows] = await pool.query('SELECT id as staff_id FROM staff_profiles WHERE user_id = ?', [user.id]);
      if (tchRows.length > 0) user.staff_id = tchRows[0].staff_id;
    }
  }
  res.json({ success: true, data: user });
};

exports.students = async (req, res) => {
  const pool = require('../../config/db');
  const [rows] = await pool.query('SELECT id, email, full_name, class, section, phone, gender, status FROM users WHERE role = "student"');
  res.json(rows);
};

exports.changePassword = async (req, res) => {
  const { newPassword } = req.body;
  const bcrypt = require('bcrypt');
  const pool = require('../../config/db');
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  const hashedPassword = await bcrypt.hash(newPassword, 8);
  await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
  res.json({ message: 'Password updated successfully' });
};

exports.permissions = async (req, res) => {
  const pool = require('../../config/db');
  const [rows] = await pool.query('SELECT setting_value FROM settings WHERE setting_key = "role_permissions"');
  if (rows.length > 0) {
    res.json({ role_permissions: rows[0].setting_value });
  } else {
    res.json({ role_permissions: null });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const pool = require('../../config/db');
  const jwt = require('jsonwebtoken');
  const nodemailer = require('nodemailer');
  
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
  
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

  const resetToken = jwt.sign({ id: rows[0].id }, process.env.JWT_ACCESS_SECRET || 'fallback_secret_key', { expiresIn: '1h' });
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: `"Thomson ERP" <${settings.smtp_user}>`,
    to: email,
    subject: "Password Reset Request",
    text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
    html: `<p>You requested a password reset.</p><p><a href="${resetLink}">Click here to reset your password</a></p>`
  });

  res.json({ message: 'Password reset instructions sent to your email.' });
};