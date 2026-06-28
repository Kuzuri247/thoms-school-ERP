const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function resetStudent() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'school_erp'
    });

    try {
        const hashedPassword = await bcrypt.hash('123456', 8);
        await pool.query('UPDATE users SET password = ?, class = ?, section = ? WHERE email = ?', [hashedPassword, 'Class 10', 'A', 'students@gmail.com']);
        console.log("Student updated successfully!");
    } catch (e) {
        console.error("DB Error:", e);
    }
    process.exit();
}

resetStudent();
