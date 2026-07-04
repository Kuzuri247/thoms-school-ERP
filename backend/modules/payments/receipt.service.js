const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const pool = require('../../config/db');

const generateReceiptPDF = async (receiptNo, razorpayPaymentId) => {
  const [[receipt]] = await pool.query(
    `SELECT r.*, s.first_name, s.last_name, s.admission_no,
            fc.name AS category_name, fr.total_amount, fr.paid_amount,
            rp.amount_paise, rp.method, rp.captured_at,
            cl.name AS class_name, sec.name AS section_name,
            st.setting_value AS school_name
     FROM receipts r
     JOIN razorpay_payments rp ON r.razorpay_payment_id = rp.razorpay_payment_id
     JOIN fee_records fr ON r.fee_record_id = fr.id
     JOIN fee_categories fc ON fr.category_id = fc.id
     JOIN students s ON r.student_id = s.id
     LEFT JOIN sections sec ON s.section_id = sec.id
     LEFT JOIN classes cl ON sec.class_id = cl.id
     LEFT JOIN settings st ON st.setting_key = 'school_name'
     WHERE r.receipt_no = ?`,
    [receiptNo]
  );

  if (!receipt) return;

  const uploadDir = path.join(__dirname, '../../uploads/receipts');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, `${receiptNo}.pdf`);
  const doc = new PDFDocument({ margin: 50, size: 'A5' });
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(18).font('Helvetica-Bold').text(receipt.school_name || 'Thomson School', { align: 'center' });
  doc.fontSize(12).font('Helvetica').text('FEE RECEIPT', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Receipt No: ${receiptNo}`, 50, doc.y);
  doc.text(`Date: ${new Date(receipt.captured_at).toLocaleDateString('en-IN')}`, { align: 'right' });
  doc.moveDown();

  doc.font('Helvetica-Bold').text('Student Details:');
  doc.font('Helvetica').text(`Name: ${receipt.first_name} ${receipt.last_name}`);
  doc.text(`Admission No: ${receipt.admission_no}`);
  doc.text(`Class: ${receipt.class_name || '-'} - ${receipt.section_name || '-'}`);
  doc.moveDown();

  doc.font('Helvetica-Bold').text('Payment Details:');
  doc.font('Helvetica').text(`Fee Category: ${receipt.category_name}`);
  doc.text(`Amount Paid: Rs.${(receipt.amount_paise / 100).toFixed(2)}`);
  doc.text(`Payment Method: ${receipt.method || 'Online'}`);
  doc.text(`Transaction ID: ${razorpayPaymentId}`);
  doc.text(`Status: PAID`);

  doc.end();

  await pool.query('UPDATE receipts SET pdf_path = ? WHERE receipt_no = ?', [filePath, receiptNo]);
};

module.exports = { generateReceiptPDF };
