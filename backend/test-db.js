const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsers() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'school_erp'
    });

    try {
        const [rows] = await pool.query('SELECT id, email, role, class, section FROM users');
        console.log("Users:", rows);
    } catch (e) {
        console.error("DB Error:", e);
    }
    process.exit();
}

checkUsers();
