const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

function generateToken(id, role, email) {
  if (!JWT_SECRET) {
    throw new Error('JWT_ACCESS_SECRET or JWT_SECRET must be set');
  }
  return jwt.sign({ id, role, email }, JWT_SECRET, { expiresIn: '1h' });
}

async function testHttpEndpoints() {
  console.log("=== Starting HTTP Endpoints & RBAC Verification ===");

  if (!JWT_SECRET) {
    console.error("Verification script skipped: JWT secret environment variable is not set.");
    await pool.end();
    process.exit(1);
  }

  const app = express();
  app.use(express.json());
  app.use('/api/v1/timetable', require('../modules/timetable/timetable.routes'));

  const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}/api/v1/timetable`;
    let ct = null;
    let ctToken = null;

    try {
      const [ctRows] = await pool.query(
        `SELECT ta.teacher_user_id, ta.section_id, sec.class_id, u.email
         FROM teacher_assignments ta
         JOIN users u ON ta.teacher_user_id = u.id
         JOIN sections sec ON ta.section_id = sec.id
         WHERE ta.is_class_teacher = 1
         LIMIT 1`
      );
      ct = ctRows[0];

      if (!ct) {
        console.error("Verification script error: Missing seed data for Class Teacher");
        server.close();
        setTimeout(() => process.exit(1), 50);
        return;
      }

      const [stRows] = await pool.query(
        `SELECT u.id, u.email
         FROM users u
         WHERE u.role = 'teacher' AND u.id != ?
           AND u.id NOT IN (SELECT teacher_user_id FROM teacher_assignments WHERE section_id = ?)
         LIMIT 1`,
        [ct.teacher_user_id, ct.section_id]
      );
      const st = stRows[0];

      if (!st) {
        console.error("Verification script error: Missing seed data for Subject Teacher");
        server.close();
        setTimeout(() => process.exit(1), 50);
        return;
      }

      const [studRows] = await pool.query(`SELECT user_id FROM students LIMIT 1`);
      const student = studRows[0];

      if (!student) {
        console.error("Verification script error: Missing seed data for Student");
        server.close();
        setTimeout(() => process.exit(1), 50);
        return;
      }

      ctToken = generateToken(ct.teacher_user_id, 'teacher', ct.email);
      const stToken = generateToken(st.id, 'teacher', st.email);
      const studentToken = generateToken(student.user_id, 'student', 'student@test.com');

      // 1. GET /my-class
      console.log("\n1. Testing GET /api/v1/timetable/my-class (Student)...");
      const res1 = await fetch(`${baseUrl}/my-class`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const data1 = await res1.json();
      console.log(`STATUS: ${res1.status}, SUCCESS: ${data1.success}, SLOTS: ${data1.data?.length}`);
      if (res1.status !== 200 || !data1.success) throw new Error(`GET /my-class failed with status ${res1.status}`);

      // 2. GET /assigned-classes
      console.log("\n2. Testing GET /api/v1/timetable/assigned-classes (Teacher)...");
      const res2 = await fetch(`${baseUrl}/assigned-classes`, {
        headers: { Authorization: `Bearer ${ctToken}` },
      });
      const data2 = await res2.json();
      console.log(`STATUS: ${res2.status}, SUCCESS: ${data2.success}, CLASSES: ${data2.data?.length}`);
      if (res2.status !== 200 || !data2.success) throw new Error(`GET /assigned-classes failed with status ${res2.status}`);

      // 3. GET /class/:classId/section/:sectionId
      console.log("\n3. Testing GET /api/v1/timetable/class/:classId/section/:sectionId...");
      const res3 = await fetch(`${baseUrl}/class/${ct.class_id}/section/${ct.section_id}`, {
        headers: { Authorization: `Bearer ${ctToken}` },
      });
      const data3 = await res3.json();
      console.log(`STATUS: ${res3.status}, SUCCESS: ${data3.success}, IS_CLASS_TEACHER: ${data3.is_class_teacher}`);
      if (res3.status !== 200 || !data3.success) throw new Error(`GET /class/... failed with status ${res3.status}`);

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
      if (res4.status !== 200 || !data4.success) throw new Error(`POST /upsert failed with status ${res4.status}`);

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
      if (res5.status !== 403) throw new Error(`Expected 403 for Subject Teacher upsert, got ${res5.status}`);

      console.log("\n==============================================");
      console.log("✅ ALL HTTP API & RBAC ENFORCEMENT TESTS PASSED!");
      console.log("==============================================");
    } catch (err) {
      console.error("HTTP VERIFICATION FAILED:", err);
      process.exitCode = 1;
    } finally {
      if (ct && ctToken) {
        try {
          const [createdSlots] = await pool.query(
            `SELECT id FROM timetables WHERE section_id = ? AND period_no = 7 AND day_of_week = 1 AND (session_id IS NULL OR session_id = (SELECT id FROM academic_sessions WHERE is_current = 1 LIMIT 1))`,
            [ct.section_id]
          );
          if (createdSlots[0]) {
            const res6 = await fetch(`${baseUrl}/period/${createdSlots[0].id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${ctToken}` },
            });
            const data6 = await res6.json();
            console.log(`CLEANUP DELETE STATUS: ${res6.status}, MESSAGE: ${data6.message}`);
          }
        } catch (cleanupErr) {
          console.error("Cleanup error:", cleanupErr);
        }
      }
      server.close();
      setTimeout(() => process.exit(process.exitCode || 0), 50);
    }
  });
}

testHttpEndpoints();
