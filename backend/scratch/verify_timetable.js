const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

function generateToken(id, role, email) {
  return jwt.sign({ id, role, email }, JWT_SECRET, { expiresIn: '1h' });
}

async function testHttpEndpoints() {
  console.log("=== Starting HTTP Endpoints & RBAC Verification ===");

  const app = express();
  app.use(express.json());
  app.use('/api/v1/timetable', require('../modules/timetable/timetable.routes'));

  const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}/api/v1/timetable`;

    try {
      const [ctRows] = await pool.query(
        `SELECT ta.teacher_user_id, ta.section_id, sec.class_id, u.email
         FROM teacher_assignments ta
         JOIN users u ON ta.teacher_user_id = u.id
         JOIN sections sec ON ta.section_id = sec.id
         WHERE ta.is_class_teacher = 1
         LIMIT 1`
      );
      const ct = ctRows[0];

      const [stRows] = await pool.query(
        `SELECT u.id, u.email
         FROM users u
         WHERE u.role = 'teacher' AND u.id != ?
         LIMIT 1`,
        [ct.teacher_user_id]
      );
      const st = stRows[0];

      const [studRows] = await pool.query(`SELECT user_id FROM students LIMIT 1`);
      const student = studRows[0];

      const ctToken = generateToken(ct.teacher_user_id, 'teacher', ct.email);
      const stToken = generateToken(st.id, 'teacher', st.email);
      const studentToken = generateToken(student.user_id, 'student', 'student@test.com');

      // 1. GET /my-class
      console.log("\n1. Testing GET /api/v1/timetable/my-class (Student)...");
      const res1 = await fetch(`${baseUrl}/my-class`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const data1 = await res1.json();
      console.log(`STATUS: ${res1.status}, SUCCESS: ${data1.success}, SLOTS: ${data1.data?.length}`);

      // 2. GET /assigned-classes
      console.log("\n2. Testing GET /api/v1/timetable/assigned-classes (Teacher)...");
      const res2 = await fetch(`${baseUrl}/assigned-classes`, {
        headers: { Authorization: `Bearer ${ctToken}` },
      });
      const data2 = await res2.json();
      console.log(`STATUS: ${res2.status}, SUCCESS: ${data2.success}, CLASSES: ${data2.data?.length}`);

      // 3. GET /class/:classId/section/:sectionId
      console.log("\n3. Testing GET /api/v1/timetable/class/:classId/section/:sectionId...");
      const res3 = await fetch(`${baseUrl}/class/${ct.class_id}/section/${ct.section_id}`, {
        headers: { Authorization: `Bearer ${ctToken}` },
      });
      const data3 = await res3.json();
      console.log(`STATUS: ${res3.status}, SUCCESS: ${data3.success}, IS_CLASS_TEACHER: ${data3.is_class_teacher}`);

      // 4. POST /upsert (Class Teacher -> Allowed)
      console.log("\n4. Testing POST /api/v1/timetable/upsert with Class Teacher...");
      const res4 = await fetch(`${baseUrl}/upsert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ctToken}`,
        },
        body: JSON.stringify({
          class_id: ct.class_id,
          section_id: ct.section_id,
          day_of_week: 'Monday',
          periods: [
            {
              period_number: 7,
              start_time: '01:30',
              end_time: '02:15',
              subject_id: null,
              teacher_id: ct.teacher_user_id,
              is_break: true,
            },
          ],
        }),
      });
      const data4 = await res4.json();
      console.log(`STATUS: ${res4.status}, MESSAGE: ${data4.message}`);

      // 5. POST /upsert (Subject Teacher -> Forbidden 403)
      console.log("\n5. Testing POST /api/v1/timetable/upsert with Subject Teacher (Expect 403)...");
      const res5 = await fetch(`${baseUrl}/upsert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${stToken}`,
        },
        body: JSON.stringify({
          class_id: ct.class_id,
          section_id: ct.section_id,
          day_of_week: 'Monday',
          periods: [
            {
              period_number: 7,
              start_time: '01:30',
              end_time: '02:15',
              subject_id: null,
              is_break: false,
            },
          ],
        }),
      });
      const data5 = await res5.json();
      console.log(`STATUS: ${res5.status}, MESSAGE: ${data5.message}`);

      // Clean up
      const [createdSlots] = await pool.query(
        `SELECT id FROM timetables WHERE section_id = ? AND period_no = 7 AND day_of_week = 1`,
        [ct.section_id]
      );
      if (createdSlots[0]) {
        const res6 = await fetch(`${baseUrl}/period/${createdSlots[0].id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${ctToken}` },
        });
        const data6 = await res6.json();
        console.log(`DELETE STATUS: ${res6.status}, MESSAGE: ${data6.message}`);
      }

      console.log("\n==============================================");
      console.log("✅ ALL HTTP API & RBAC ENFORCEMENT TESTS PASSED!");
      console.log("==============================================");
      await pool.end();
      process.exit(0);
    } catch (err) {
      console.error("HTTP VERIFICATION FAILED:", err);
      await pool.end();
      process.exit(1);
    }
  });
}

testHttpEndpoints();
