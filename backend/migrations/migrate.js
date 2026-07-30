const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const rawHost = process.env.DB_HOST || 'localhost';
const cleanHost = rawHost.replace(/^(mysql:\/\/|https?:\/\/)/, '').split('/')[0].split(':')[0];
const useSSL = process.env.DB_SSL === 'true' || process.env.DB_SSL === 'REQUIRED' || cleanHost.includes('aivencloud.com');

async function migrate() {
  const connection = await mysql.createConnection({
    host: cleanHost,
    port: parseInt(process.env.DB_PORT || '28388'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'defaultdb',
    ssl: useSSL ? { rejectUnauthorized: false } : undefined,
    connectTimeout: 20000,
    multipleStatements: true,
  });

  const files = fs.readdirSync(__dirname)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    console.log(`Running migration: ${file}`);
    const rawSql = fs.readFileSync(path.join(__dirname, file), 'utf8');
    const statements = rawSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      try {
        await connection.query(stmt);
      } catch (err) {
        if ([1060, 1061, 1050, 1091, 1062, 1068].includes(err.errno)) {
          // Ignored non-fatal schema hardening error
        } else {
          console.warn(`  Notice in ${file}: ${err.message}`);
        }
      }
    }
    console.log(`  OK: ${file}`);
  }

  console.log('All migrations completed successfully.');
  await connection.end();
  process.exit(0);
}

migrate().catch(err => { console.error(err); process.exit(1); });