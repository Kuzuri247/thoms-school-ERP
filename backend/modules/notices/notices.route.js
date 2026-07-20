const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const { verifyToken } = require('../../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT * FROM notices 
            WHERE is_published = 1 
            ORDER BY publish_date DESC, created_at DESC 
            LIMIT 20
        `);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
