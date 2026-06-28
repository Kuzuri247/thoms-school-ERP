const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function setup() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        const dbName = process.env.DB_NAME || 'school_erp';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        await connection.query(`USE \`${dbName}\`;`);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('super_admin', 'admin', 'teacher', 'student') DEFAULT 'student',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Check if super admin exists
        const [rows] = await connection.query(`SELECT * FROM users WHERE role = 'super_admin'`);
        if (rows.length === 0) {
            const hashedPassword = await bcrypt.hash('superadmin123', 8);
            await connection.query(`
                INSERT INTO users (email, password, role) VALUES ('superadmin@erp.com', ?, 'super_admin');
            `, [hashedPassword]);
            console.log('Super admin created: superadmin@erp.com / superadmin123');
        } else {
            console.log('Super admin already exists.');
        }

        console.log('Database setup complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

setup();
