const router = require('express').Router();
const webhookRouter = require('express').Router();
const { verifyToken } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { paymentOrderLimiter } = require('../../middleware/ratelimiter');
const svc = require('./payments.service');
const { ROLES } = require('../../config/constants');

const canCreateOrder = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CASHIER, ROLES.STUDENT];

// POST /api/payments/create-order - Create Razorpay order (for monthly fee or fee record)
router.post('/create-order',
  verifyToken,
  authorize(...canCreateOrder),
  paymentOrderLimiter,
  async (req, res) => {
    try {
      const { fee_record_id, monthly_fee_id, month_code, student_id } = req.body;

      if (req.user.role === ROLES.STUDENT) {
        const pool = require('../../config/db');
        if (fee_record_id) {
          const [[fr]] = await pool.query(
            'SELECT fr.student_id FROM fee_records fr JOIN students s ON fr.student_id = s.id WHERE fr.id = ? AND s.user_id = ?',
            [fee_record_id, req.user.id]
          );
          if (!fr) return res.status(403).json({ success: false, message: 'Cannot pay other student fees' });
        } else {
          const [[sm]] = await pool.query(
            'SELECT s.id FROM students s WHERE s.user_id = ?',
            [req.user.id]
          );
          if (!sm) return res.status(403).json({ success: false, message: 'Student profile not found' });
          req.body.student_id = sm.id;
        }
      }

      const data = await svc.createOrder(req.body, req.user.id);
      res.json({ success: true, data });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  }
);

// POST /api/payments/verify - Verify Razorpay payment signature
router.post('/verify', verifyToken, authorize(...canCreateOrder), async (req, res) => {
  try {
    const result = await svc.verifyPayment(req.body, req.user);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/payments/monthly-fees/my-fees - Fetch 12-month CBSE breakdown for logged in student
router.get('/monthly-fees/my-fees', verifyToken, authorize(ROLES.STUDENT), async (req, res) => {
  try {
    const result = await svc.getStudentMonthlyFees(req.user.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/payments/monthly-fees/student/:studentId - Fetch 12-month CBSE breakdown for target student
router.get('/monthly-fees/student/:studentId', verifyToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CASHIER, ROLES.STUDENT), async (req, res) => {
  try {
    const pool = require('../../config/db');
    const [[student]] = await pool.query(
      'SELECT id FROM students WHERE id = ? OR admission_no = ? OR user_id = ? LIMIT 1',
      [req.params.studentId, req.params.studentId, req.params.studentId]
    );
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    if (req.user.role === ROLES.STUDENT) {
      const [[owns]] = await pool.query(
        'SELECT id FROM students WHERE id = ? AND user_id = ?',
        [student.id, req.user.id]
      );
      if (!owns) return res.status(403).json({ success: false, message: 'Cannot access fee records of other students' });
    }

    const result = await svc.getStudentMonthlyFees(req.user.id, student.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/payments/override-restriction - Admin override lockout status
router.post('/override-restriction', verifyToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), async (req, res) => {
  try {
    const { studentId, isAccessRestricted } = req.body;
    if (!studentId || typeof isAccessRestricted !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Invalid payload: studentId and boolean isAccessRestricted are required' });
    }

    const result = await svc.overrideStudentRestriction(studentId, isAccessRestricted);
    const pool = require('../../config/db');
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'OVERRIDE_FEE_RESTRICTION', JSON.stringify({ studentId, isAccessRestricted })]
    ).catch(console.error);

    res.json({ success: true, message: `Access restriction updated`, data: result });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// POST /api/payments/pay-monthly-fee - Admin/Cashier collect manual/cash payment for CBSE month
router.post('/pay-monthly-fee', verifyToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CASHIER), async (req, res) => {
  try {
    const amt = Number(req.body.amount);
    if (req.body.amount !== undefined && (!Number.isFinite(amt) || amt <= 0)) {
      return res.status(400).json({ success: false, message: 'Payment amount must be a positive number' });
    }

    const result = await svc.collectCashMonthlyFee(req.body, req.user.id);
    res.status(201).json({ success: true, message: 'Monthly fee payment recorded successfully', data: result });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// POST /api/payments/refund - Initiate payment refund
router.post('/refund', verifyToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CASHIER), async (req, res) => {
  try {
    const { payment_id, reason } = req.body;
    const result = await svc.initiateRefund(payment_id, reason, req.user.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
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
    const { classId, feeCategory } = req.query;
    const dues = await svc.getPendingDues(classId, feeCategory);
    res.json({ success: true, data: dues });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/payments/collect-cash - Record manual cash/POS fee payment
router.post('/collect-cash', verifyToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CASHIER), async (req, res) => {
  try {
    const result = await svc.collectCashPayment(req.body, req.user.id);
    res.status(201).json({ success: true, message: 'Cash fee payment collected successfully', data: result });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/payments/stats/total-collection - Total fee collection aggregate
router.get('/stats/total-collection', verifyToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CASHIER), async (req, res) => {
  try {
    const result = await svc.getTotalCollection();
    res.json({ success: true, data: result });
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