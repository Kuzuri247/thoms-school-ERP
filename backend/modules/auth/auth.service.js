const pool = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateTokens = (user) => {
  const payload = { id: user.id, role: user.role, email: user.email };
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const login = async (emailOrId, password) => {
  const parsedId = isNaN(parseInt(emailOrId)) ? -1 : parseInt(emailOrId);
  const [rows] = await pool.query(
    'SELECT id, email, full_name, password, role, status FROM users WHERE (email = ? OR id = ?) AND status = "active"',
    [emailOrId, parsedId]
  );
  if (!rows.length) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const { accessToken, refreshToken } = generateTokens(user);
  const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  await pool.query('UPDATE users SET refresh_token_hash = ?, last_login = NOW() WHERE id = ?', [refreshHash, user.id]);

  return {
    user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
    accessToken,
    refreshToken,
  };
};

const refresh = async (token) => {
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw Object.assign(new Error('Invalid refresh token'), { status: 401 });
  }
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const [rows] = await pool.query(
    'SELECT id, email, full_name, role, status FROM users WHERE id = ? AND refresh_token_hash = ? AND status = "active"',
    [decoded.id, hash]
  );
  if (!rows.length) throw Object.assign(new Error('Session expired'), { status: 401 });

  const { accessToken, refreshToken: newRefresh } = generateTokens(rows[0]);
  const newHash = crypto.createHash('sha256').update(newRefresh).digest('hex');
  await pool.query('UPDATE users SET refresh_token_hash = ? WHERE id = ?', [newHash, rows[0].id]);
  return { accessToken, refreshToken: newRefresh };
};

const logout = async (userId) => {
  await pool.query('UPDATE users SET refresh_token_hash = NULL WHERE id = ?', [userId]);
};

module.exports = { login, refresh, logout };