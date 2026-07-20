const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_erp'
});

exports.getMarksByStudent = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const [rows] = await pool.query(`
            SELECT m.*, s.name as subject_name, e.name as exam_name
            FROM marks m
            JOIN subjects s ON m.subject_id = s.id
            JOIN exams e ON m.exam_id = e.id
            WHERE m.student_id = ?
        `, [studentId]);
        res.json({ success: true, data: rows });
    } catch (err) {
        next(err);
    }
};

exports.saveMarks = async (req, res, next) => {
    try {
        // Dummy implementation for saving marks
        res.json({ success: true, message: 'Marks saved successfully' });
    } catch (err) {
        next(err);
    }
};

exports.getTimetableByClass = async (req, res, next) => {
    try {
        const { classId } = req.params;
        const [rows] = await pool.query(`
            SELECT t.*, s.name as subject_name, u.full_name as teacher_name
            FROM timetables t
            JOIN subjects s ON t.subject_id = s.id
            JOIN users u ON t.teacher_user_id = u.id
            JOIN sections sec ON t.section_id = sec.id
            WHERE sec.class_id = ?
        `, [classId]);
        res.json({ success: true, data: rows });
    } catch (err) {
        next(err);
    }
};
