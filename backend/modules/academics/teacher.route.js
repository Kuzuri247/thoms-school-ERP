const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const { verifyToken } = require('../../middleware/auth');

router.get('/classes', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.id, c.name, s.name as subject, ta.is_class_teacher
            FROM teacher_assignments ta
            JOIN sections sec ON ta.section_id = sec.id
            JOIN classes c ON sec.class_id = c.id
            JOIN subjects s ON ta.subject_id = s.id
            WHERE ta.teacher_user_id = ?
        `, [req.user.id]);
        
        const classes = rows.map(r => ({
            id: r.id,
            name: r.name,
            subject: r.subject,
            role: r.is_class_teacher ? 'Class Teacher' : 'Subject Teacher'
        }));
        
        res.json({ success: true, data: classes });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/classes/:classId/students', verifyToken, async (req, res) => {
    try {
        const { classId } = req.params;
        const [rows] = await pool.query(`
            SELECT s.id, s.admission_no as roll, CONCAT(s.first_name, ' ', s.last_name) as name, 
                   'Present' as attendance, 0 as englishMark
            FROM students s
            JOIN sections sec ON s.section_id = sec.id
            WHERE sec.class_id = ?
        `, [classId]);
        
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
