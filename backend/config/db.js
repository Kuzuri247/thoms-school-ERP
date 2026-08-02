const mysql = require("mysql2/promise");
require("dotenv").config();

const useSSL =
  process.env.DB_SSL === "true" ||
  process.env.DB_SSL === "REQUIRED" ||
  process.env.DB_HOST?.includes("aivencloud.com");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: useSSL ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+05:30",
});

module.exports = pool;
