const pool = require('../config/db');

async function testApi() {
  const [rows] = await pool.query(
    `SELECT sec.id AS section_id, c.id AS class_id, c.name AS class_name, sec.name AS section_name,
            sub.id AS subject_id, sub.name AS subject_name, ta.is_class_teacher
     FROM teacher_assignments ta
     JOIN sections sec ON ta.section_id = sec.id
     JOIN classes c ON sec.class_id = c.id
     LEFT JOIN subjects sub ON ta.subject_id = sub.id
     WHERE ta.teacher_user_id = 211`
  );

  const sectionMap = new Map();
  for (const r of rows) {
    const existing = sectionMap.get(r.section_id);
    if (!existing) {
      sectionMap.set(r.section_id, {
        id: r.class_id,
        section_id: r.section_id,
        name: `${r.class_name} - ${r.section_name}`,
        subject_id: r.subject_id,
        subject: r.subject_name || 'General',
        role: r.is_class_teacher ? 'Class Teacher (Homeroom)' : `Subject Teacher (${r.subject_name || 'General'})`,
        is_class_teacher: Boolean(r.is_class_teacher)
      });
    } else {
      if (r.is_class_teacher) {
        existing.is_class_teacher = true;
        existing.role = 'Class Teacher (Homeroom)';
      }
      if (r.subject_name && (!existing.subject || existing.subject === 'General')) {
        existing.subject_id = r.subject_id;
        existing.subject = r.subject_name;
      }
    }
  }

  console.log('Grouped classes result for Teacher 211:', Array.from(sectionMap.values()));
  process.exit(0);
}
testApi();
