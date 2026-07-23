const router = require('express').Router();
const webhookRouter = require('express').Router();
const { verifyToken } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { paymentOrderLimiter } = require('../../middleware/rateLimiter');
const svc = require('./payments.service');
const { ROLES } = require('../../config/constants');

const canCreateOrder = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CASHIER, ROLES.STUDENT];

// POST /api/payments/create-order - Create Razorpay order
router.post('/create-order',
  verifyToken,
  authorize(...canCreateOrder),
  paymentOrderLimiter,
  async (req, res) => {
    try {
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
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  }
);

// POST /api/payments/verify - Verify Razorpay payment signature
router.post('/verify', verifyToken, async (req, res) => {
  try {
    const result = await svc.verifyPayment(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// POST /api/payments/refund - Initiate payment refund (Super Admin, Admin, Cashier)
router.post('/refund', verifyToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CASHIER), async (req, res) => {
  try {
    const { payment_id, reason } = req.body;
    const result = await svc.initiateRefund(payment_id, reason, req.user.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/payments/history/:feeRecordId - Payment history for a fee record
router.get('/history/:feeRecordId', verifyToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CASHIER, ROLES.STUDENT), async (req, res) => {
  try {
    const pool = require('../../config/db');
    if (req.user.role === ROLES.STUDENT) {
      const [[owns]] = await pool.query(
        'SELECT fr.id FROM fee_records fr JOIN students s ON fr.student_id = s.id WHERE fr.id = ? AND s.user_id = ?',
        [req.params.feeRecordId, req.user.id]
      );
      if (!owns) return res.status(403).json({ success: false, message: 'Cannot view payment history for other students' });
    }

    const [payments] = await pool.query(
      `SELECT rp.*, ro.amount_paise AS order_amount, ro.created_at AS order_created_at
       FROM razorpay_payments rp
       JOIN razorpay_orders ro ON rp.razorpay_order_id = ro.razorpay_order_id
       WHERE ro.fee_record_id = ?
       ORDER BY rp.captured_at DESC`,
      [req.params.feeRecordId]
    );
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/payments/receipt/:receiptNo - Download receipt PDF
router.get('/receipt/:receiptNo', verifyToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CASHIER, ROLES.STUDENT), async (req, res) => {
  try {
    const pool = require('../../config/db');
    if (req.user.role === ROLES.STUDENT) {
      const [[owns]] = await pool.query(
        'SELECT r.id FROM receipts r JOIN students s ON r.student_id = s.id WHERE r.receipt_no = ? AND s.user_id = ?',
        [req.params.receiptNo, req.user.id]
      );
      if (!owns) return res.status(403).json({ success: false, message: 'Cannot access receipts for other students' });
    }

    const [[rec]] = await pool.query('SELECT pdf_path FROM receipts WHERE receipt_no = ?', [req.params.receiptNo]);
    if (!rec?.pdf_path) return res.status(404).json({ success: false, message: 'Receipt not found' });
    res.download(rec.pdf_path);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/payments/records/my-fees - Fetch fee records for active student
router.get('/records/my-fees', verifyToken, authorize(ROLES.STUDENT), async (req, res) => {
  try {
    const records = await svc.getStudentFeeRecords(req.user.id);
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/payments/records/student/:studentId - Fetch fee records for a student
router.get('/records/student/:studentId', verifyToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CASHIER, ROLES.STUDENT), async (req, res) => {
  try {
    const pool = require('../../config/db');
    if (req.user.role === ROLES.STUDENT) {
      const [[owns]] = await pool.query(
        'SELECT id FROM students WHERE (id = ? OR admission_no = ?) AND user_id = ?',
        [req.params.studentId, req.params.studentId, req.user.id]
      );
      if (!owns) return res.status(403).json({ success: false, message: 'Cannot access fee records of other students' });
    }
    const records = await svc.getStudentFeeRecords(req.user.id, req.params.studentId);
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/payments/pending-dues - List pending fee records for Cashier/Admin intake desk
router.get('/pending-dues', verifyToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CASHIER), async (req, res) => {
  try {
    const dues = await svc.getPendingDues();
    res.json({ success: true, data: dues });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/payments/collect-cash - Record manual cash/POS fee payment (Super Admin, Admin, Cashier)
router.post('/collect-cash', verifyToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CASHIER), async (req, res) => {
  try {
    const result = await svc.collectCashPayment(req.body, req.user.id);
    res.status(201).json({ success: true, message: 'Cash fee payment collected successfully', data: result });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/payments/stats/total-collection - Aggregate total fee collection sum - SUPER_ADMIN ONLY!
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