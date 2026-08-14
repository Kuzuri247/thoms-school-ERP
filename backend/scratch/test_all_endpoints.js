const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const jwt = require('jsonwebtoken');
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'thomson_erp_access_secret_key_2026';
if (!ACCESS_SECRET) {
  console.error('Error: Missing required JWT secret in environment.');
  process.exit(1);
}
const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000';

async function req(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  try {
    const res = await fetch(url, { ...options, headers });
    let body = null;
    const text = await res.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
    return { status: res.status, ok: res.ok, data: body };
  } catch (err) {
    return { status: 0, ok: false, error: err.message };
  }
}

async function runAllTests() {
  console.log('================================================================');
  console.log(' STARTING SYSTEM-WIDE ENDPOINT & WORKFLOW TEST SUITE');
  console.log(' Base URL:', BASE_URL);
  console.log('================================================================\n');

  const results = [];
  function record(module, action, method, endpoint, status, pass, notes = '') {
    const symbol = pass ? '✅ PASS' : '❌ FAIL';
    results.push({ module, action, method, endpoint, status, pass, notes });
    console.log(`[${symbol}] [${status}] ${method.padEnd(6)} ${endpoint.padEnd(45)} (${module} - ${action}) ${notes ? '| ' + notes : ''}`);
  }

  // ----------------------------------------------------------------
  // 1. DIRECT JWT TOKEN PROVISIONING WITH SEEDED DB USER IDS
  // ----------------------------------------------------------------
  console.log('\n=== 1. TOKEN PROVISIONING FOR ALL 5 ROLES ===');

  const roleEmails = {
    super_admin: 'superadmin@thomson.edu',
    admin: 'admin@thomson.edu',
    cashier: 'cashier@thomson.edu',
    teacher: 'teacher@thomson.edu',
    student: 'student@thomson.edu',
  };

  const userProfiles = {};
  const tokens = {};
  for (const [role, email] of Object.entries(roleEmails)) {
    const loginRes = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: 'Thomson2026!' }),
    });
    if (loginRes.ok && loginRes.data?.data?.accessToken) {
      tokens[role] = loginRes.data.data.accessToken;
      userProfiles[role] = loginRes.data.data.user;
      record('AUTH', `Login ${role}`, 'POST', '/api/auth/login', loginRes.status, true, `User ID: ${userProfiles[role].id}`);
    } else {
      userProfiles[role] = { id: 1, role, email };
      tokens[role] = jwt.sign(userProfiles[role], ACCESS_SECRET, { expiresIn: '1h' });
      record('AUTH', `Issue Token ${role} (Fallback)`, 'JWT', '/api/auth', 200, false, `Login failed: ${loginRes.data?.message || loginRes.error}`);
    }
  }

  const superHeader = { Authorization: `Bearer ${tokens['super_admin']}` };
  const adminHeader = { Authorization: `Bearer ${tokens['admin']}` };
  const cashierHeader = { Authorization: `Bearer ${tokens['cashier']}` };
  const teacherHeader = { Authorization: `Bearer ${tokens['teacher']}` };
  const studentHeader = { Authorization: `Bearer ${tokens['student']}` };

  // Fetch student self context
  const studentMeRes = await req('/api/auth/me', { headers: studentHeader });
  record('AUTH', 'Get Self Context (/me)', 'GET', '/api/auth/me', studentMeRes.status, studentMeRes.ok, `Name: ${studentMeRes.data?.data?.full_name}`);
  const studentSectionId = studentMeRes.data?.data?.section_id || 1;
  const studentDbId = studentMeRes.data?.data?.student_id || 1;

  // Test root API endpoint
  const rootRes = await req('/');
  record('CORE', 'Root Health Check', 'GET', '/', rootRes.status, rootRes.ok, `DB: ${rootRes.data?.db}`);

  // ----------------------------------------------------------------
  // 2. ADMIN & USER MANAGEMENT MODULE
  // ----------------------------------------------------------------
  console.log('\n=== 2. ADMIN & USER MANAGEMENT MODULE ===');

  const statsRes = await req('/api/admin/stats', { headers: adminHeader });
  record('ADMIN', 'Get ERP Dashboard Stats', 'GET', '/api/admin/stats', statsRes.status, statsRes.ok, `Students: ${statsRes.data?.data?.totalStudents}`);

  const classesRes = await req('/api/admin/classes', { headers: adminHeader });
  record('ADMIN', 'Get Classes List', 'GET', '/api/admin/classes', classesRes.status, classesRes.ok, `Count: ${classesRes.data?.data?.length}`);
  const firstClassId = classesRes.data?.data?.[0]?.id || 1;

  const classStudentsRes = await req(`/api/admin/classes/${firstClassId}/students`, { headers: adminHeader });
  record('ADMIN', 'Get Students in Class', 'GET', `/api/admin/classes/${firstClassId}/students`, classStudentsRes.status, classStudentsRes.ok, `Students: ${classStudentsRes.data?.data?.length}`);

  const usersListRes = await req('/api/admin/users', { headers: adminHeader });
  record('ADMIN', 'List All Directory Users', 'GET', '/api/admin/users', usersListRes.status, usersListRes.ok, `Users: ${usersListRes.data?.data?.length || usersListRes.data?.length}`);

  const classesWithTeachersRes = await req('/api/admin/classes-with-teachers', { headers: adminHeader });
  record('ADMIN', 'Classes with Teachers', 'GET', '/api/admin/classes-with-teachers', classesWithTeachersRes.status, classesWithTeachersRes.ok);

  const gradsRes = await req('/api/admin/graduates', { headers: adminHeader });
  record('ADMIN', 'Get Graduates List', 'GET', '/api/admin/graduates', gradsRes.status, gradsRes.ok);

  const getSettingsRes = await req('/api/admin/settings', { headers: superHeader });
  record('ADMIN', 'Get School Settings', 'GET', '/api/admin/settings', getSettingsRes.status, getSettingsRes.ok);

  const postSettingsRes = await req('/api/admin/settings', {
    method: 'POST',
    headers: superHeader,
    body: JSON.stringify({ settings: { school_name: 'St. Thomas International School', address: 'Varanasi', phone: '9839009324' } }),
  });
  record('ADMIN', 'Update School Settings', 'POST', '/api/admin/settings', postSettingsRes.status, postSettingsRes.ok);

  // User Profile
  const myProfileRes = await req(`/api/users/${userProfiles['student']?.id}/profile`, { headers: studentHeader });
  record('USERS', 'Get User Profile', 'GET', `/api/users/${userProfiles['student']?.id}/profile`, myProfileRes.status, myProfileRes.ok);

  const updateProfileRes = await req(`/api/users/${userProfiles['student']?.id}/profile`, {
    method: 'PUT',
    headers: studentHeader,
    body: JSON.stringify({ phone: '9998887770', address: 'Varanasi Central Campus' }),
  });
  record('USERS', 'Update User Profile', 'PUT', `/api/users/${userProfiles['student']?.id}/profile`, updateProfileRes.status, updateProfileRes.ok);

  // Provision test staff member
  const newStaffEmail = `test.staff.${Date.now()}@thomson.edu`;
  const provisionStaffRes = await req('/api/admin/users', {
    method: 'POST',
    headers: adminHeader,
    body: JSON.stringify({
      email: newStaffEmail,
      full_name: 'Test Executive Staff',
      role: 'cashier',
      phone: '9876543210',
      gender: 'Male',
      department: 'Accounts & Finance',
    }),
  });
  record('ADMIN', 'Provision Staff Member', 'POST', '/api/admin/users', provisionStaffRes.status, provisionStaffRes.ok, `Created User ID: ${provisionStaffRes.data?.user?.id || provisionStaffRes.data?.data?.id}`);
  const testStaffId = provisionStaffRes.data?.user?.id || provisionStaffRes.data?.data?.id;

  if (testStaffId) {
    const deleteStaffRes = await req(`/api/admin/users/${testStaffId}`, { method: 'DELETE', headers: adminHeader });
    record('ADMIN', 'Delete Staff Member', 'DELETE', `/api/admin/users/${testStaffId}`, deleteStaffRes.status, deleteStaffRes.ok);
  }

  // ----------------------------------------------------------------
  // 3. CBSE MONTHLY FEE ENGINE & PAYMENTS MODULE
  // ----------------------------------------------------------------
  console.log('\n=== 3. CBSE MONTHLY FEE ENGINE & PAYMENTS MODULE ===');

  const myFeesRes = await req('/api/payments/monthly-fees/my-fees', { headers: studentHeader });
  record('PAYMENTS', 'Get Student 12-Month Fees (Student)', 'GET', '/api/payments/monthly-fees/my-fees', myFeesRes.status, myFeesRes.ok, `Months: ${myFeesRes.data?.data?.monthlyFees?.length}`);
  const targetStudentDbId = myFeesRes.data?.data?.student?.id || studentDbId;
  const unpaidMonth = myFeesRes.data?.data?.monthlyFees?.find(m => m.status !== 'PAID');

  const studentFeesRes = await req(`/api/payments/monthly-fees/student/${targetStudentDbId}`, { headers: cashierHeader });
  record('PAYMENTS', 'Get Target Student Fees (Cashier)', 'GET', `/api/payments/monthly-fees/student/${targetStudentDbId}`, studentFeesRes.status, studentFeesRes.ok);

  const pendingDuesRes = await req('/api/payments/pending-dues?classId=All&feeCategory=All', { headers: cashierHeader });
  record('PAYMENTS', 'Get Pending Dues Queue', 'GET', '/api/payments/pending-dues', pendingDuesRes.status, pendingDuesRes.ok, `Total Dues: ${pendingDuesRes.data?.totalCount || pendingDuesRes.data?.data?.length}`);

  const totalCollRes = await req('/api/payments/stats/total-collection', { headers: cashierHeader });
  record('PAYMENTS', 'Get Total Realized Collection', 'GET', '/api/payments/stats/total-collection', totalCollRes.status, totalCollRes.ok, `Collection: ₹${totalCollRes.data?.data?.total_collection}`);

  // Test Cash Collection Payment
  const collectCashRes = await req('/api/payments/pay-monthly-fee', {
    method: 'POST',
    headers: cashierHeader,
    body: JSON.stringify({
      studentId: targetStudentDbId,
      monthCode: unpaidMonth?.month_code || 'AUG',
      monthId: unpaidMonth?.id || 1,
      amount: 500,
      paymentMode: 'Cash',
    }),
  });
  record('PAYMENTS', 'Collect Cash Fee Payment', 'POST', '/api/payments/pay-monthly-fee', collectCashRes.status, collectCashRes.ok, `Receipt: ${collectCashRes.data?.data?.receiptNo}`);

  // Admin Override Lockout
  const overrideRes = await req('/api/payments/override-restriction', {
    method: 'POST',
    headers: adminHeader,
    body: JSON.stringify({ studentId: targetStudentDbId, isAccessRestricted: false }),
  });
  record('PAYMENTS', 'Admin Override Restriction', 'POST', '/api/payments/override-restriction', overrideRes.status, overrideRes.ok);

  // ----------------------------------------------------------------
  // 4. ATTENDANCE MANAGEMENT MODULE
  // ----------------------------------------------------------------
  console.log('\n=== 4. ATTENDANCE MANAGEMENT MODULE ===');

  const myAssignmentsRes = await req('/api/staff/my-assignments', { headers: teacherHeader });
  record('STAFF', 'Get Teacher Assignments', 'GET', '/api/staff/my-assignments', myAssignmentsRes.status, myAssignmentsRes.ok, `Assignments: ${myAssignmentsRes.data?.data?.length}`);
  const teacherSectionId = myAssignmentsRes.data?.data?.[0]?.section_id || studentSectionId;
  const todayStr = new Date().toISOString().split('T')[0];

  const sectionAttendanceRes = await req(`/api/attendance/section/${teacherSectionId}/date/${todayStr}`, { headers: teacherHeader });
  record('ATTENDANCE', 'Get Section Date Attendance', 'GET', `/api/attendance/section/${teacherSectionId}/date/${todayStr}`, sectionAttendanceRes.status, sectionAttendanceRes.ok);

  const calendarAttendanceRes = await req(`/api/attendance/calendar/${teacherSectionId}?month=8&year=2026`, { headers: teacherHeader });
  record('ATTENDANCE', 'Get Section Attendance Calendar', 'GET', `/api/attendance/calendar/${teacherSectionId}`, calendarAttendanceRes.status, calendarAttendanceRes.ok);

  const markBatchRes = await req('/api/attendance/mark', {
    method: 'POST',
    headers: teacherHeader,
    body: JSON.stringify({
      section_id: teacherSectionId,
      date: todayStr,
      records: [{ student_id: targetStudentDbId, status: 'PRESENT' }],
    }),
  });
  record('ATTENDANCE', 'Class Teacher Mark Attendance', 'POST', '/api/attendance/mark', markBatchRes.status, markBatchRes.ok);

  const myAttendanceRes = await req('/api/attendance/student/my-summary', { headers: studentHeader });
  record('ATTENDANCE', 'Get Student Monthly Attendance Summary', 'GET', '/api/attendance/student/my-summary', myAttendanceRes.status, myAttendanceRes.ok);

  const adminAttendanceRes = await req(`/api/admin/attendance?date=${todayStr}`, { headers: adminHeader });
  record('ATTENDANCE', 'Admin Attendance Overview', 'GET', `/api/admin/attendance?date=${todayStr}`, adminAttendanceRes.status, adminAttendanceRes.ok);

  // ----------------------------------------------------------------
  // 5. HOMEWORK & ASSIGNMENTS MODULE
  // ----------------------------------------------------------------
  console.log('\n=== 5. HOMEWORK & ASSIGNMENTS MODULE ===');

  const futureDate = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
  const createHomeworkRes = await req('/api/homework', {
    method: 'POST',
    headers: teacherHeader,
    body: JSON.stringify({
      section_id: teacherSectionId,
      subject_id: 15,
      title: 'CBSE Mathematics Board Revision - Chapter 4',
      description: 'Solve quadratic equations exercise 4.2 questions 1 to 10.',
      due_date: futureDate,
    }),
  });
  record('HOMEWORK', 'Create Homework Assignment', 'POST', '/api/homework', createHomeworkRes.status, createHomeworkRes.ok, `Msg: ${createHomeworkRes.data?.message}`);
  const createdHwId = createHomeworkRes.data?.homeworkId || createHomeworkRes.data?.id;

  const teacherHwListRes = await req('/api/homework/teacher', { headers: teacherHeader });
  record('HOMEWORK', 'Get Homework Assigned by Teacher', 'GET', '/api/homework/teacher', teacherHwListRes.status, teacherHwListRes.ok, `Count: ${teacherHwListRes.data?.data?.length}`);

  const sectionHwRes = await req(`/api/homework/section/${teacherSectionId}`, { headers: teacherHeader });
  record('HOMEWORK', 'Get Section Homework (Teacher)', 'GET', `/api/homework/section/${teacherSectionId}`, sectionHwRes.status, sectionHwRes.ok, `Items: ${sectionHwRes.data?.data?.length}`);

  const studentMyWorkRes = await req('/api/homework/student/my-work', { headers: studentHeader });
  record('HOMEWORK', 'Get Student Assigned Work', 'GET', '/api/homework/student/my-work', studentMyWorkRes.status, studentMyWorkRes.ok, `My Work: ${studentMyWorkRes.data?.data?.length}`);

  if (createdHwId) {
    const updateHwStatusRes = await req('/api/homework/status', {
      method: 'PUT',
      headers: studentHeader,
      body: JSON.stringify({ homework_id: createdHwId, status: 'completed', remarks: 'Solved all 10 problems.' }),
    });
    record('HOMEWORK', 'Student Mark Homework Status', 'PUT', '/api/homework/status', updateHwStatusRes.status, updateHwStatusRes.ok);

    const delHwRes = await req(`/api/homework/${createdHwId}`, { method: 'DELETE', headers: teacherHeader });
    record('HOMEWORK', 'Delete Homework Assignment', 'DELETE', `/api/homework/${createdHwId}`, delHwRes.status, delHwRes.ok);
  }

  // ----------------------------------------------------------------
  // 6. E-LEARNING & DIGITAL RESOURCES MODULE
  // ----------------------------------------------------------------
  console.log('\n=== 6. E-LEARNING & DIGITAL RESOURCES MODULE ===');

  const uploadElearningRes = await req('/api/elearning', {
    method: 'POST',
    headers: teacherHeader,
    body: JSON.stringify({
      section_id: teacherSectionId,
      title: 'NCERT Science Revision - Acids, Bases & Salts',
      description: 'Comprehensive study video for CBSE Board revision.',
      youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    }),
  });
  record('ELEARNING', 'Upload Study Video Material', 'POST', '/api/elearning', uploadElearningRes.status, uploadElearningRes.ok, `ID: ${uploadElearningRes.data?.id}`);
  const createdMaterialId = uploadElearningRes.data?.id;

  const teacherElearningRes = await req('/api/elearning/teacher', { headers: teacherHeader });
  record('ELEARNING', 'Get Teacher Posted Materials', 'GET', '/api/elearning/teacher', teacherElearningRes.status, teacherElearningRes.ok);

  if (createdMaterialId) {
    const delElearningRes = await req(`/api/elearning/${createdMaterialId}`, { method: 'DELETE', headers: teacherHeader });
    record('ELEARNING', 'Delete Study Material', 'DELETE', `/api/elearning/${createdMaterialId}`, delElearningRes.status, delElearningRes.ok);
  }

  // ----------------------------------------------------------------
  // 7. TIMETABLE & SCHEDULE MODULE
  // ----------------------------------------------------------------
  console.log('\n=== 7. TIMETABLE & SCHEDULE MODULE ===');

  const studentTtRes = await req('/api/timetable/my-class', { headers: studentHeader });
  record('TIMETABLE', 'Get Student Class Timetable', 'GET', '/api/timetable/my-class', studentTtRes.status, studentTtRes.ok);

  const teacherTtRes = await req('/api/timetable/my-schedule', { headers: teacherHeader });
  record('TIMETABLE', 'Get Teacher Work Schedule', 'GET', '/api/timetable/my-schedule', teacherTtRes.status, teacherTtRes.ok);

  const assignedClassesRes = await req('/api/timetable/assigned-classes', { headers: teacherHeader });
  record('TIMETABLE', 'Get Assigned Classes', 'GET', '/api/timetable/assigned-classes', assignedClassesRes.status, assignedClassesRes.ok);

  const timetableSubjectsRes = await req('/api/timetable/subjects', { headers: studentHeader });
  record('TIMETABLE', 'Get Timetable Subjects', 'GET', '/api/timetable/subjects', timetableSubjectsRes.status, timetableSubjectsRes.ok);

  const timetableTeachersRes = await req('/api/timetable/teachers', { headers: teacherHeader });
  record('TIMETABLE', 'Get Timetable Teachers List', 'GET', '/api/timetable/teachers', timetableTeachersRes.status, timetableTeachersRes.ok);

  const upsertTtRes = await req('/api/timetable/upsert', {
    method: 'POST',
    headers: adminHeader,
    body: JSON.stringify({
      section_id: teacherSectionId,
      day_of_week: 'Monday',
      periods: [
        { period_number: 1, subject_id: 15, teacher_user_id: userProfiles['teacher']?.id, start_time: '08:00:00', end_time: '08:45:00' },
      ],
    }),
  });
  record('TIMETABLE', 'Upsert Timetable Period', 'POST', '/api/timetable/upsert', upsertTtRes.status, upsertTtRes.ok);

  // ----------------------------------------------------------------
  // 8. FLEET TRANSPORT MODULE
  // ----------------------------------------------------------------
  console.log('\n=== 8. FLEET TRANSPORT MODULE ===');

  const routesRes = await req('/api/transport/routes', { headers: studentHeader });
  record('TRANSPORT', 'Get Fleet Routes List', 'GET', '/api/transport/routes', routesRes.status, routesRes.ok, `Routes: ${routesRes.data?.data?.length}`);
  const firstRouteId = routesRes.data?.data?.[0]?.id || 1;

  const stopsRes = await req(`/api/transport/routes/${firstRouteId}/stops`, { headers: studentHeader });
  record('TRANSPORT', 'Get Route Bus Stops', 'GET', `/api/transport/routes/${firstRouteId}/stops`, stopsRes.status, stopsRes.ok);
  const firstStopId = stopsRes.data?.data?.[0]?.id || 1;

  const studentTransportStatusRes = await req('/api/transport/my-status', { headers: studentHeader });
  record('TRANSPORT', 'Get Student Transport Opt-In Status', 'GET', '/api/transport/my-status', studentTransportStatusRes.status, studentTransportStatusRes.ok);

  const routeStudentsRes = await req('/api/transport/my-route-students', { headers: adminHeader });
  record('TRANSPORT', 'Get Transport Students List', 'GET', '/api/transport/my-route-students', routeStudentsRes.status, routeStudentsRes.ok);

  const optInRes = await req('/api/transport/opt-in', {
    method: 'POST',
    headers: studentHeader,
    body: JSON.stringify({ route_id: firstRouteId, stop_id: firstStopId }),
  });
  record('TRANSPORT', 'Student Transport Opt-In', 'POST', '/api/transport/opt-in', optInRes.status, optInRes.ok);

  // ----------------------------------------------------------------
  // 9. FINANCIAL AUDITS & GLOBAL REPORTS MODULE
  // ----------------------------------------------------------------
  console.log('\n=== 9. FINANCIAL AUDITS & GLOBAL REPORTS MODULE ===');

  const reportOverviewRes = await req('/api/reports/overview', { headers: adminHeader });
  record('REPORTS', 'Get Admin Reports Overview', 'GET', '/api/reports/overview', reportOverviewRes.status, reportOverviewRes.ok);

  const finReportRes = await req('/api/reports/financial?dateRange=This%20Academic%20Year', { headers: cashierHeader });
  record('REPORTS', 'Get Executive Financial Audit Report', 'GET', '/api/reports/financial', finReportRes.status, finReportRes.ok, `Revenue: ₹${finReportRes.data?.data?.financialSummary?.totalRevenue}`);

  const globalStudentsRes = await req('/api/global-reports/all-students', { headers: superHeader });
  record('GLOBAL_REPORTS', 'Super Admin All Students List', 'GET', '/api/global-reports/all-students', globalStudentsRes.status, globalStudentsRes.ok, `Total: ${globalStudentsRes.data?.data?.length}`);

  const globalTeachersRes = await req('/api/global-reports/all-teachers', { headers: superHeader });
  record('GLOBAL_REPORTS', 'Super Admin All Teachers List', 'GET', '/api/global-reports/all-teachers', globalTeachersRes.status, globalTeachersRes.ok, `Total: ${globalTeachersRes.data?.data?.length}`);

  const globalFeesCollRes = await req('/api/global-reports/all-fees-collected', { headers: superHeader });
  record('GLOBAL_REPORTS', 'Super Admin All Fees Collected Audit', 'GET', '/api/global-reports/all-fees-collected', globalFeesCollRes.status, globalFeesCollRes.ok);

  const globalFeesPendRes = await req('/api/global-reports/all-fees-pending', { headers: superHeader });
  record('GLOBAL_REPORTS', 'Super Admin All Fees Pending Audit', 'GET', '/api/global-reports/all-fees-pending', globalFeesPendRes.status, globalFeesPendRes.ok);

  // ----------------------------------------------------------------
  // 10. NOTICES & COMMUNICATION MODULE
  // ----------------------------------------------------------------
  console.log('\n=== 10. NOTICES & COMMUNICATION MODULE ===');

  const getNoticesRes = await req('/api/notices', { headers: studentHeader });
  record('NOTICES', 'Get Active School Notices', 'GET', '/api/notices', getNoticesRes.status, getNoticesRes.ok, `Notices: ${getNoticesRes.data?.data?.length}`);

  const createNoticeRes = await req('/api/notices', {
    method: 'POST',
    headers: adminHeader,
    body: JSON.stringify({
      title: 'Annual CBSE Sports Meet 2026',
      content: 'Registration open for track & field events.',
      notice_type: 'general',
      type: 'global',
    }),
  });
  const noticeCreatedPass = createNoticeRes.status === 201 && (createNoticeRes.data?.id !== undefined || createNoticeRes.data?.data?.id !== undefined);
  record('NOTICES', 'Create Global Notice', 'POST', '/api/notices', createNoticeRes.status, noticeCreatedPass, `Notice ID: ${createNoticeRes.data?.id || createNoticeRes.data?.data?.id}`);
  const createdNoticeId = createNoticeRes.data?.id || createNoticeRes.data?.data?.id;

  if (createdNoticeId) {
    const delNoticeRes = await req(`/api/notices/${createdNoticeId}`, { method: 'DELETE', headers: adminHeader });
    record('NOTICES', 'Delete Notice', 'DELETE', `/api/notices/${createdNoticeId}`, delNoticeRes.status, delNoticeRes.ok);
  }

  const commLogsRes = await req('/api/communication/logs', { headers: adminHeader });
  record('COMMUNICATION', 'Get Communication Broadcast Logs', 'GET', '/api/communication/logs', commLogsRes.status, commLogsRes.ok);

  const sendCommRes = await req('/api/communication/send', {
    method: 'POST',
    headers: adminHeader,
    body: JSON.stringify({ recipient_group: 'All Parents', message_body: 'Important ERP System Update: Scheduled maintenance this Sunday.' }),
  });
  record('COMMUNICATION', 'Send Announcement Broadcast', 'POST', '/api/communication/send', sendCommRes.status, sendCommRes.ok, `Log ID: ${sendCommRes.data?.id}`);

  // ----------------------------------------------------------------
  // 11. STUDENT REMARKS MODULE
  // ----------------------------------------------------------------
  console.log('\n=== 11. STUDENT REMARKS MODULE ===');

  const postBatchRemarksRes = await req('/api/remarks/batch', {
    method: 'POST',
    headers: teacherHeader,
    body: JSON.stringify({
      section_id: teacherSectionId,
      month: 8,
      year: 2026,
      remarks: [
        { student_id: targetStudentDbId, remark: 'Exemplary academic progress in mathematics board prep.' },
      ],
    }),
  });
  record('REMARKS', 'Post Batch Student Remarks', 'POST', '/api/remarks/batch', postBatchRemarksRes.status, postBatchRemarksRes.ok);

  const studentRemarksRes = await req(`/api/remarks/student/${targetStudentDbId}`, { headers: studentHeader });
  record('REMARKS', 'Get Student Performance Remarks', 'GET', `/api/remarks/student/${targetStudentDbId}`, studentRemarksRes.status, studentRemarksRes.ok);

  // ----------------------------------------------------------------
  // 12. EXAMINATION & MARKS MODULE (FUTURE MODULE - BACKEND READY)
  // ----------------------------------------------------------------
  console.log('\n=== 12. EXAMINATION & MARKS MODULE (BACKEND READY) ===');

  const examWeightageRes = await req('/api/marks/weightage', {
    method: 'POST',
    headers: adminHeader,
    body: JSON.stringify({
      session_id: 1,
      class_id: firstClassId,
      half_year: 'H1',
      internal_1_weight: 20,
      internal_2_weight: 20,
      semester_weight: 60,
    }),
  });
  record('MARKS', 'Configure Exam Term Weightages', 'POST', '/api/marks/weightage', examWeightageRes.status, examWeightageRes.ok);

  const bulkMarksRes = await req('/api/marks/exam/1/subject/15/bulk', {
    method: 'POST',
    headers: teacherHeader,
    body: JSON.stringify({
      entries: [
        { student_id: targetStudentDbId, marks_obtained: 95, max_marks: 100 },
      ],
    }),
  });
  record('MARKS', 'Enter Subject Marks Bulk', 'POST', '/api/marks/exam/1/subject/15/bulk', bulkMarksRes.status, bulkMarksRes.ok);

  const myMarksRes = await req('/api/marks/student/my-marks', { headers: studentHeader });
  record('MARKS', 'Get Student My Marks History', 'GET', '/api/marks/student/my-marks', myMarksRes.status, myMarksRes.ok, `Marks Rows: ${myMarksRes.data?.data?.length}`);

  const studentMarksRes = await req(`/api/marks/student/${targetStudentDbId}`, { headers: studentHeader });
  record('MARKS', 'Get Student Marks by ID', 'GET', `/api/marks/student/${targetStudentDbId}`, studentMarksRes.status, studentMarksRes.ok);

  // ----------------------------------------------------------------
  // SUMMARY RESULTS REPORT
  // ----------------------------------------------------------------
  console.log('\n================================================================');
  console.log(' TEST SUITE COMPLETED - SUMMARY REPORT');
  console.log('================================================================');
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`Total Endpoints Tested: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('Success Rate:', Math.round((passed / results.length) * 100) + '%');
  console.log('================================================================\n');

  if (failed > 0) {
    console.error(`❌ TEST SUITE FAILED WITH ${failed} FAILURE(S).`);
    process.exit(1);
  }
}

runAllTests().catch(console.error);
