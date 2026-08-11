const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const { verifyToken } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { ROLES } = require('../../config/constants');

router.get('/overview', verifyToken, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
    try {
        const [students] = await pool.query('SELECT COUNT(*) as count FROM students');
        const [teachers] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "teacher"');
        const [revenue] = await pool.query('SELECT SUM(total_amount) as total FROM fee_records WHERE status = "PAID"');
        
        res.json({
            success: true,
            data: {
                totalStudents: students[0].count,
                totalTeachers: teachers[0].count,
                totalRevenue: revenue[0].total || 0,
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/financial', verifyToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CASHIER), async (req, res) => {
    try {
        const allowedRanges = ['This Academic Year', 'Current Month', 'All Time'];
        const dateRange = req.query.dateRange || 'This Academic Year';

        if (!allowedRanges.includes(dateRange)) {
          return res.status(400).json({ success: false, message: 'Unsupported dateRange parameter' });
        }

        let datePredicate = '';
        if (dateRange === 'Current Month') {
          datePredicate = 'WHERE (paid_at IS NOT NULL AND MONTH(paid_at) = MONTH(CURRENT_DATE()) AND YEAR(paid_at) = YEAR(CURRENT_DATE()))';
        } else if (dateRange === 'This Academic Year') {
          datePredicate = "WHERE academic_year = '2026-2027'";
        }

        const [[revRow]] = await pool.query(
          `SELECT 
             COALESCE(SUM(amount_paid), 0) AS total_revenue,
             COALESCE(SUM(CASE WHEN status = 'PAID' THEN tuition_fee ELSE 0 END), 0) AS tuition_inflow,
             COALESCE(SUM(CASE WHEN status = 'PAID' THEN bus_fee ELSE 0 END), 0) AS bus_inflow
           FROM student_monthly_fees
           ${datePredicate}`
        );

        const dueWhere = datePredicate
          ? `${datePredicate} AND status IN ('PENDING', 'OVERDUE', 'PARTIAL')`
          : "WHERE status IN ('PENDING', 'OVERDUE', 'PARTIAL')";

        const [[dueRow]] = await pool.query(
          `SELECT 
             COALESCE(SUM(total_due - amount_paid), 0) AS pending_dues
           FROM student_monthly_fees
           ${dueWhere}`
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

        let modeRows = [];
        try {
          const [mRows] = await pool.query(
            `SELECT COALESCE(payment_mode, 'Cash') AS mode,
                    COALESCE(SUM(amount_paid), 0) AS amount,
                    COUNT(*) AS transactions
             FROM receipts
             GROUP BY payment_mode`
          );
          modeRows = mRows;
        } catch (e) {
          modeRows = [];
        }

        const totalModeAmt = modeRows.reduce((acc, m) => acc + parseFloat(m.amount || 0), 0) || 1;
        const paymentModeShare = modeRows.map(m => ({
          mode: m.mode || 'Cash',
          amount: parseFloat(m.amount || 0),
          transactions: parseInt(m.transactions || 0, 10),
          percentage: `${Math.round((parseFloat(m.amount || 0) / totalModeAmt) * 100)}%`,
        }));

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
            paymentModeShare,
            classDuesAudit: classRows.map(r => ({
              className: r.class_name,
              totalStudents: parseInt(r.total_students || 0, 10),
              defaulters: parseInt(r.defaulters || 0, 10),
              pendingAmount: parseFloat(r.pending_amount || 0),
            })),
          }
        });
    } catch (err) {
        console.error('Error in /api/reports/financial:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
