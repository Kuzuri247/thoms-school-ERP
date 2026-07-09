// backend/modules/transport/transport.service.js
const pool = require('../../config/db');

const optInBus = async (studentId, routeId, stopId, sessionId) => {
  const [[stop]] = await pool.query(
    'SELECT id, route_id, monthly_fare FROM transport_stops WHERE id = ?',
    [stopId]
  );
  if (!stop) throw Object.assign(new Error('Invalid stop'), { status: 404 });

  if (Number(stop.route_id) !== Number(routeId)) {
    throw Object.assign(new Error('Selected stop does not belong to selected route'), { status: 400 });
  }

  await pool.query(
    `INSERT INTO student_transport (student_id, route_id, stop_id, session_id, is_active, opted_in_date, opted_out_date)
     VALUES (?, ?, ?, ?, 1, CURDATE(), NULL)
     ON DUPLICATE KEY UPDATE
       route_id = VALUES(route_id),
       stop_id = VALUES(stop_id),
       session_id = VALUES(session_id),
       is_active = 1,
       opted_in_date = CURDATE(),
       opted_out_date = NULL`,
    [studentId, routeId, stopId, sessionId]
  );

  await upsertTransportFee(studentId, sessionId, stop.monthly_fare);
};

const upsertTransportFee = async (studentId, sessionId, amount) => {
  const [[category]] = await pool.query(
    'SELECT id FROM fee_categories WHERE name = "Transport" LIMIT 1'
  );
  if (!category) {
    throw Object.assign(new Error('Transport fee category missing'), { status: 500 });
  }

  const [rows] = await pool.query(
    `SELECT id, paid_amount, discount_amount, total_amount, status
     FROM fee_records
     WHERE student_id = ? AND session_id = ? AND category_id = ?`,
    [studentId, sessionId, category.id]
  );

  if (!rows.length) {
    await pool.query(
      `INSERT INTO fee_records
        (student_id, session_id, category_id, total_amount, paid_amount, discount_amount, due_date, status, notes)
       VALUES (?, ?, ?, ?, 0, 0, LAST_DAY(CURDATE()), 'PENDING', ?)`,
      [studentId, sessionId, category.id, amount, 'Transport fee added on bus enrolment']
    );
    return;
  }

  const existing = rows[0];
  const paid = Number(existing.paid_amount || 0);
  const discount = Number(existing.discount_amount || 0);
  const newStatus =
    paid + discount >= Number(amount)
      ? 'PAID'
      : paid > 0
        ? 'PARTIAL'
        : 'PENDING';

  await pool.query(
    `UPDATE fee_records
     SET total_amount = ?,
         due_date = LAST_DAY(CURDATE()),
         status = ?,
         notes = ?
     WHERE id = ?`,
    [amount, newStatus, 'Transport fee updated from bus enrolment', existing.id]
  );
};

const optOutBus = async (studentId) => {
  await pool.query(
    `UPDATE student_transport
     SET is_active = 0, opted_out_date = CURDATE()
     WHERE student_id = ?`,
    [studentId]
  );
};

const getStatus = async (studentId) => {
  const [[row]] = await pool.query(
    `SELECT st.student_id, st.is_active, st.pickup_type, st.opted_in_date, st.opted_out_date,
            tr.id AS route_id, tr.route_no, tr.name AS route_name,
            ts.id AS stop_id, ts.stop_name, ts.monthly_fare
     FROM student_transport st
     JOIN transport_routes tr ON st.route_id = tr.id
     JOIN transport_stops ts ON st.stop_id = ts.id
     WHERE st.student_id = ?`,
    [studentId]
  );
  return row || null;
};

module.exports = { optInBus, optOutBus, getStatus };