const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsers() {
const pool = require('./config/db');

    try {
        const [rows] = await pool.query('SELECT id, email, role, class, section FROM users');
        console.log("Users:", rows);
    } catch (e) {
        console.error("DB Error:", e);
    }
    process.exit();
}

checkUsers();
