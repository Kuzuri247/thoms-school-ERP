// backend/modules/timetable/timetable.routes.js
const router = require('express').Router();
const pool = require('../../config/db');
const { verifyToken } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { attachTeacherContext } = require('../../middleware/teacherContext');
const { ROLES } = require('../../config/constants');

const DAY_MAP = Object.assign(Object.create(null), {
  monday: 1, mon: 1,
  tuesday: 2, tue: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
  sunday: 7, sun: 7,
});

const DEFAULT_PERIOD_TIMES = {
  1: { start: '08:30:00', end: '09:15:00' },
  2: { start: '09:15:00', end: '10:00:00' },
  3: { start: '10:00:00', end: '10:45:00' },
  4: { start: '11:15:00', end: '12:00:00' },
  5: { start: '12:00:00', end: '12:45:00' },
  6: { start: '12:45:00', end: '13:30:00' },
  7: { start: '13:30:00', end: '14:15:00' },
};

// Helper: resolve day string/number to 1..7 or null for invalid input
function parseDayOfWeek(day) {
  if (day === undefined || day === null) return 1;
  const key = String(day).trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(DAY_MAP, key)) return DAY_MAP[key];
  const num = Number(key);
  if (!isNaN(num) && num >= 1 && num <= 7) return num;
  return null;
}

// --------------------------------------------------------------------------
// 1. GET /api/v1/timetable/my-class & /api/v1/timetable/student/my-timetable
// Access: Student
// --------------------------------------------------------------------------
const getStudentTimetable = async (req, res) => {
  try {
    const [[student]] = await pool.query(
      `SELECT s.section_id, sec.class_id, cl.name AS class_name, sec.name AS section_name
       FROM students s
       JOIN sections sec ON s.section_id = sec.id
       JOIN classes cl ON sec.class_id = cl.id
       WHERE s.user_id = ?`,
      [req.user.id]
    );

    if (!student?.section_id) {
      return res.status(404).json({ success: false, message: 'Student section not assigned' });
    }

    const [rows] = await pool.query(
      `SELECT t.id,
              t.period_no AS period_number,
              t.period_no,
              t.start_time,
              t.end_time,
              t.day_of_week,
              COALESCE(t.is_break, 0) AS is_break,
              t.subject_id,
              sub.name AS subject_name,
              t.teacher_user_id AS teacher_id,
              u.full_name AS teacher_name,
              t.section_id,
              sec.class_id
       FROM timetables t
       LEFT JOIN subjects sub ON t.subject_id = sub.id
       LEFT JOIN users u ON t.teacher_user_id = u.id
       LEFT JOIN sections sec ON t.section_id = sec.id
       WHERE t.section_id = ?
         AND (t.session_id IS NULL OR t.session_id = (SELECT id FROM academic_sessions WHERE is_current = 1 LIMIT 1))
       ORDER BY t.day_of_week, t.period_no`,
      [student.section_id]
    );

    res.json({ success: true, data: rows, studentInfo: student });
  } catch (err) {
    console.error('Timetable API error (/my-class):', err);
    res.status(500).json({ success: false, message: 'Failed to fetch student timetable' });
  }
};

router.get('/my-class', verifyToken, authorize(ROLES.STUDENT), getStudentTimetable);
router.get('/student/my-timetable', verifyToken, authorize(ROLES.STUDENT), getStudentTimetable);

// --------------------------------------------------------------------------
// 2. GET /api/v1/timetable/assigned-classes
// Access: Teacher / Admin / SuperAdmin
// --------------------------------------------------------------------------
router.get('/assigned-classes', verifyToken, authorize(ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN), attachTeacherContext, async (req, res) => {
  try {
    if ([ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(req.user.role)) {
      const [allSections] = await pool.query(
        `SELECT sec.id AS section_id, c.id AS class_id, c.name AS class_name, sec.name AS section_name
         FROM sections sec
         JOIN classes c ON sec.class_id = c.id
         ORDER BY c.numeric_value, sec.name`
      );

      const data = allSections.map(r => ({
        class_id: r.class_id,
        class_name: r.class_name,
        section_id: r.section_id,
        section_name: r.section_name,
        name: `${r.class_name} - ${r.section_name}`,
        is_class_teacher: true,
        role: 'Administrator',
      }));

      return res.json({ success: true, data, teacherContext: req.teacherContext });
    }

    const [rows] = await pool.query(
      `SELECT ta.section_id, sec.class_id, c.name AS class_name, sec.name AS section_name,
              ta.is_class_teacher, ta.subject_id, sub.name AS subject_name
       FROM teacher_assignments ta
       JOIN sections sec ON ta.section_id = sec.id
       JOIN classes c ON sec.class_id = c.id
       LEFT JOIN subjects sub ON ta.subject_id = sub.id
       WHERE ta.teacher_user_id = ?
         AND (ta.session_id IS NULL OR ta.session_id = (SELECT id FROM academic_sessions WHERE is_current = 1 LIMIT 1))
       ORDER BY c.numeric_value, sec.name`,
      [req.user.id]
    );

    const formatTeacherRole = (isClassTeacher, subjectName = '') => {
      if (isClassTeacher) return 'Class Teacher (Homeroom)';
      return subjectName ? `Subject Teacher (${subjectName})` : 'Subject Teacher';
    };

    const sectionMap = new Map();

    for (const r of rows) {
      const existing = sectionMap.get(r.section_id);
      const subjName = r.subject_name || '';
      const subjObj = r.subject_id ? { id: r.subject_id, name: subjName } : null;

      if (!existing) {
        sectionMap.set(r.section_id, {
          class_id: r.class_id,
          class_name: r.class_name,
          section_id: r.section_id,
          section_name: r.section_name,
          name: `${r.class_name} - ${r.section_name}`,
          is_class_teacher: Boolean(r.is_class_teacher),
          role: formatTeacherRole(Boolean(r.is_class_teacher), subjName),
          subjects: subjObj ? [subjObj] : [],
        });
      } else {
        if (r.is_class_teacher) {
          existing.is_class_teacher = true;
          existing.role = formatTeacherRole(true, subjName);
        }
        if (subjObj && !existing.subjects.some(s => s.id === subjObj.id)) {
          existing.subjects.push(subjObj);
        }
      }
    }

    const classes = Array.from(sectionMap.values());
    res.json({ success: true, data: classes, teacherContext: req.teacherContext });
  } catch (err) {
    console.error('Timetable API error (/assigned-classes):', err);
    res.status(500).json({ success: false, message: 'Failed to fetch assigned classes' });
  }
});

// --------------------------------------------------------------------------
// 3. GET /api/v1/timetable/class/:classId/section/:sectionId
// Access: Class Teacher, Subject Teacher, Admin, Super Admin
// --------------------------------------------------------------------------
router.get('/class/:classId/section/:sectionId', verifyToken, authorize(ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN), attachTeacherContext, async (req, res) => {
  try {
    const { classId, sectionId } = req.params;

    const [[secCheck]] = await pool.query('SELECT class_id FROM sections WHERE id = ?', [sectionId]);
    if (!secCheck || String(secCheck.class_id) !== String(classId)) {
      return res.status(404).json({ success: false, message: 'Section not found for specified class' });
    }

    let isClassTeacher = false;

    if ([ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(req.user.role)) {
      isClassTeacher = true;
    } else {
      const [assignments] = await pool.query(
        `SELECT is_class_teacher FROM teacher_assignments
         WHERE teacher_user_id = ? AND section_id = ?
           AND (session_id IS NULL OR session_id = (SELECT id FROM academic_sessions WHERE is_current = 1 LIMIT 1))`,
        [req.user.id, sectionId]
      );

      if (!assignments.length) {
        return res.status(403).json({ success: false, message: 'Access denied: Not assigned to this class section' });
      }

      isClassTeacher = assignments.some(a => Number(a.is_class_teacher) === 1);
    }

    const [rows] = await pool.query(
      `SELECT t.id,
              t.period_no AS period_number,
              t.period_no,
              t.start_time,
              t.end_time,
              t.day_of_week,
              COALESCE(t.is_break, 0) AS is_break,
              t.subject_id,
              sub.name AS subject_name,
              t.teacher_user_id AS teacher_id,
              u.full_name AS teacher_name,
              t.section_id,
              sec.class_id
       FROM timetables t
       LEFT JOIN subjects sub ON t.subject_id = sub.id
       LEFT JOIN users u ON t.teacher_user_id = u.id
       LEFT JOIN sections sec ON t.section_id = sec.id
       WHERE t.section_id = ?
         AND (t.session_id IS NULL OR t.session_id = (SELECT id FROM academic_sessions WHERE is_current = 1 LIMIT 1))
       ORDER BY t.day_of_week, t.period_no`,
      [sectionId]
    );

    res.json({
      success: true,
      data: rows,
      is_class_teacher: isClassTeacher,
    });
  } catch (err) {
    console.error('Timetable API error (/class/:classId/section/:sectionId):', err);
    res.status(500).json({ success: false, message: 'Failed to fetch section timetable' });
  }
});

// Alias for section fetch
router.get('/section/:sectionId', verifyToken, authorize(ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const { sectionId } = req.params;
    if (req.user.role === ROLES.STUDENT) {
      const [[student]] = await pool.query('SELECT section_id FROM students WHERE user_id = ?', [req.user.id]);
      if (!student || String(student.section_id) !== String(sectionId)) {
        return res.status(403).json({ success: false, message: 'Cannot view timetable for other sections' });
      }
    } else if (req.user.role === ROLES.TEACHER) {
      const [assignments] = await pool.query(
        `SELECT 1 FROM teacher_assignments
         WHERE teacher_user_id = ? AND section_id = ?
           AND (session_id IS NULL OR session_id = (SELECT id FROM academic_sessions WHERE is_current = 1 LIMIT 1))`,
        [req.user.id, sectionId]
      );
      if (!assignments.length) {
        return res.status(403).json({ success: false, message: 'Access denied: Not assigned to this class section' });
      }
    }

    const [rows] = await pool.query(
      `SELECT t.id,
              t.period_no AS period_number,
              t.period_no,
              t.start_time,
              t.end_time,
              t.day_of_week,
              COALESCE(t.is_break, 0) AS is_break,
              t.subject_id,
              sub.name AS subject_name,
              t.teacher_user_id AS teacher_id,
              u.full_name AS teacher_name,
              t.section_id,
              sec.class_id
       FROM timetables t
       LEFT JOIN subjects sub ON t.subject_id = sub.id
       LEFT JOIN users u ON t.teacher_user_id = u.id
       LEFT JOIN sections sec ON t.section_id = sec.id
       WHERE t.section_id = ?
         AND (t.session_id IS NULL OR t.session_id = (SELECT id FROM academic_sessions WHERE is_current = 1 LIMIT 1))
       ORDER BY t.day_of_week, t.period_no`,
      [sectionId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Timetable API error (/section/:sectionId):', err);
    res.status(500).json({ success: false, message: 'Failed to fetch section timetable' });
  }
});

// --------------------------------------------------------------------------
// 4. POST /api/v1/timetable/upsert
// Access: Class Teacher (primary class), Admin, SuperAdmin
// --------------------------------------------------------------------------
router.post('/upsert', verifyToken, authorize(ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN), attachTeacherContext, async (req, res) => {
  const { class_id, section_id, day_of_week, periods } = req.body;

  if (!section_id || !day_of_week || !Array.isArray(periods)) {
    return res.status(400).json({ success: false, message: 'Missing required parameters: section_id, day_of_week, and periods array' });
  }

  const dayNum = parseDayOfWeek(day_of_week);
  if (!dayNum) {
    return res.status(400).json({ success: false, message: 'Invalid day_of_week specified' });
  }

  // RBAC Check: Must be Admin/SuperAdmin OR Class Teacher for this section
  let isAdmin = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(req.user.role);
  if (!isAdmin) {
    const [[isCt]] = await pool.query(
      `SELECT 1 FROM teacher_assignments
       WHERE teacher_user_id = ? AND section_id = ? AND is_class_teacher = 1
         AND (session_id IS NULL OR session_id = (SELECT id FROM academic_sessions WHERE is_current = 1 LIMIT 1))`,
      [req.user.id, section_id]
    );
    if (!isCt) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only Class Teacher of this class or Admin can modify timetable entries',
      });
    }
  }

  const [[sessionRow]] = await pool.query('SELECT id FROM academic_sessions WHERE is_current = 1 LIMIT 1');
  if (!sessionRow?.id) {
    return res.status(409).json({ success: false, message: 'No active academic session found' });
  }
  const sessionId = sessionRow.id;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const p of periods) {
      const periodNo = Number(p.period_number || p.period_no);
      if (isNaN(periodNo) || periodNo < 1 || periodNo > 7) {
        throw Object.assign(new Error(`Invalid period number: ${p.period_number || p.period_no}`), { status: 400 });
      }

      const isBreak = p.is_break ? 1 : 0;
      const startTime = p.start_time || DEFAULT_PERIOD_TIMES[periodNo]?.start || '08:30:00';
      const endTime = p.end_time || DEFAULT_PERIOD_TIMES[periodNo]?.end || '09:15:00';
      const subjectId = isBreak ? null : (p.subject_id || null);
      const teacherId = isBreak ? null : (p.teacher_id || p.teacher_user_id || null);

      if (!isBreak && teacherId) {
        const [[clash]] = await connection.query(
          `SELECT id FROM timetables
           WHERE teacher_user_id = ? AND day_of_week = ? AND period_no = ?
             AND (session_id = ? OR session_id IS NULL) AND section_id != ?`,
          [teacherId, dayNum, periodNo, sessionId, section_id]
        );

        if (clash) {
          throw Object.assign(
            new Error(`Teacher conflict: Teacher is already scheduled for another class during Period ${periodNo} on Day ${dayNum}`),
            { status: 409 }
          );
        }
      }

      const [[existing]] = await connection.query(
        `SELECT id FROM timetables
         WHERE section_id = ? AND day_of_week = ? AND period_no = ?
           AND (session_id = ? OR session_id IS NULL)`,
        [section_id, dayNum, periodNo, sessionId]
      );

      if (existing) {
        await connection.query(
          `UPDATE timetables
           SET subject_id = ?, teacher_user_id = ?, start_time = ?, end_time = ?, is_break = ?, session_id = ?
           WHERE id = ?`,
          [subjectId, teacherId, startTime, endTime, isBreak, sessionId, existing.id]
        );
      } else {
        await connection.query(
          `INSERT INTO timetables (section_id, subject_id, teacher_user_id, day_of_week, period_no, start_time, end_time, session_id, is_break)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [section_id, subjectId, teacherId, dayNum, periodNo, startTime, endTime, sessionId, isBreak]
        );
      }
    }

    await connection.commit();
    res.json({ success: true, message: 'Timetable slots updated successfully' });
  } catch (err) {
    await connection.rollback();
    console.error('Timetable API error (/upsert):', err);
    if (err.status) {
      return res.status(err.status).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Failed to update timetable slots' });
  } finally {
    connection.release();
  }
});

// Single slot creation (Admin compatibility)
router.post('/', verifyToken, authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), async (req, res) => {
  try {
    const { section_id, subject_id, teacher_user_id, day_of_week, period_no, start_time, end_time, session_id, is_break } = req.body;

    if (!section_id || !day_of_week || !period_no) {
      return res.status(400).json({ success: false, message: 'Missing required parameters: section_id, day_of_week, period_no' });
    }

    const periodNo = Number(period_no);
    if (isNaN(periodNo) || periodNo < 1 || periodNo > 7) {
      return res.status(400).json({ success: false, message: 'Invalid period_no: Must be between 1 and 7' });
    }

    const dayNum = parseDayOfWeek(day_of_week);
    if (!dayNum) {
      return res.status(400).json({ success: false, message: 'Invalid day_of_week specified' });
    }

    const [[sessionRow]] = await pool.query('SELECT id FROM academic_sessions WHERE is_current = 1 LIMIT 1');
    const sessId = session_id || sessionRow?.id;
    if (!sessId) {
      return res.status(409).json({ success: false, message: 'No active academic session found' });
    }

    const startTime = start_time || DEFAULT_PERIOD_TIMES[periodNo]?.start || '08:30:00';
    const endTime = end_time || DEFAULT_PERIOD_TIMES[periodNo]?.end || '09:15:00';
    const isBreakVal = is_break ? 1 : 0;
    const subjIdVal = isBreakVal ? null : (subject_id || null);
    const teacherIdVal = isBreakVal ? null : (teacher_user_id || null);

    if (!isBreakVal && teacherIdVal) {
      const [[clash]] = await pool.query(
        `SELECT id FROM timetables
         WHERE teacher_user_id = ? AND day_of_week = ? AND period_no = ?
           AND (session_id = ? OR session_id IS NULL) AND section_id != ?`,
        [teacherIdVal, dayNum, periodNo, sessId, section_id]
      );
      if (clash) return res.status(409).json({ success: false, message: 'Teacher already scheduled at this time' });
    }

    const [[existing]] = await pool.query(
      `SELECT id FROM timetables
       WHERE section_id = ? AND day_of_week = ? AND period_no = ?
         AND (session_id = ? OR session_id IS NULL)`,
      [section_id, dayNum, periodNo, sessId]
    );

    if (existing) {
      await pool.query(
        `UPDATE timetables
         SET subject_id = ?, teacher_user_id = ?, start_time = ?, end_time = ?, is_break = ?, session_id = ?
         WHERE id = ?`,
        [subjIdVal, teacherIdVal, startTime, endTime, isBreakVal, sessId, existing.id]
      );
      return res.json({ success: true, message: 'Timetable slot updated successfully' });
    }

    await pool.query(
      `INSERT INTO timetables (section_id, subject_id, teacher_user_id, day_of_week, period_no, start_time, end_time, session_id, is_break)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [section_id, subjIdVal, teacherIdVal, dayNum, periodNo, startTime, endTime, sessId, isBreakVal]
    );
    res.status(201).json({ success: true, message: 'Timetable slot created' });
  } catch (err) {
    console.error('Timetable API error (POST /):', err);
    res.status(500).json({ success: false, message: 'Failed to create timetable slot' });
  }
});

// --------------------------------------------------------------------------
// 5. DELETE /api/v1/timetable/period/:periodId
// Access: Class Teacher (primary class), Admin, SuperAdmin
// --------------------------------------------------------------------------
const deleteTimetablePeriod = async (req, res) => {
  try {
    const periodId = req.params.periodId || req.params.id;

    const [[slot]] = await pool.query('SELECT * FROM timetables WHERE id = ?', [periodId]);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Timetable period not found' });
    }

    let isAdmin = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(req.user.role);
    if (!isAdmin) {
      const [[isCt]] = await pool.query(
        `SELECT 1 FROM teacher_assignments
         WHERE teacher_user_id = ? AND section_id = ? AND is_class_teacher = 1
           AND (session_id IS NULL OR session_id = (SELECT id FROM academic_sessions WHERE is_current = 1 LIMIT 1))`,
        [req.user.id, slot.section_id]
      );
      if (!isCt) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only Class Teacher of this class or Admin can delete timetable periods',
        });
      }
    }

    await pool.query('DELETE FROM timetables WHERE id = ?', [periodId]);
    res.json({ success: true, message: 'Period removed successfully' });
  } catch (err) {
    console.error('Timetable API error (/period/:periodId):', err);
    res.status(500).json({ success: false, message: 'Failed to delete timetable period' });
  }
};

router.delete('/period/:periodId', verifyToken, authorize(ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN), attachTeacherContext, deleteTimetablePeriod);
router.delete('/:id', verifyToken, authorize(ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN), attachTeacherContext, deleteTimetablePeriod);

// --------------------------------------------------------------------------
// 6. GET /api/v1/timetable/my-schedule
// Access: Teacher
// --------------------------------------------------------------------------
router.get('/my-schedule', verifyToken, authorize(ROLES.TEACHER), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.id,
              t.period_no AS period_number,
              t.period_no,
              t.start_time,
              t.end_time,
              t.day_of_week,
              COALESCE(t.is_break, 0) AS is_break,
              t.subject_id,
              sub.name AS subject_name,
              sec.name AS section_name,
              cl.name AS class_name
       FROM timetables t
       JOIN sections sec ON t.section_id = sec.id
       JOIN classes cl ON sec.class_id = cl.id
       LEFT JOIN subjects sub ON t.subject_id = sub.id
       WHERE t.teacher_user_id = ?
         AND (t.session_id IS NULL OR t.session_id = (SELECT id FROM academic_sessions WHERE is_current = 1 LIMIT 1))
       ORDER BY t.day_of_week, t.period_no`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Timetable API error (/my-schedule):', err);
    res.status(500).json({ success: false, message: 'Failed to fetch teaching schedule' });
  }
});

// --------------------------------------------------------------------------
// 7. GET /api/v1/timetable/subjects & /api/v1/timetable/teachers
// Helpers for dropdowns in timetable editor
// --------------------------------------------------------------------------
router.get('/subjects', verifyToken, authorize(ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.STUDENT), async (req, res) => {
  try {
    const { class_id } = req.query;
    let query = 'SELECT id, name, code, class_id FROM subjects';
    let params = [];
    if (class_id) {
      query += ' WHERE class_id = ? OR class_id IS NULL';
      params.push(class_id);
    }
    query += ' ORDER BY name, id';
    const [rows] = await pool.query(query, params);

    const uniqueMap = new Map();
    for (const sub of rows) {
      const key = sub.name.trim().toLowerCase();
      const existing = uniqueMap.get(key);
      if (!existing) {
        uniqueMap.set(key, sub);
      } else if (class_id && Number(sub.class_id) === Number(class_id)) {
        uniqueMap.set(key, sub);
      }
    }

    res.json({ success: true, data: Array.from(uniqueMap.values()) });
  } catch (err) {
    console.error('Timetable API error (/subjects):', err);
    res.status(500).json({ success: false, message: 'Failed to fetch subjects' });
  }
});

router.get('/teachers', verifyToken, authorize(ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const [teachers] = await pool.query(
      `SELECT u.id, u.full_name, u.email
       FROM users u
       WHERE u.role = 'teacher' AND u.status = 'active'
       ORDER BY u.full_name`
    );

    const [assignments] = await pool.query(
      `SELECT DISTINCT ta.teacher_user_id, ta.subject_id, s.name AS subject_name
       FROM teacher_assignments ta
       JOIN subjects s ON ta.subject_id = s.id
       WHERE ta.subject_id IS NOT NULL
         AND (ta.session_id IS NULL OR ta.session_id = (SELECT id FROM academic_sessions WHERE is_current = 1 LIMIT 1))
       UNION
       SELECT DISTINCT t.teacher_user_id, t.subject_id, s.name AS subject_name
       FROM timetables t
       JOIN subjects s ON t.subject_id = s.id
       WHERE t.subject_id IS NOT NULL
         AND (t.session_id IS NULL OR t.session_id = (SELECT id FROM academic_sessions WHERE is_current = 1 LIMIT 1))`
    );

    const teacherMap = new Map();
    teachers.forEach(t => {
      teacherMap.set(t.id, { ...t, subjects: [], subject_ids: [], subject_names: [] });
    });

    assignments.forEach(a => {
      const t = teacherMap.get(a.teacher_user_id);
      if (t) {
        if (!t.subject_ids.includes(a.subject_id)) {
          t.subject_ids.push(a.subject_id);
          t.subject_names.push(a.subject_name.trim().toLowerCase());
          t.subjects.push({ id: a.subject_id, name: a.subject_name });
        }
      }
    });

    res.json({ success: true, data: Array.from(teacherMap.values()) });
  } catch (err) {
    console.error('Timetable API error (/teachers):', err);
    res.status(500).json({ success: false, message: 'Failed to fetch teachers' });
  }
});

module.exports = router;