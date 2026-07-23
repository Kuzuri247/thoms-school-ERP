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

// GET /api/notices/student-work - Get work notices for student
router.get('/student-work', verifyToken, authorize(ROLES.STUDENT), async (req, res) => {
  try {
    // Get student section_id if available
    const [[student]] = await pool.query('SELECT section_id FROM students WHERE user_id = ?', [req.user.id]);
    const sectionId = student?.section_id || null;

    const [rows] = await pool.query(`
      SELECT n.*, u.full_name AS published_by_name
      FROM notices n
      LEFT JOIN users u ON n.published_by = u.id
      WHERE n.is_published = 1 AND n.type = 'work' 
        AND (n.target_role = 'student' OR n.target_role IS NULL)
        AND (n.target_section_id IS NULL OR n.target_section_id = ?)
      ORDER BY n.publish_date DESC, n.created_at DESC 
      LIMIT 20
    `, [sectionId]);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/notices/admin/all - Get all notices (Admin / Super Admin management view)
router.get('/admin/all', verifyToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT n.*, u.full_name AS published_by_name, s.name AS section_name
      FROM notices n
      LEFT JOIN users u ON n.published_by = u.id
      LEFT JOIN sections s ON n.target_section_id = s.id
      ORDER BY n.created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/notices/:id - Get single notice by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [[notice]] = await pool.query(`
      SELECT n.*, u.full_name AS published_by_name
      FROM notices n
      LEFT JOIN users u ON n.published_by = u.id
      WHERE n.id = ?
    `, [req.params.id]);

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }
    res.json({ success: true, data: notice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/notices - Create notice (Super Admin and Admin only)
router.post('/', verifyToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), async (req, res) => {
  try {
    const { title, content, notice_type, type = 'global', target_role, target_roles, target_section_id, publish_date, expiry_date, is_published } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO notices (title, content, notice_type, type, target_role, target_roles, target_section_id, published_by, is_published, publish_date, expiry_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        content,
        notice_type || 'general',
        type,
        target_role || null,
        target_roles ? JSON.stringify(target_roles) : null,
        target_section_id || null,
        req.user.id,
        is_published !== undefined ? (is_published ? 1 : 0) : 1,
        publish_date || new Date().toISOString().split('T')[0],
        expiry_date || null,
      ]
    );
    res.status(201).json({ success: true, message: 'Notice created successfully', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/notices/:id - Update notice (Super Admin and Admin only)
router.put('/:id', verifyToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), async (req, res) => {
  try {
    const { title, content, notice_type, type, target_role, target_roles, target_section_id, publish_date, expiry_date, is_published } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const [[existing]] = await pool.query('SELECT id FROM notices WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    await pool.query(
      `UPDATE notices 
       SET title = ?, content = ?, notice_type = ?, type = ?, target_role = ?, target_roles = ?, target_section_id = ?, is_published = ?, publish_date = ?, expiry_date = ?
       WHERE id = ?`,
      [
        title,
        content,
        notice_type || 'general',
        type || 'global',
        target_role || null,
        target_roles ? JSON.stringify(target_roles) : null,
        target_section_id || null,
        is_published !== undefined ? (is_published ? 1 : 0) : 1,
        publish_date || new Date().toISOString().split('T')[0],
        expiry_date || null,
        req.params.id,
      ]
    );
    res.json({ success: true, message: 'Notice updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/notices/:id/publish - Toggle or set publish status (Super Admin and Admin only)
router.patch('/:id/publish', verifyToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), async (req, res) => {
  try {
    const { is_published } = req.body;
    const [[notice]] = await pool.query('SELECT id, is_published FROM notices WHERE id = ?', [req.params.id]);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    const newStatus = is_published !== undefined ? (is_published ? 1 : 0) : (notice.is_published ? 0 : 1);
    await pool.query('UPDATE notices SET is_published = ? WHERE id = ?', [newStatus, req.params.id]);
    res.json({ success: true, message: `Notice ${newStatus ? 'published' : 'unpublished'} successfully`, is_published: newStatus });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/notices/:id - Delete notice (Super Admin and Admin only)
router.delete('/:id', verifyToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), async (req, res) => {
  try {
    const [[notice]] = await pool.query('SELECT id FROM notices WHERE id = ?', [req.params.id]);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    await pool.query('DELETE FROM notices WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
