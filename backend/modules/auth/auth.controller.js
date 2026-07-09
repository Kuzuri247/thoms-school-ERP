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
  res.json({ success: true, data: rows[0] || null });
};