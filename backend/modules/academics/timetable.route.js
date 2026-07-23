const express = require('express');
const router = express.Router();
const controller = require('./academics.controller');
const pool = require('../../config/db');
const { verifyToken } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { ROLES } = require('../../config/constants');

router.get('/class/:classId', verifyToken, authorize(ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res, next) => {
  if (req.user.role === ROLES.STUDENT) {
    const [[student]] = await pool.query(
      'SELECT sec.class_id FROM students s JOIN sections sec ON s.section_id = sec.id WHERE s.user_id = ?',
      [req.user.id]
    );
    if (!student || String(student.class_id) !== String(req.params.classId)) {
      return res.status(403).json({ success: false, message: 'Cannot view timetable for other classes' });
    }
  }
  controller.getTimetableByClass(req, res, next);
});

module.exports = router;
