const db = require('../config/db');

/**
 * Access Restriction Middleware for Student Fee Lockout
 * Checks if student user account has `is_access_restricted = TRUE` (>= 2 overdue months).
 */
module.exports = async function checkFeeBlockade(req, res, next) {
  try {
    if (req.user && req.user.role === 'student') {
      const [rows] = await db.query(
        `SELECT is_access_restricted, pending_months_count FROM students WHERE user_id = ?`,
        [req.user.id]
      );

      if (rows.length && rows[0].is_access_restricted) {
        return res.status(403).json({
          error: 'ACCESS_RESTRICTED',
          message: 'Your access to the student portal has been restricted due to 2 or more months of overdue fee payments. Please clear your dues or contact the admin.',
          pendingMonths: rows[0].pending_months_count
        });
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};
