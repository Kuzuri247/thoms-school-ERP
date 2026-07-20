// backend/modules/transport/transport.routes.js
const router = require('express').Router();
const pool = require('../../config/db');
const { verifyToken } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { ROLES } = require('../../config/constants');
const svc = require('./transport.service');

router.get('/routes', verifyToken, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM transport_routes WHERE is_active = 1 ORDER BY route_no');
  res.json({ success: true, data: rows });
});

router.get('/routes/:routeId/stops', verifyToken, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM transport_stops WHERE route_id = ? ORDER BY stop_order',
    [req.params.routeId]
  );
  res.json({ success: true, data: rows });
});

// Student or admin/reception selects bus service and transport fee is added/updated
router.post(
  '/opt-in',
  verifyToken,
  authorize(ROLES.STUDENT, ROLES.RECEPTIONIST, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  async (req, res) => {
    const { route_id, stop_id, session_id, student_id } = req.body;
    let targetStudentId = student_id;
    let targetSessionId = session_id;

    if (req.user.role === ROLES.STUDENT) {
      const [[student]] = await pool.query(
        'SELECT id, session_id FROM students WHERE user_id = ?',
        [req.user.id]
      );
      if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
      targetStudentId = student.id;
      targetSessionId = student.session_id;
    }

    if (!targetSessionId) {
      const [[currentSession]] = await pool.query(
        'SELECT id FROM academic_sessions WHERE is_current = 1 LIMIT 1'
      );
      targetSessionId = currentSession?.id;
    }

    await svc.optInBus(targetStudentId, route_id, stop_id, targetSessionId);
    res.json({
      success: true,
      message: 'Bus service activated and transport fee added for the current session',
    });
  }
);

router.post(
  '/opt-out',
  verifyToken,
  authorize(ROLES.STUDENT, ROLES.RECEPTIONIST, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  async (req, res) => {
    let targetStudentId = req.body.student_id;

    if (req.user.role === ROLES.STUDENT) {
      const [[student]] = await pool.query(
        'SELECT id FROM students WHERE user_id = ?',
        [req.user.id]
      );
      if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
      targetStudentId = student.id;
    }

    await svc.optOutBus(targetStudentId);
    res.json({ success: true, message: 'Bus service deactivated' });
  }
);

router.get('/my-status', verifyToken, authorize(ROLES.STUDENT), async (req, res) => {
  const [[student]] = await pool.query(
    'SELECT id FROM students WHERE user_id = ?',
    [req.user.id]
  );
  if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

  const status = await svc.getStatus(student.id);
  res.json({ success: true, data: status });
});

router.get('/my-route-students', verifyToken, authorize(ROLES.BUSSTAFF), async (req, res) => {
  const [rows] = await pool.query(
    `SELECT s.first_name, s.last_name, s.admission_no, ts.stop_name,
            cl.name AS class_name, sec.name AS section_name
     FROM student_transport st
     JOIN students s ON st.student_id = s.id
     JOIN transport_stops ts ON st.stop_id = ts.id
     JOIN transport_routes tr ON st.route_id = tr.id
     LEFT JOIN sections sec ON s.section_id = sec.id
     LEFT JOIN classes cl ON sec.class_id = cl.id
     WHERE tr.busstaff_user_id = ? AND st.is_active = 1
     ORDER BY ts.stop_order, s.first_name`,
    [req.user.id]
  );
  res.json({ success: true, data: rows });
});

router.get('/student/:studentId', verifyToken, async (req, res) => {
  const [rows] = await pool.query(`
    SELECT st.*, tr.name as route_name, tr.bus_no, tr.driver_name, ts.stop_name, ts.pickup_time, ts.drop_time
    FROM student_transport st
    JOIN transport_routes tr ON st.route_id = tr.id
    JOIN transport_stops ts ON st.stop_id = ts.id
    WHERE st.student_id = ?
  `, [req.params.studentId]);
  res.json({ success: true, data: rows[0] || null });
});

module.exports = router;