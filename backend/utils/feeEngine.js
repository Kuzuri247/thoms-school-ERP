const pool = require('../config/db');

const CBSE_MONTHS = [
  { code: 'APR', name: 'April', order: 1, yearOffset: 0, monthNum: 4, isQuarterlyBus: true },
  { code: 'MAY', name: 'May', order: 2, yearOffset: 0, monthNum: 5, isQuarterlyBus: false },
  { code: 'JUN', name: 'June', order: 3, yearOffset: 0, monthNum: 6, isQuarterlyBus: false },
  { code: 'JUL', name: 'July', order: 4, yearOffset: 0, monthNum: 7, isQuarterlyBus: true },
  { code: 'AUG', name: 'August', order: 5, yearOffset: 0, monthNum: 8, isQuarterlyBus: false },
  { code: 'SEP', name: 'September', order: 6, yearOffset: 0, monthNum: 9, isQuarterlyBus: false },
  { code: 'OCT', name: 'October', order: 7, yearOffset: 0, monthNum: 10, isQuarterlyBus: true },
  { code: 'NOV', name: 'November', order: 8, yearOffset: 0, monthNum: 11, isQuarterlyBus: false },
  { code: 'DEC', name: 'December', order: 9, yearOffset: 0, monthNum: 12, isQuarterlyBus: false },
  { code: 'JAN', name: 'January', order: 10, yearOffset: 1, monthNum: 1, isQuarterlyBus: true },
  { code: 'FEB', name: 'February', order: 11, yearOffset: 1, monthNum: 2, isQuarterlyBus: false },
  { code: 'MAR', name: 'March', order: 12, yearOffset: 1, monthNum: 3, isQuarterlyBus: false },
];

const BUS_DISTANCE_SLABS = [
  { slab: '0-2 KM', quarterlyFee: 3825 },
  { slab: '2-4 KM', quarterlyFee: 3975 },
  { slab: '4-6 KM', quarterlyFee: 4125 },
  { slab: '6-8 KM', quarterlyFee: 4275 },
  { slab: '8-10 KM', quarterlyFee: 4425 },
  { slab: '10-12 KM', quarterlyFee: 4575 },
  { slab: '12-14 KM', quarterlyFee: 4725 },
  { slab: '14-16 KM', quarterlyFee: 4875 },
  { slab: '16-18 KM', quarterlyFee: 5025 },
  { slab: '18-20 KM', quarterlyFee: 5175 },
];

function getBusFeeForSlab(slab) {
  const found = BUS_DISTANCE_SLABS.find((s) => s.slab === slab);
  return found ? found.quarterlyFee : 0;
}

/**
 * Generate 12 CBSE monthly fee records for a student for an academic year.
 * @param {Object} dbClient - mysql2 connection or pool
 * @param {number} studentId - Student database ID
 * @param {Object} options - Configuration options
 */
async function generateMonthlyFeesForStudent(dbClient, studentId, options = {}) {
  const client = dbClient || pool;
  const academicYear = options.academicYear || '2026-2027';
  const tuitionFee = parseFloat(options.tuitionFee ?? 3500.00);
  const optsBusService = Boolean(options.optsBusService);
  const busDistanceSlab = options.busDistanceSlab || null;
  const busQuarterlyFee = optsBusService
    ? parseFloat(options.busQuarterlyFee || getBusFeeForSlab(busDistanceSlab) || 3825.00)
    : 0.00;

  const startYear = parseInt(academicYear.split('-')[0]) || 2026;

  for (const m of CBSE_MONTHS) {
    const year = startYear + m.yearOffset;
    const monthStr = String(m.monthNum).padStart(2, '0');
    const dueDate = `${year}-${monthStr}-10`; // Due on 10th of each month

    const busFee = m.isQuarterlyBus && optsBusService ? busQuarterlyFee : 0.00;
    const totalDue = tuitionFee + busFee;

    await client.query(
      `INSERT INTO student_monthly_fees (
        student_id, academic_year, month_code, month_order,
        tuition_fee, bus_fee, total_due, due_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
      ON DUPLICATE KEY UPDATE
        tuition_fee = IF(status != 'PAID', VALUES(tuition_fee), tuition_fee),
        bus_fee = IF(status != 'PAID', VALUES(bus_fee), bus_fee),
        total_due = IF(status != 'PAID', VALUES(total_due), total_due),
        due_date = IF(status != 'PAID', VALUES(due_date), due_date)`,
      [studentId, academicYear, m.code, m.order, tuitionFee, busFee, totalDue, dueDate]
    );
  }

  // Also update student transport fields if provided
  if (options.optsBusService !== undefined || options.busDistanceSlab !== undefined) {
    await client.query(
      `UPDATE students
       SET opts_bus_service = ?,
           bus_distance_slab = ?,
           bus_quarterly_fee = ?
       WHERE id = ?`,
      [optsBusService, busDistanceSlab, busQuarterlyFee, studentId]
    );
  }

  // Evaluate initial lockout state
  await recalculateStudentFeeLockout(client, studentId);
}

/**
 * Evaluate pending/overdue months for a student up to current date.
 * If >= 2 months pending/overdue, automatically restrict access.
 * @param {Object} dbClient - mysql2 connection or pool
 * @param {number} studentId - Student database ID
 */
async function recalculateStudentFeeLockout(dbClient, studentId) {
  const client = dbClient || pool;

  // 1. Mark any PENDING monthly fee whose due_date < CURRENT_DATE() as OVERDUE
  await client.query(
    `UPDATE student_monthly_fees
     SET status = 'OVERDUE'
     WHERE student_id = ?
       AND status = 'PENDING'
       AND due_date < CURRENT_DATE()`,
    [studentId]
  );

  // 2. Count overdue/pending months up to current date
  const [[result]] = await client.query(
    `SELECT COUNT(*) AS pending_count
     FROM student_monthly_fees
     WHERE student_id = ?
       AND status IN ('PENDING', 'OVERDUE', 'PARTIAL')
       AND due_date <= CURRENT_DATE()`,
    [studentId]
  );

  const pendingMonthsCount = result?.pending_count || 0;
  const isAccessRestricted = pendingMonthsCount >= 2;

  // 3. Update student table record
  await client.query(
    `UPDATE students
     SET is_access_restricted = ?,
         pending_months_count = ?
     WHERE id = ?`,
    [isAccessRestricted, pendingMonthsCount, studentId]
  );

  return {
    is_access_restricted: isAccessRestricted,
    pending_months_count: pendingMonthsCount,
  };
}

module.exports = {
  CBSE_MONTHS,
  BUS_DISTANCE_SLABS,
  getBusFeeForSlab,
  generateMonthlyFeesForStudent,
  recalculateStudentFeeLockout,
};
