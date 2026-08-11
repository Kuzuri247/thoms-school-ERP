const db = require('../config/db');
const { recalculateStudentFeeLockout } = require('../utils/feeEngine');

/**
 * Access Restriction Middleware for Student Fee Lockout
 * Checks if student user account has `is_access_restricted = TRUE` (>= 2 overdue months).
 */
module.exports = async function checkFeeBlockade(req, res, next) {
  try {
    if (req.user && req.user.role === 'student') {
      const [[st]] = await db.query(`SELECT id FROM students WHERE user_id = ?`, [req.user.id]);
      let isRestricted = false;
      let pendingCount = 0;

      if (st) {
        const lockout = await recalculateStudentFeeLockout(db, st.id);
        isRestricted = lockout.is_access_restricted;
        pendingCount = lockout.pending_months_count;
      } else {
        const [rows] = await db.query(
          `SELECT is_access_restricted, pending_months_count FROM students WHERE user_id = ?`,
          [req.user.id]
        );
        if (rows.length) {
          isRestricted = Boolean(rows[0].is_access_restricted);
          pendingCount = rows[0].pending_months_count;
        }
      }

      if (isRestricted) {
        return res.status(403).json({
          error: 'ACCESS_RESTRICTED',
          message: 'Your access to the student portal has been restricted due to 2 or more months of overdue fee payments. Please clear your dues or contact the admin.',
          pendingMonths: pendingCount
        });
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};
