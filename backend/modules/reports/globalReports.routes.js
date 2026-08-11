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

// GET /api/reports/financial - Dynamic financial audit metrics (Super Admin, Admin & Cashier)
router.get('/financial', verifyToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CASHIER), async (req, res) => {
  try {
    const [[revRow]] = await pool.query(
      `SELECT 
         COALESCE(SUM(amount_paid), 0) AS total_revenue,
         COALESCE(SUM(CASE WHEN status = 'PAID' THEN tuition_fee ELSE 0 END), 0) AS tuition_inflow,
         COALESCE(SUM(CASE WHEN status = 'PAID' THEN bus_fee ELSE 0 END), 0) AS bus_inflow
       FROM student_monthly_fees`
    );

    const [[dueRow]] = await pool.query(
      `SELECT 
         COALESCE(SUM(total_due - amount_paid), 0) AS pending_dues
       FROM student_monthly_fees
       WHERE status IN ('PENDING', 'OVERDUE', 'PARTIAL')`
    );

    const [[defRow]] = await pool.query(
      `SELECT COUNT(*) AS defaulters_count FROM students WHERE is_access_restricted = 1`
    );

    const [classRows] = await pool.query(
      `SELECT c.name AS class_name,
              COUNT(DISTINCT s.id) AS total_students,
              COUNT(DISTINCT CASE WHEN s.is_access_restricted = 1 THEN s.id END) AS defaulters,
              COALESCE(SUM(smf.total_due - smf.amount_paid), 0) AS pending_amount
       FROM classes c
       JOIN sections sec ON sec.class_id = c.id
       JOIN students s ON s.section_id = sec.id
       LEFT JOIN student_monthly_fees smf ON smf.student_id = s.id AND smf.status IN ('PENDING', 'OVERDUE', 'PARTIAL')
       GROUP BY c.id, c.name
       ORDER BY c.numeric_value`
    );

    res.json({
      success: true,
      data: {
        financialSummary: {
          totalRevenue: parseFloat(revRow?.total_revenue || 0),
          tuitionFeeInflow: parseFloat(revRow?.tuition_inflow || 0),
          transportFeeInflow: parseFloat(revRow?.bus_inflow || 0),
          pendingDues: parseFloat(dueRow?.pending_dues || 0),
          defaultersCount: parseInt(defRow?.defaulters_count || 0, 10),
        },
        classDuesAudit: classRows.map(r => ({
          className: r.class_name,
          totalStudents: parseInt(r.total_students || 0, 10),
          defaulters: parseInt(r.defaulters || 0, 10),
          pendingAmount: parseFloat(r.pending_amount || 0),
        })),
      }
    });
  } catch (err) {
    console.error('Error fetching financial report:', err);
    res.status(500).json({ success: false, message: 'Failed to generate financial report' });
  }
});

module.exports = router;