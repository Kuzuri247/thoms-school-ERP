const crypto = require('crypto');
const pool = require('../../config/db');
const razorpay = require('../../config/razorpay');
const { generateReceiptPDF } = require('./receipt.service');

const createOrder = async (feeRecordId, createdByUserId) => {
  const [[feeRecord]] = await pool.query(
    'SELECT * FROM fee_records WHERE id = ? AND status NOT IN ("PAID","WAIVED")',
    [feeRecordId]
  );
  if (!feeRecord) throw Object.assign(new Error('Fee record not found or already paid'), { status: 404 });

  const dueAmount = parseFloat(feeRecord.total_amount) - parseFloat(feeRecord.paid_amount) - parseFloat(feeRecord.discount_amount);
  if (dueAmount <= 0) throw Object.assign(new Error('No outstanding balance'), { status: 400 });

  const amountPaise = Math.round(dueAmount * 100);
  const receipt = `rcpt_${feeRecordId}_${Date.now()}`;

  const rzpOrder = await razorpay.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt,
    notes: { fee_record_id: String(feeRecordId), student_id: String(feeRecord.student_id) },
  });

  await pool.query(
    `INSERT INTO razorpay_orders
       (razorpay_order_id, fee_record_id, student_id, amount_paise, currency, receipt, status, created_by)
     VALUES (?, ?, ?, ?, 'INR', ?, 'created', ?)`,
    [rzpOrder.id, feeRecordId, feeRecord.student_id, amountPaise, receipt, createdByUserId]
  );

  return {
    orderId: rzpOrder.id,
    amount: amountPaise,
    currency: 'INR',
    keyId: process.env.RAZORPAY_KEY_ID,
    receipt,
  };
};

const verifyPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    throw Object.assign(new Error('Payment signature verification failed'), { status: 400 });
  }

  await pool.query(
    'UPDATE razorpay_orders SET status = "attempted" WHERE razorpay_order_id = ?',
    [razorpay_order_id]
  );

  return { verified: true };
};

const handleWebhook = async (rawBody, signature) => {
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (expectedSig !== signature) {
    throw Object.assign(new Error('Webhook signature invalid'), { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  const eventId = payload.id;
  const eventType = payload.event;

  try {
    await pool.query(
      'INSERT INTO webhook_events (event_id, event_type) VALUES (?, ?)',
      [eventId, eventType]
    );
  } catch (dupErr) {
    if (dupErr.code === 'ER_DUP_ENTRY') return { skipped: true };
    throw dupErr;
  }

  await pool.query(
    'INSERT INTO audit_logs (action, entity_type, new_data) VALUES (?, "webhook", ?)',
    [`webhook_${eventType}`, JSON.stringify(payload)]
  );

  if (eventType === 'payment.captured') {
    await _onPaymentCaptured(payload.payload.payment.entity);
  } else if (eventType === 'payment.failed') {
    await _onPaymentFailed(payload.payload.payment.entity);
  } else if (eventType === 'refund.processed') {
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
      [payment.id, payment.order_id, payment.amount, payment.currency, payment.method, JSON.stringify(payment)]
    );

    await conn.query(
      'UPDATE razorpay_orders SET status = "paid" WHERE razorpay_order_id = ?',
      [payment.order_id]
    );

    const [[order]] = await conn.query(
      'SELECT fee_record_id, amount_paise FROM razorpay_orders WHERE razorpay_order_id = ?',
      [payment.order_id]
    );
    if (!order) { await conn.rollback(); return; }

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
      [payment.amount / 100, payment.amount / 100, payment.amount / 100, order.fee_record_id]
    );

    const receiptNo = `RCP-${Date.now()}`;
    await conn.query(
      'INSERT INTO receipts (receipt_no, razorpay_payment_id, fee_record_id, student_id) SELECT ?, ?, fee_record_id, student_id FROM razorpay_orders WHERE razorpay_order_id = ?',
      [receiptNo, payment.id, payment.order_id]
    );

    await conn.commit();

    setImmediate(() => generateReceiptPDF(receiptNo, payment.id).catch(console.error));

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
  if (!payment) throw Object.assign(new Error('Payment not found or not refundable'), { status: 404 });

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

module.exports = { createOrder, verifyPayment, handleWebhook, initiateRefund };