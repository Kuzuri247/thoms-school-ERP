const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const { verifyToken } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { ROLES } = require('../../config/constants');

// GET /api/notices - List published global notices
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT n.*, u.full_name AS published_by_name
      FROM notices n
      LEFT JOIN users u ON n.published_by = u.id
      WHERE n.is_published = 1 AND (n.type = 'global' OR n.type IS NULL)
      ORDER BY n.publish_date DESC, n.created_at DESC 
      LIMIT 20
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/notices - Create notice (Super Admin and Admin only)
router.post('/', verifyToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), async (req, res) => {
  try {
    const { title, content, notice_type, type = 'global', target_role, target_roles, publish_date, expiry_date } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO notices (title, content, notice_type, type, target_role, target_roles, published_by, is_published, publish_date, expiry_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        title,
        content,
        notice_type || 'general',
        type,
        target_role || null,
        target_roles ? JSON.stringify(target_roles) : null,
        req.user.id,
        publish_date || new Date().toISOString().split('T')[0],
        expiry_date || null,
      ]
    );
    res.status(201).json({ success: true, message: 'Notice created successfully', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/notices/student-work - Get work notices for student
router.get('/student-work', verifyToken, authorize(ROLES.STUDENT), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT n.*, u.full_name AS published_by_name
      FROM notices n
      LEFT JOIN users u ON n.published_by = u.id
      WHERE n.is_published = 1 AND n.type = 'work' AND (n.target_role = 'student' OR n.target_role IS NULL)
      ORDER BY n.publish_date DESC, n.created_at DESC 
      LIMIT 20
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
