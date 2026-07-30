const mysql = require('mysql2/promise');
require('dotenv').config();

const rawHost = process.env.DB_HOST || 'localhost';
// Automatically sanitize DB_HOST in case mysql:// or port is included in env var
const cleanHost = rawHost.replace(/^(mysql:\/\/|https?:\/\/)/, '').split('/')[0].split(':')[0];

const useSSL = process.env.DB_SSL === 'true' || process.env.DB_SSL === 'REQUIRED' || cleanHost.includes('aivencloud.com');

const pool = mysql.createPool({
  host: cleanHost,
  port: parseInt(process.env.DB_PORT || '28388'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'defaultdb',
  ssl: useSSL ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 20000,
  enableKeepAlive: true,
  timezone: '+05:30',
});

module.exports = pool;