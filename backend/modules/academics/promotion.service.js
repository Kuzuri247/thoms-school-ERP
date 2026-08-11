const pool = require("../../config/db");

/**
 * Service function to execute Annual Student Grade Advancement (Promotion)
 * Promotes active students from Class N to Class N+1 on session rollover / April 1st.
 * Class 12 (or highest class) students are updated to 'graduated'.
 */
const promoteStudentsAnnualCycle = async () => {
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

    let sessionStartYear;
    if (currentSession?.name) {
      const activeStart = parseInt(currentSession.name.split("-")[0], 10);
      sessionStartYear = isNaN(activeStart) ? new Date().getFullYear() : activeStart + 1;
    } else {
      const now = new Date();
      const currentYear = now.getFullYear();
      sessionStartYear = now.getMonth() < 3 ? currentYear : currentYear + 1;
    }
    const newSessionName = `${sessionStartYear}-${sessionStartYear + 1}`;

    let targetSessionId;

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
      const startDate = `${sessionStartYear}-04-01`;
      const endDate = `${sessionStartYear + 1}-03-31`;
      await conn.query("UPDATE academic_sessions SET is_current = 0");
      const [newSessionRes] = await conn.query(
        "INSERT INTO academic_sessions (name, start_date, end_date, is_current) VALUES (?, ?, ?, 1)",
        [newSessionName, startDate, endDate],
      );
      targetSessionId = newSessionRes.insertId;
    }

    // Fetch active students not yet assigned to the target session (lock selected rows)
    const [students] = await conn.query(
      `SELECT s.id AS student_id, s.user_id, s.section_id, s.session_id, s.admission_no,
              sec.class_id, sec.name AS section_name, c.name AS class_name, c.numeric_value
       FROM students s
       JOIN sections sec ON s.section_id = sec.id
       JOIN classes c ON sec.class_id = c.id
       WHERE s.status = 'active' AND (s.session_id IS NULL OR s.session_id != ?)
       FOR UPDATE`,
      [targetSessionId],
    );

    if (students.length === 0) {
      await conn.rollback();
      return {
        success: false,
        message: `Annual Student Grade Advancement for Academic Session ${newSessionName} has already been executed. Promotion can only be run once per academic year cycle.`,
      };
    }

    // 4. Check if any class standard lower than highest numeric class is vacant (has 0 active students)
    const [classCounts] = await conn.query(
      `SELECT c.id, c.name, c.numeric_value, COUNT(s.id) AS student_count
       FROM classes c
       LEFT JOIN sections sec ON sec.class_id = c.id
       LEFT JOIN students s ON s.section_id = sec.id AND s.status = 'active'
       GROUP BY c.id, c.name, c.numeric_value`,
    );

    const vacantClasses = classCounts.filter(
      (cc) => Number(cc.numeric_value) < maxNumericClass && Number(cc.student_count) === 0
    );

    if (vacantClasses.length > 0) {
      const msg = `Promotion blocked: Class (${vacantClasses.map((vc) => vc.name).join(", ")}) is vacant with 0 students. All classes must have enrolled students before annual promotion can be executed.`;
      await conn.rollback();
      return {
        success: false,
        message: msg,
      };
    }

    const skipped = [];
    const promotionsBySection = {}; // secId -> { nextClassName, targetSectionName, studentIds: [], userIds: [] }
    const graduatingStudentIds = [];
    const graduatingUserIds = [];

    for (const stu of students) {
      const currentNumeric = stu.numeric_value;

      if (currentNumeric < maxNumericClass) {
        const nextNumeric = currentNumeric + 1;
        const nextClass = classByNumeric[nextNumeric];

        if (!nextClass) {
          skipped.push({
            student_id: stu.student_id,
            user_id: stu.user_id,
            class_name: stu.class_name,
            numeric_value: stu.numeric_value,
          });
          continue;
        }

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
            sectionMap[`${nextClass.id}_${stu.section_name}`] = targetSectionId;
          } else {
            // Auto-create section A for next class if none exists
            const [createdSec] = await conn.query(
              "INSERT INTO sections (class_id, name) VALUES (?, ?)",
              [nextClass.id, "A"],
            );
            targetSectionId = createdSec.insertId;
            targetSectionName = "A";
            sectionMap[`${nextClass.id}_A`] = targetSectionId;
            sectionMap[`${nextClass.id}_${stu.section_name}`] = targetSectionId;
          }
        }

        if (!promotionsBySection[targetSectionId]) {
          promotionsBySection[targetSectionId] = {
            nextClassName: nextClass.name,
            targetSectionName,
            studentIds: [],
            userIds: [],
          };
        }
        promotionsBySection[targetSectionId].studentIds.push(stu.student_id);
        promotionsBySection[targetSectionId].userIds.push(stu.user_id);
      } else {
        // Highest class (Class 12) -> Graduate student
        graduatingStudentIds.push(stu.student_id);
        graduatingUserIds.push(stu.user_id);
      }
    }

    let promotedCount = 0;
    let graduatedCount = 0;

    // Execute batch promotions per target section
    for (const secId of Object.keys(promotionsBySection)) {
      const group = promotionsBySection[secId];
      if (group.studentIds.length > 0) {
        await conn.query(
          "UPDATE students SET section_id = ?, session_id = ? WHERE id IN (?)",
          [secId, targetSessionId, group.studentIds],
        );
        await conn.query(
          "UPDATE users SET class = ?, section = ? WHERE id IN (?)",
          [group.nextClassName, group.targetSectionName, group.userIds],
        );
        promotedCount += group.studentIds.length;
      }
    }

    // Execute batch graduations
    if (graduatingStudentIds.length > 0) {
      await conn.query(
        "UPDATE students SET status = 'graduated', section_id = NULL, session_id = ? WHERE id IN (?)",
        [targetSessionId, graduatingStudentIds],
      );
      await conn.query(
        "UPDATE users SET status = 'graduated', class = 'Graduated', section = 'Alumni' WHERE id IN (?)",
        [graduatingUserIds],
      );
      graduatedCount += graduatingStudentIds.length;
    }

    await conn.commit();

    return {
      success: true,
      message: `Annual Student Grade Advancement completed successfully! Promoted: ${promotedCount} students, Graduated: ${graduatedCount} students, Skipped: ${skipped.length} students.`,
      data: {
        promotedCount,
        graduatedCount,
        skippedCount: skipped.length,
        skipped,
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
