const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const pool = require('../../config/db');

/**
 * Convert number to words (Indian Currency Format)
 */
function numberToWordsINR(num) {
  const a = [
    '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN',
    'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'
  ];
  const b = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

  function inWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' HUNDRED' + (n % 100 !== 0 ? ' ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' THOUSAND' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' LAKH' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' CRORE' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
  }

  const val = Math.floor(Math.abs(num));
  if (val === 0) return 'ZERO';
  return inWords(val);
}

const generateReceiptPDF = async (receiptNo, razorpayPaymentId) => {
  let receipt = null;

  // 1. First search in receipts joined with razorpay_payments / monthly_fees / students
  const [rows] = await pool.query(
    `SELECT r.*,
            s.first_name, s.last_name, s.admission_no, s.roll_no,
            s.opts_bus_service, s.bus_distance_slab, s.bus_quarterly_fee,
            cl.name AS class_name, sec.name AS section_name,
            g.full_name AS father_name,
            rp.amount_paise, rp.method, rp.captured_at, rp.razorpay_payment_id
     FROM receipts r
     LEFT JOIN razorpay_payments rp ON r.razorpay_payment_id = rp.razorpay_payment_id
     LEFT JOIN students s ON r.student_id = s.id
     LEFT JOIN sections sec ON s.section_id = sec.id
     LEFT JOIN classes cl ON sec.class_id = cl.id
     LEFT JOIN guardians g ON g.student_id = s.id AND g.relation = 'father'
     WHERE r.receipt_no = ?`,
    [receiptNo]
  );

  if (rows.length > 0) {
    receipt = rows[0];
  } else {
    return;
  }

  const uploadDir = path.join(__dirname, '../../uploads/receipts');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, `${receiptNo}.pdf`);
  const doc = new PDFDocument({ margin: 30, size: 'A4' });
  doc.pipe(fs.createWriteStream(filePath));

  const amountRupees = receipt.amount_paise ? receipt.amount_paise / 100 : 0;
  const amountWords = numberToWordsINR(amountRupees);
  const studentFullName = `${receipt.first_name || ''} ${receipt.last_name || ''}`.trim() || 'STUDENT';
  const fatherName = receipt.father_name || 'N/A';
  const rollNo = receipt.roll_no || receipt.admission_no || 'N/A';
  const className = receipt.class_name ? receipt.class_name.replace('Class ', '') : 'N/A';
  const paymentMode = (receipt.method || 'ONLINE').toUpperCase();
  const dateStr = receipt.captured_at
    ? new Date(receipt.captured_at).toISOString().replace('T', ' ').slice(0, 19)
    : new Date().toISOString().replace('T', ' ').slice(0, 19);

  const txnId = receipt.id ? `TXN-${String(receipt.id).padStart(5, '0')}` : `99${Math.floor(100 + Math.random() * 900)}`;
  const gatewayTxnId = receipt.razorpay_payment_id || razorpayPaymentId || 'N/A';
  const bankRefNo = receipt.bank_ref_no || `251${Math.floor(1000000000 + Math.random() * 9000000000)}`;

  let txnType = 'ONLINE TUTION FEE';
  if (receipt.receipt_type === 'BUS_FEE') {
    txnType = 'ONLINE BUS FEE';
  } else if (receipt.receipt_type === 'COMBINED') {
    txnType = 'ONLINE COMBINED FEE (TUTION + BUS)';
  } else if (receipt.transaction_type) {
    txnType = receipt.transaction_type;
  }

  // --- DRAW RECEIPT STYLING (matching official St. Thomas International School template) ---

  // Header Title
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text('ST. THOMAS INTERNATIONAL SCHOOL', { align: 'center' });
  doc.fontSize(14).font('Helvetica-Bold').text('VARANASI', { align: 'center' });
  doc.moveDown(0.5);

  // Subtitle Banner Box
  const startY = doc.y;
  doc.rect(30, startY, 535, 24).fillAndStroke('#000000', '#000000');
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#FFFFFF').text('PAYMENT RECEIPT (PROVISIONAL)', 30, startY + 6, { align: 'center', width: 535 });

  let tableTop = startY + 24;
  doc.fillColor('#000000');

  const rowsData = [
    ['ROLL NUMBER', String(rollNo)],
    ['STUDENT NAME', studentFullName.toUpperCase()],
    ['FATHER NAME', fatherName.toUpperCase()],
    ['CLASS', String(className)],
    ['MODE OF PAYMENT', paymentMode],
    ['TRANSACTION ID', String(txnId)],
    ['GATEWAY TRANSACTION ID', String(gatewayTxnId)],
    ['BANK REFERENCE NO', String(bankRefNo)],
    ['DATE OF TRANSACTION', dateStr],
    ['FEE', `Rs. ${amountRupees.toLocaleString('en-IN')}/-`],
    ['FINE', 'Rs. 0/-'],
    ['TOTAL AMOUNT', `Rs. ${amountRupees.toLocaleString('en-IN')}/-`],
    ['AMOUNT IN WORDS', amountWords],
    ['TRANSACTION TYPE', txnType]
  ];

  if (receipt.receipt_type === 'BUS_FEE' && receipt.bus_distance_slab) {
    rowsData.splice(9, 0, ['BUS DISTANCE SLAB', `${receipt.bus_distance_slab} (Quarterly)`]);
  }

  const rowHeight = 22;
  const col1Width = 200;
  const col2Width = 335;

  rowsData.forEach(([label, val], idx) => {
    const currentY = tableTop + (idx * rowHeight);

    // Row border rectangle
    doc.rect(30, currentY, 535, rowHeight).stroke('#000000');
    // Vertical divider
    doc.lineCap('butt').moveTo(30 + col1Width, currentY).lineTo(30 + col1Width, currentY + rowHeight).stroke('#000000');

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000').text(label, 38, currentY + 6, { width: col1Width - 16 });
    doc.fontSize(9).font(label === 'TOTAL AMOUNT' || label === 'AMOUNT IN WORDS' ? 'Helvetica-Bold' : 'Helvetica').text(val, 30 + col1Width + 8, currentY + 6, { width: col2Width - 16 });
  });

  const tableBottom = tableTop + (rowsData.length * rowHeight);
  doc.y = tableBottom + 15;

  // Print button simulation text box
  doc.rect(245, doc.y, 100, 20).stroke('#000000');
  doc.fontSize(9).font('Helvetica-Bold').text('PRINT', 245, doc.y + 5, { align: 'center', width: 100 });
  doc.moveDown(2);

  // Footer Campus & Contact details
  doc.fontSize(8.5).font('Helvetica-Bold').text('Campus: Munari Road, Damodarpur, Sarnath, Varanasi - 221112', { align: 'center' });
  doc.fontSize(8.5).font('Helvetica').text('Phones: 9839009324, 6386752450, 6386752469', { align: 'center' });
  doc.fontSize(8.5).text('City Office : St. Thomas International School, 4th Floor, Vinayak Tower, Paharia Crossing, Varanasi – 221001, Phone: 8400277770', { align: 'center' });
  doc.fontSize(8.5).text('E-mail: stis.varanasi@gmail.com   |   Website: www.stisvn.com', { align: 'center' });
  doc.moveDown(1.5);

  // Disclaimer notes
  doc.fontSize(8).font('Helvetica-Oblique').text('Please Note :', 30);
  doc.text('•  This is computer generated receipt hence no signature is required.');
  doc.text('•  This receipt is valid subject to realisation of funds in the school\'s bank account.');

  doc.end();

  await pool.query('UPDATE receipts SET pdf_path = ? WHERE receipt_no = ?', [filePath, receiptNo]);
  return filePath;
};

module.exports = { generateReceiptPDF, numberToWordsINR };
