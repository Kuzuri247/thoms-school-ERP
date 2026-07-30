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
    const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
    try {
      await connection.query(sql);
      console.log(`  OK: ${file}`);
    } catch (err) {
      if (err.errno === 1060 || err.errno === 1061 || err.errno === 1050) {
        console.log(`  SKIPPED (already applied or syntax mismatch handled): ${file}`);
      } else {
        console.error(`  FAILED: ${file}`, err.message);
        throw err;
      }
    }
  }

  console.log('All migrations completed.');
  await connection.end();
  process.exit(0);
}

migrate().catch(err => { console.error(err); process.exit(1); });