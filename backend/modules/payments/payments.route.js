const router = require('express').Router();
const webhookRouter = require('express').Router();
const { verifyToken } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { paymentOrderLimiter } = require('../../middleware/rateLimiter');
const svc = require('./payments.service');
const { ROLES } = require('../../config/constants');

const canCreateOrder = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CASHIER, ROLES.STUDENT];

router.post('/create-order',
  verifyToken,
  authorize(...canCreateOrder),
  paymentOrderLimiter,
  async (req, res) => {
    const { fee_record_id } = req.body;
    if (req.user.role === ROLES.STUDENT) {
      const pool = require('../../config/db');
      const [[fr]] = await pool.query(
        'SELECT fr.student_id FROM fee_records fr JOIN students s ON fr.student_id = s.id WHERE fr.id = ? AND s.user_id = ?',
        [fee_record_id, req.user.id]
      );
      if (!fr) return res.status(403).json({ success: false, message: 'Cannot pay other student fees' });
    }
    const data = await svc.createOrder(fee_record_id, req.user.id);
    res.json({ success: true, data });
  }
);

router.post('/verify', verifyToken, async (req, res) => {
  const result = await svc.verifyPayment(req.body);
  res.json({ success: true, data: result });
});

router.post('/refund', verifyToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CASHIER), async (req, res) => {
  const { payment_id, reason } = req.body;
  const result = await svc.initiateRefund(payment_id, reason, req.user.id);
  res.json({ success: true, data: result });
});

router.get('/history/:feeRecordId', verifyToken, async (req, res) => {
  const pool = require('../../config/db');
  const [payments] = await pool.query(
    `SELECT rp.*, ro.amount_paise AS order_amount, ro.created_at AS order_created_at
     FROM razorpay_payments rp
     JOIN razorpay_orders ro ON rp.razorpay_order_id = ro.razorpay_order_id
     WHERE ro.fee_record_id = ?
     ORDER BY rp.captured_at DESC`,
    [req.params.feeRecordId]
  );
  res.json({ success: true, data: payments });
});

router.get('/receipt/:receiptNo', verifyToken, async (req, res) => {
  const pool = require('../../config/db');
  const [[rec]] = await pool.query('SELECT pdf_path FROM receipts WHERE receipt_no = ?', [req.params.receiptNo]);
  if (!rec?.pdf_path) return res.status(404).json({ success: false, message: 'Receipt not found' });
  res.download(rec.pdf_path);
});

// Aggregate total fee collection sum - SUPER_ADMIN ONLY!
router.get('/stats/total-collection', verifyToken, authorize(ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const pool = require('../../config/db');
    const [[result]] = await pool.query(
      `SELECT SUM(amount_paise)/100 AS total_collection FROM razorpay_payments WHERE status = 'captured'`
    );
    let total = parseFloat(result?.total_collection || 0);
    if (total === 0) {
      const [[frResult]] = await pool.query(`SELECT SUM(paid_amount) AS total_collection FROM fee_records`);
      total = parseFloat(frResult?.total_collection || 0);
    }
    res.json({ success: true, total_collection: total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

webhookRouter.post('/', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  if (!signature) return res.status(400).json({ success: false, message: 'Missing signature' });
  try {
    const result = await svc.handleWebhook(req.rawBody, signature);
    res.json({ success: true, ...result });
  } catch (err) {
    if (err.status === 400) return res.status(400).json({ success: false, message: err.message });
    res.status(200).json({ success: false, message: 'Processing error' });
  }
});

module.exports = { router, webhookRouter };