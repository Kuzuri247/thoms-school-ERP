// backend/modules/reports/globalReports.routes.js
const router = require('express').Router();
const pool = require('../../config/db');
const { verifyToken } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { ROLES } = require('../../config/constants');

// Super Admin only — full visibility across students, teachers, fees

router.get('/all-students', verifyToken, authorize(ROLES.SUPER_ADMIN), async (req, res) => {
  const [rows] = await pool.query(
    `SELECT s.*, u.email, cl.name AS class_name, sec.name AS section_name
     FROM students s
     JOIN users u ON s.user_id = u.id
     LEFT JOIN sections sec ON s.section_id = sec.id
     LEFT JOIN classes cl ON sec.class_id = cl.id
     ORDER BY cl.numeric_value, sec.name, s.first_name`
  );
  res.json({ success: true, data: rows });
});

router.get('/all-teachers', verifyToken, authorize(ROLES.SUPER_ADMIN), async (req, res) => {
  const [rows] = await pool.query(
    `SELECT sp.employee_code, sp.first_name, sp.last_name, u.id AS user_id, u.email, u.status,
            ta.section_id, ta.is_class_teacher, sec.name AS section_name, cl.name AS class_name, sub.name AS subject_name
     FROM staff_profiles sp
     JOIN users u ON sp.user_id = u.id
     LEFT JOIN teacher_assignments ta ON ta.teacher_user_id = u.id
     LEFT JOIN sections sec ON ta.section_id = sec.id
     LEFT JOIN classes cl ON sec.class_id = cl.id
     LEFT JOIN subjects sub ON ta.subject_id = sub.id
     WHERE u.role = 'teacher'
     ORDER BY sp.first_name`
  );
  res.json({ success: true, data: rows });
});

router.get('/all-fees-collected', verifyToken, authorize(ROLES.SUPER_ADMIN), async (req, res) => {
  const [rows] = await pool.query(
    `SELECT rp.razorpay_payment_id, rp.amount_paise, rp.method, rp.captured_at,
            s.first_name, s.last_name, s.admission_no, fc.name AS category_name
     FROM razorpay_payments rp
     JOIN razorpay_orders ro ON rp.razorpay_order_id = ro.razorpay_order_id
     JOIN fee_records fr ON ro.fee_record_id = fr.id
     JOIN students s ON fr.student_id = s.id
     JOIN fee_categories fc ON fr.category_id = fc.id
     WHERE rp.status = 'captured'
     ORDER BY rp.captured_at DESC`
  );
  res.json({ success: true, data: rows });
});

router.get('/all-fees-pending', verifyToken, authorize(ROLES.SUPER_ADMIN), async (req, res) => {
  const [rows] = await pool.query(
    `SELECT fr.*, s.first_name, s.last_name, s.admission_no, fc.name AS category_name
     FROM fee_records fr
     JOIN students s ON fr.student_id = s.id
     JOIN fee_categories fc ON fr.category_id = fc.id
     WHERE fr.status IN ('PENDING','PARTIAL','OVERDUE')
     ORDER BY fr.due_date`
  );
  res.json({ success: true, data: rows });
});

module.exports = router;