const pool = require("../../config/db");

/**
 * Service function to execute Annual Student Grade Advancement (Promotion)
 * Promotes active students from Class N to Class N+1 on session rollover / April 1st.
 * Class 12 (or highest class) students are updated to 'graduated'.
 */
const promoteStudentsAnnualCycle = async (options = {}) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1. Fetch all classes ordered by numeric_value
    const [classes] = await conn.query(
      "SELECT id, name, numeric_value FROM classes ORDER BY numeric_value ASC",
    );

    if (classes.length === 0) {
      await conn.rollback();
      return { success: false, message: "No classes found in the system." };
    }

    const maxNumericClass = Math.max(...classes.map((c) => c.numeric_value));
    const classByNumeric = {};
    classes.forEach((c) => {
      classByNumeric[c.numeric_value] = c;
    });

    // 2. Fetch all sections
    const [sections] = await conn.query(
      "SELECT id, class_id, name FROM sections",
    );
    const sectionMap = {}; // key: `classId_sectionName`
    sections.forEach((sec) => {
      sectionMap[`${sec.class_id}_${sec.name}`] = sec.id;
    });

    // 3. Resolve active current session or create new academic session for April 1st
    const [[currentSession]] = await conn.query(
      "SELECT id, name, start_date, end_date FROM academic_sessions WHERE is_current = 1 LIMIT 1",
    );

    const now = new Date();
    const currentYear = now.getFullYear();
    const newSessionName = `${currentYear}-${currentYear + 1}`;

    let targetSessionId = currentSession ? currentSession.id : null;

    // Check if new session needs to be activated
    const [existingNewSession] = await conn.query(
      "SELECT id FROM academic_sessions WHERE name = ?",
      [newSessionName],
    );

    if (existingNewSession.length > 0) {
      targetSessionId = existingNewSession[0].id;
      await conn.query("UPDATE academic_sessions SET is_current = 0");
      await conn.query(
        "UPDATE academic_sessions SET is_current = 1 WHERE id = ?",
        [targetSessionId],
      );
    } else {
      const startDate = `${currentYear}-04-01`;
      const endDate = `${currentYear + 1}-03-31`;
      await conn.query("UPDATE academic_sessions SET is_current = 0");
      const [newSessionRes] = await conn.query(
        "INSERT INTO academic_sessions (name, start_date, end_date, is_current) VALUES (?, ?, ?, 1)",
        [newSessionName, startDate, endDate],
      );
      targetSessionId = newSessionRes.insertId;
    }

    // 4. Fetch all active students
    const [students] = await conn.query(
      `SELECT s.id AS student_id, s.user_id, s.section_id, s.session_id, s.admission_no,
              sec.class_id, sec.name AS section_name, c.name AS class_name, c.numeric_value
       FROM students s
       JOIN sections sec ON s.section_id = sec.id
       JOIN classes c ON sec.class_id = c.id
       WHERE s.status = 'active'`,
    );

    let promotedCount = 0;
    let graduatedCount = 0;

    for (const stu of students) {
      const currentNumeric = stu.numeric_value;

      if (currentNumeric < maxNumericClass) {
        const nextNumeric = currentNumeric + 1;
        const nextClass = classByNumeric[nextNumeric];

        if (nextClass) {
          // Find matching section in next class, or fallback to first section of next class
          let targetSectionId = sectionMap[`${nextClass.id}_${stu.section_name}`];
          let targetSectionName = stu.section_name;

          if (!targetSectionId) {
            const [fallbackSecs] = await conn.query(
              "SELECT id, name FROM sections WHERE class_id = ? ORDER BY id ASC LIMIT 1",
              [nextClass.id],
            );
            if (fallbackSecs.length > 0) {
              targetSectionId = fallbackSecs[0].id;
              targetSectionName = fallbackSecs[0].name;
            } else {
              // Auto-create section A for next class if none exists
              const [createdSec] = await conn.query(
                "INSERT INTO sections (class_id, name) VALUES (?, ?)",
                [nextClass.id, "A"],
              );
              targetSectionId = createdSec.insertId;
              targetSectionName = "A";
              sectionMap[`${nextClass.id}_A`] = targetSectionId;
            }
          }

          // Update student section & session
          await conn.query(
            "UPDATE students SET section_id = ?, session_id = ? WHERE id = ?",
            [targetSectionId, targetSessionId, stu.student_id],
          );

          // Update user table class & section
          await conn.query(
            "UPDATE users SET class = ?, section = ? WHERE id = ?",
            [nextClass.name, targetSectionName, stu.user_id],
          );

          promotedCount++;
        }
      } else {
        // Highest class (Class 12) -> Graduate student
        await conn.query(
          "UPDATE students SET status = 'graduated', session_id = ? WHERE id = ?",
          [targetSessionId, stu.student_id],
        );
        await conn.query(
          "UPDATE users SET status = 'Graduated' WHERE id = ?",
          [stu.user_id],
        );
        graduatedCount++;
      }
    }

    await conn.commit();

    return {
      success: true,
      message: `Annual Student Grade Advancement completed successfully! Promoted: ${promotedCount} students, Graduated: ${graduatedCount} students.`,
      data: {
        promotedCount,
        graduatedCount,
        sessionId: targetSessionId,
        sessionName: newSessionName,
      },
    };
  } catch (error) {
    if (conn) await conn.rollback();
    console.error("Error in annual student grade promotion:", error);
    throw error;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = { promoteStudentsAnnualCycle };
