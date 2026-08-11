require('dotenv').config({ path: 'backend/.env' });
const pool = require('../config/db');

async function check() {
  try {
    const [recCols] = await pool.query('DESCRIBE receipts');
    console.log('receipts columns:', recCols.map(c => c.Field));
    const [rzCols] = await pool.query('DESCRIBE razorpay_payments');
    console.log('razorpay_payments columns:', rzCols.map(c => c.Field));
  } catch (err) {
    console.error('Check error:', err.message);
  }
  process.exit(0);
}
check();
