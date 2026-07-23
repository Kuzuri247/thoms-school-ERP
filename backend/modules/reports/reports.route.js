const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const { verifyToken } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { ROLES } = require('../../config/constants');

router.get('/overview', verifyToken, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
    try {
        const [students] = await pool.query('SELECT COUNT(*) as count FROM students');
        const [teachers] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "teacher"');
        const [revenue] = await pool.query('SELECT SUM(total_amount) as total FROM fee_records WHERE status = "PAID"');
        
        res.json({
            success: true,
            data: {
                totalStudents: students[0].count,
                totalTeachers: teachers[0].count,
                totalRevenue: revenue[0].total || 0,
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/financial', verifyToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CASHIER), async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT r.*, s.first_name, s.last_name, s.admission_no, f.amount, fc.name as category_name
            FROM receipts r
            JOIN students s ON r.student_id = s.id
            JOIN fee_records f ON r.fee_record_id = f.id
            JOIN fee_categories fc ON f.category_id = fc.id
            ORDER BY r.generated_at DESC
        `);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
