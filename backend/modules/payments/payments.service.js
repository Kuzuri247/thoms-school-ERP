const crypto = require("crypto");
const pool = require("../../config/db");
const razorpay = require("../../config/razorpay");
const { generateReceiptPDF } = require("./receipt.service");
const { generateMonthlyFeesForStudent, recalculateStudentFeeLockout } = require("../../utils/feeEngine");

const createOrder = async (params, createdByUserId) => {
  let feeRecordId = null;
  let monthlyFeeId = null;
  let studentId = null;
  let dueAmount = 0;
  let noteFeeType = "TUITION_FEE";
  let monthCode = null;

  if (typeof params === "object" && (params.month_code || params.monthly_fee_id)) {
    // CBSE Monthly Fee Order Flow
    const targetStudentId = params.student_id;
    monthCode = params.month_code;
    noteFeeType = params.fee_type || "TUITION_FEE";

    let [[mFee]] = await pool.query(
      `SELECT smf.*, s.id AS student_db_id
       FROM student_monthly_fees smf
       JOIN students s ON smf.student_id = s.id
       WHERE (smf.id = ? OR (smf.student_id = ? AND smf.month_code = ?))
         AND smf.status != 'PAID'`,
      [params.monthly_fee_id || 0, targetStudentId || 0, monthCode || '']
    );

    if (!mFee) {
      throw Object.assign(new Error("Monthly fee record not found or already paid"), { status: 404 });
    }

    monthlyFeeId = mFee.id;
    studentId = mFee.student_id;
    monthCode = mFee.month_code;

    const paidAmt = parseFloat(mFee.amount_paid || 0);
    const tuitionFeeVal = parseFloat(mFee.tuition_fee || 0);
    const busFeeVal = parseFloat(mFee.bus_fee || 0);

    const tuitionPaidAlloc = Math.min(paidAmt, tuitionFeeVal);
    const busPaidAlloc = Math.max(0, paidAmt - tuitionFeeVal);

    if (noteFeeType === "BUS_FEE") {
      dueAmount = Math.max(0, busFeeVal - busPaidAlloc);
    } else if (noteFeeType === "TUITION_FEE") {
      dueAmount = Math.max(0, tuitionFeeVal - tuitionPaidAlloc);
    } else {
      dueAmount = Math.max(0, parseFloat(mFee.total_due || 0) - paidAmt);
    }

    if (dueAmount <= 0) {
      throw Object.assign(new Error("No outstanding fee balance for this month"), { status: 400 });
    }
  } else {
    // Legacy Fee Record Order Flow
    feeRecordId = typeof params === "object" ? params.fee_record_id : params;

    const [[feeRecord]] = await pool.query(
      'SELECT * FROM fee_records WHERE id = ? AND status NOT IN ("PAID","WAIVED")',
      [feeRecordId]
    );

    if (!feeRecord) {
      throw Object.assign(new Error("Fee record not found or already paid"), { status: 404 });
    }

    dueAmount =
      parseFloat(feeRecord.total_amount) -
      parseFloat(feeRecord.paid_amount) -
      parseFloat(feeRecord.discount_amount);

    if (dueAmount <= 0) {
      throw Object.assign(new Error("No outstanding balance"), { status: 400 });
    }

    studentId = feeRecord.student_id;
  }

  const amountPaise = Math.round(dueAmount * 100);
  const receipt = `rcpt_${monthlyFeeId ? 'm' + monthlyFeeId : feeRecordId}_${Date.now()}`;

  const rzpOrder = await razorpay.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt,
    notes: {
      fee_record_id: feeRecordId ? String(feeRecordId) : "",
      monthly_fee_id: monthlyFeeId ? String(monthlyFeeId) : "",
      student_id: String(studentId),
      month_code: monthCode || "",
      fee_type: noteFeeType,
    },
  });

  await pool.query(
    `INSERT INTO razorpay_orders
       (razorpay_order_id, fee_record_id, monthly_fee_id, student_id, amount_paise, currency, receipt, status, created_by)
     VALUES (?, ?, ?, ?, ?, 'INR', ?, 'created', ?)`,
    [
      rzpOrder.id,
      feeRecordId,
      monthlyFeeId,
      studentId,
      amountPaise,
      receipt,
      createdByUserId || 1,
    ]
  );

  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) {
    throw Object.assign(new Error("Razorpay Key ID is not configured"), { status: 500 });
  }

  return {
    orderId: rzpOrder.id,
    amount: amountPaise,
    currency: "INR",
    keyId,
    receipt,
  };
};

const verifyPayment = async (
  { razorpay_order_id, razorpay_payment_id, razorpay_signature },
  user = null
) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw Object.assign(new Error("Razorpay Secret is not configured"), { status: 500 });
  }

  if (user && user.role === "student") {
    const [[orderInfo]] = await pool.query(
      `SELECT ro.student_id FROM razorpay_orders ro
       JOIN students s ON ro.student_id = s.id
       WHERE ro.razorpay_order_id = ? AND s.user_id = ?`,
      [razorpay_order_id, user.id]
    );
    if (!orderInfo) {
      throw Object.assign(new Error("Unauthorized: Cannot verify payment for another student"), { status: 403 });
    }
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw Object.assign(new Error("Payment signature verification failed"), { status: 400 });
  }

  await pool.query(
    'UPDATE razorpay_orders SET status = "attempted" WHERE razorpay_order_id = ?',
    [razorpay_order_id]
  );

  return { verified: true };
};

const handleWebhook = async (rawBody, signature) => {
  const expectedSig = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (expectedSig !== signature) {
    throw Object.assign(new Error("Webhook signature invalid"), { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  const eventId = payload.id;
  const eventType = payload.event;

  try {
    await pool.query(
      "INSERT INTO webhook_events (event_id, event_type) VALUES (?, ?)",
      [eventId, eventType]
    );
  } catch (dupErr) {
    if (dupErr.code === "ER_DUP_ENTRY") return { skipped: true };
    throw dupErr;
  }

  await pool.query(
    'INSERT INTO audit_logs (action, entity_type, new_data) VALUES (?, "webhook", ?)',
    [`webhook_${eventType}`, JSON.stringify(payload)]
  );

  if (eventType === "payment.captured") {
    await _onPaymentCaptured(payload.payload.payment.entity);
  } else if (eventType === "payment.failed") {
    await _onPaymentFailed(payload.payload.payment.entity);
  } else if (eventType === "refund.processed") {
    await _onRefundProcessed(payload.payload.refund.entity);
  }

  return { processed: true };
};

const _onPaymentCaptured = async (payment) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO razorpay_payments
         (razorpay_payment_id, razorpay_order_id, amount_paise, currency, method, status, captured_at, raw_payload)
       VALUES (?, ?, ?, ?, ?, 'captured', NOW(), ?)
       ON DUPLICATE KEY UPDATE status = 'captured', captured_at = NOW()`,
      [
        payment.id,
        payment.order_id,
        payment.amount,
        payment.currency,
        payment.method,
        JSON.stringify(payment),
      ]
    );

    await conn.query(
      'UPDATE razorpay_orders SET status = "paid" WHERE razorpay_order_id = ?',
      [payment.order_id]
    );

    const [[order]] = await conn.query(
      "SELECT * FROM razorpay_orders WHERE razorpay_order_id = ?",
      [payment.order_id]
    );

    if (!order) {
      await conn.rollback();
      return;
    }

    const receiptNo = `RCP-${Date.now()}`;
    let receiptType = 'TUITION_FEE';

    if (order.monthly_fee_id) {
      // 1. Update CBSE Monthly Fee Record
      const paidVal = payment.amount / 100;
      await conn.query(
        `UPDATE student_monthly_fees
         SET amount_paid = total_due,
             status = 'PAID',
             paid_at = NOW()
         WHERE id = ?`,
        [order.monthly_fee_id]
      );

      const [[mFee]] = await conn.query(
        `SELECT month_code, bus_fee, tuition_fee FROM student_monthly_fees WHERE id = ?`,
        [order.monthly_fee_id]
      );

      if (mFee && parseFloat(mFee.bus_fee) > 0 && parseFloat(mFee.tuition_fee) > 0) {
        receiptType = 'COMBINED';
      } else if (mFee && parseFloat(mFee.bus_fee) > 0) {
        receiptType = 'BUS_FEE';
      }

      // Recalculate student lockout state
      await recalculateStudentFeeLockout(conn, order.student_id);

      await conn.query(
        `INSERT INTO receipts (
          receipt_no, razorpay_payment_id, monthly_fee_id, student_id, receipt_type, month_code, razorpay_order_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [receiptNo, payment.id, order.monthly_fee_id, order.student_id, receiptType, mFee?.month_code || null, payment.order_id]
      );
    } else if (order.fee_record_id) {
      // 2. Legacy Fee Record Update
      await conn.query(
        `UPDATE fee_records
         SET paid_amount = paid_amount + ?,
             status = CASE
               WHEN (paid_amount + ? + discount_amount) >= total_amount THEN 'PAID'
               WHEN (paid_amount + ?) > 0 THEN 'PARTIAL'
               ELSE status
             END,
             updated_at = NOW()
         WHERE id = ?`,
        [
          payment.amount / 100,
          payment.amount / 100,
          payment.amount / 100,
          order.fee_record_id,
        ]
      );

      await conn.query(
        "INSERT INTO receipts (receipt_no, razorpay_payment_id, fee_record_id, student_id) VALUES (?, ?, ?, ?)",
        [receiptNo, payment.id, order.fee_record_id, order.student_id]
      );
    }

    await conn.commit();

    setImmediate(() =>
      generateReceiptPDF(receiptNo, payment.id).catch(console.error)
    );
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const _onPaymentFailed = async (payment) => {
  await pool.query(
    'UPDATE razorpay_orders SET status = "failed" WHERE razorpay_order_id = ?',
    [payment.order_id]
  );
};

const _onRefundProcessed = async (refund) => {
  await pool.query(
    'UPDATE refunds SET status = "processed", processed_at = NOW() WHERE razorpay_refund_id = ?',
    [refund.id]
  );
  await pool.query(
    'UPDATE razorpay_payments SET status = "refunded" WHERE razorpay_payment_id = ?',
    [refund.payment_id]
  );
};

const initiateRefund = async (paymentId, reason, initiatedBy) => {
  const [[payment]] = await pool.query(
    'SELECT * FROM razorpay_payments WHERE razorpay_payment_id = ? AND status = "captured"',
    [paymentId]
  );
  if (!payment)
    throw Object.assign(new Error("Payment not found or not refundable"), { status: 404 });

  const refund = await razorpay.payments.refund(paymentId, {
    amount: payment.amount_paise,
    notes: { reason },
  });

  await pool.query(
    'INSERT INTO refunds (razorpay_refund_id, razorpay_payment_id, amount_paise, status, reason, initiated_by) VALUES (?, ?, ?, "pending", ?, ?)',
    [refund.id, paymentId, refund.amount, reason, initiatedBy]
  );

  return refund;
};

/**
 * Fetch 12-Month CBSE Fee Records and Lockout status for a student
 */
const getStudentMonthlyFees = async (userId, targetStudentId = null) => {
  let student = null;

  if (targetStudentId) {
    const [[s]] = await pool.query(
      `SELECT s.*, CONCAT(s.first_name, ' ', s.last_name) AS full_name,
              c.name AS class_name, sec.name AS section_name,
              g.full_name AS father_name
       FROM students s
       LEFT JOIN sections sec ON s.section_id = sec.id
       LEFT JOIN classes c ON sec.class_id = c.id
       LEFT JOIN guardians g ON g.student_id = s.id AND g.relation = 'father'
       WHERE s.id = ? OR s.user_id = ? OR s.admission_no = ?
       LIMIT 1`,
      [targetStudentId, targetStudentId, targetStudentId]
    );
    student = s;
  } else {
    const [[s]] = await pool.query(
      `SELECT s.*, CONCAT(s.first_name, ' ', s.last_name) AS full_name,
              c.name AS class_name, sec.name AS section_name,
              g.full_name AS father_name
       FROM students s
       LEFT JOIN sections sec ON s.section_id = sec.id
       LEFT JOIN classes c ON sec.class_id = c.id
       LEFT JOIN guardians g ON g.student_id = s.id AND g.relation = 'father'
       WHERE s.user_id = ?
       LIMIT 1`,
      [userId]
    );
    student = s;
  }

  if (!student) {
    return { student: null, monthlyFees: [], lockoutStatus: { is_access_restricted: false, pending_months_count: 0 } };
  }

  // Ensure 12-month records exist for current academic session
  const [existing] = await pool.query(
    `SELECT * FROM student_monthly_fees WHERE student_id = ? ORDER BY month_order ASC`,
    [student.id]
  );

  if (existing.length === 0) {
    await generateMonthlyFeesForStudent(pool, student.id, {
      optsBusService: student.opts_bus_service,
      busDistanceSlab: student.bus_distance_slab,
      busQuarterlyFee: student.bus_quarterly_fee,
    });
  }

  // Recalculate fee lockout
  const lockoutStatus = await recalculateStudentFeeLockout(pool, student.id);

  const [monthlyFees] = await pool.query(
    `SELECT smf.*, r.receipt_no, r.pdf_path
     FROM student_monthly_fees smf
     LEFT JOIN receipts r ON r.monthly_fee_id = smf.id
     WHERE smf.student_id = ?
     ORDER BY smf.month_order ASC`,
    [student.id]
  );

  return {
    student,
    monthlyFees,
    lockoutStatus,
  };
};

/**
 * Record manual cash fee payment for a CBSE month
 */
const collectCashMonthlyFee = async (
  { studentId, monthCode, monthId, feeType = "COMBINED", amount, paymentMode = "Cash" },
  collectedByUserId
) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let mFee = null;

    if (monthId) {
      const [[found]] = await conn.query(`SELECT * FROM student_monthly_fees WHERE id = ? LIMIT 1`, [monthId]);
      mFee = found;
    }

    if (!mFee) {
      let sObj = null;
      if (typeof studentId === 'number' || (typeof studentId === 'string' && /^\d+$/.test(studentId))) {
        const [[found]] = await conn.query(`SELECT id FROM students WHERE id = ? LIMIT 1`, [studentId]);
        sObj = found;
      }
      if (!sObj) {
        const [[found]] = await conn.query(`SELECT id FROM students WHERE admission_no = ? LIMIT 1`, [studentId]);
        sObj = found;
      }
      if (!sObj) {
        const [[found]] = await conn.query(`SELECT id FROM students WHERE user_id = ? LIMIT 1`, [studentId]);
        sObj = found;
      }

      if (!sObj) {
        throw Object.assign(new Error(`Student '${studentId}' not found`), { status: 404 });
      }

      if (monthCode) {
        const [[found]] = await conn.query(
          `SELECT * FROM student_monthly_fees WHERE student_id = ? AND month_code = ? LIMIT 1`,
          [sObj.id, monthCode]
        );
        mFee = found;
      } else {
        const [[found]] = await conn.query(
          `SELECT * FROM student_monthly_fees 
           WHERE student_id = ? AND status IN ('OVERDUE', 'PENDING', 'PARTIAL') 
           ORDER BY month_order ASC LIMIT 1`,
          [sObj.id]
        );
        mFee = found;
      }
    }

    if (!mFee) {
      throw Object.assign(new Error(`No unpaid monthly fee records found for student '${studentId}'`), { status: 404 });
    }

    const payAmount = parseFloat(amount || mFee.total_due);
    const newPaidAmount = parseFloat(mFee.amount_paid) + payAmount;
    const isPaid = newPaidAmount >= parseFloat(mFee.total_due);

    await conn.query(
      `UPDATE student_monthly_fees
       SET amount_paid = ?,
           status = ?,
           paid_at = NOW()
       WHERE id = ?`,
      [newPaidAmount, isPaid ? 'PAID' : 'PARTIAL', mFee.id]
    );

    await recalculateStudentFeeLockout(conn, mFee.student_id);

    const nonce = crypto.randomBytes(4).toString("hex");
    const orderId = `cash_ord_${Date.now()}_${nonce}`;
    const paymentId = `cash_pay_${Date.now()}_${nonce}`;
    const amountPaise = Math.round(payAmount * 100);

    await conn.query(
      `INSERT INTO razorpay_orders (razorpay_order_id, monthly_fee_id, student_id, amount_paise, currency, receipt, status, created_by)
       VALUES (?, ?, ?, ?, 'INR', ?, 'paid', ?)`,
      [orderId, mFee.id, mFee.student_id, amountPaise, `cash_rcpt_${Date.now()}`, collectedByUserId || 1]
    );

    await conn.query(
      `INSERT INTO razorpay_payments (razorpay_payment_id, razorpay_order_id, amount_paise, currency, method, status, captured_at)
       VALUES (?, ?, ?, 'INR', ?, 'captured', NOW())`,
      [paymentId, orderId, amountPaise, paymentMode]
    );

    const receiptNo = `REC-${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;
    let receiptType = 'TUITION_FEE';
    if (parseFloat(mFee.bus_fee) > 0 && parseFloat(mFee.tuition_fee) > 0) receiptType = 'COMBINED';
    else if (parseFloat(mFee.bus_fee) > 0) receiptType = 'BUS_FEE';

    await conn.query(
      `INSERT INTO receipts (receipt_no, razorpay_payment_id, monthly_fee_id, student_id, receipt_type, month_code, razorpay_order_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [receiptNo, paymentId, mFee.id, mFee.student_id, receiptType, mFee.month_code, orderId]
    );

    await conn.commit();

    setImmediate(() => generateReceiptPDF(receiptNo, paymentId).catch(console.error));

    return {
      receiptNo,
      studentId: mFee.student_id,
      amount: payAmount,
      paymentMode,
      monthCode: mFee.month_code,
      status: isPaid ? 'PAID' : 'PARTIAL',
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * Admin override to restrict or unrestrict student portal access manually
 */
const overrideStudentRestriction = async (studentId, isAccessRestricted, idType = 'id') => {
  const column = (idType === 'user_id' || idType === 'userId') ? 'user_id' : 'id';
  const val = (isAccessRestricted === null || isAccessRestricted === undefined) ? null : (Boolean(isAccessRestricted) ? 1 : 0);
  const [res] = await pool.query(
    `UPDATE students SET is_access_restricted_override = ?, is_access_restricted = COALESCE(?, is_access_restricted) WHERE ${column} = ?`,
    [val, val, studentId]
  );
  if (res.affectedRows !== 1) {
    throw Object.assign(new Error(`Failed to override restriction: expected 1 row to change, but ${res.affectedRows} rows were updated.`), { status: 400 });
  }
  return { success: true, is_access_restricted: val !== null ? Boolean(val) : false };
};

const getPendingDues = async (classId = null, feeCategory = null, limit = 100, offset = 0) => {
  const parsedLimit = Math.max(1, parseInt(limit, 10) || 100);
  const parsedOffset = Math.max(0, parseInt(offset, 10) || 0);

  let baseQuery = `
    FROM student_monthly_fees smf
    JOIN students s ON smf.student_id = s.id
    LEFT JOIN sections sec ON s.section_id = sec.id
    LEFT JOIN classes c ON sec.class_id = c.id
    WHERE (smf.status = 'OVERDUE' OR smf.status = 'PARTIAL' OR (smf.status = 'PENDING' AND smf.due_date <= CURRENT_DATE()))
  `;
  const params = [];

  if (classId && classId !== 'All') {
    baseQuery += ` AND c.id = ?`;
    params.push(classId);
  }

  if (feeCategory && feeCategory !== 'All') {
    if (feeCategory === 'Tuition Fee') {
      baseQuery += ` AND smf.tuition_fee > LEAST(smf.amount_paid, smf.tuition_fee)`;
    } else if (feeCategory === 'Bus Fee') {
      baseQuery += ` AND smf.bus_fee > GREATEST(0, smf.amount_paid - smf.tuition_fee)`;
    }
  }

  const countQuery = `SELECT COUNT(*) AS total_count ${baseQuery}`;
  const [[{ total_count }]] = await pool.query(countQuery, params);

  const selectedCategoryParam = feeCategory || 'All';
  const dataQuery = `
    SELECT smf.*, 
           smf.total_due AS total_amount,
           CASE
             WHEN ? = 'Tuition Fee' THEN GREATEST(0, smf.tuition_fee - LEAST(smf.amount_paid, smf.tuition_fee))
             WHEN ? = 'Bus Fee' THEN GREATEST(0, smf.bus_fee - GREATEST(0, smf.amount_paid - smf.tuition_fee))
             ELSE (smf.total_due - smf.amount_paid)
           END AS pending_amount,
           CASE
             WHEN smf.bus_fee > 0 AND smf.tuition_fee > 0 THEN 'Tuition + Bus Fee'
             WHEN smf.bus_fee > 0 THEN 'Bus Transport Fee'
             ELSE 'Tuition Fee'
           END AS category_name,
           CONCAT(s.first_name, ' ', s.last_name) AS student_name,
           s.admission_no, s.roll_no, s.user_id,
           c.id AS class_id, c.name AS class_name, sec.name AS section_name
    ${baseQuery}
    ORDER BY smf.due_date ASC, s.first_name ASC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.query(dataQuery, [selectedCategoryParam, selectedCategoryParam, ...params, parsedLimit, parsedOffset]);
  return { data: rows, totalCount: total_count, rows };
};

const getStudentFeeRecords = async (userId, targetStudentId = null) => {
  return await getStudentMonthlyFees(userId, targetStudentId);
};

const getTotalCollection = async () => {
  const [[mRow]] = await pool.query(
    `SELECT COALESCE(SUM(amount_paid), 0) AS monthly_paid FROM student_monthly_fees`
  );
  const [[fRow]] = await pool.query(
    `SELECT COALESCE(SUM(paid_amount), 0) AS legacy_paid FROM fee_records WHERE status IN ('PAID', 'PARTIAL')`
  );
  const total = parseFloat(mRow?.monthly_paid || 0) + parseFloat(fRow?.legacy_paid || 0);
  return { total_collection: total };
};

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
  initiateRefund,
  collectCashPayment: collectCashMonthlyFee,
  collectCashMonthlyFee,
  getPendingDues,
  getStudentFeeRecords,
  getStudentMonthlyFees,
  overrideStudentRestriction,
  getTotalCollection,
};
