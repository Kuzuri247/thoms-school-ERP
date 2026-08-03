const pool = require('../../config/db');

const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const match = trimmed.match(
    /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})(?:[?#&].*)?$/i
  );
  return match ? match[1] : null;
};

const createMaterial = async ({ teacher_id, section_id, title, description, youtube_url }) => {
  const youtube_video_id = extractYouTubeId(youtube_url);
  const [res] = await pool.query(
    `INSERT INTO elearning_materials (teacher_id, section_id, title, description, youtube_url, youtube_video_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [teacher_id, section_id, title, description || null, youtube_url, youtube_video_id]
  );
  return res.insertId;
};

const getTeacherMaterials = async (teacher_id) => {
  const [rows] = await pool.query(
    `SELECT em.*, c.name AS class_name, sec.name AS section_name
     FROM elearning_materials em
     JOIN sections sec ON em.section_id = sec.id
     JOIN classes c ON sec.class_id = c.id
     WHERE em.teacher_id = ?
     ORDER BY em.created_at DESC`,
    [teacher_id]
  );
  return rows;
};

const getStudentMaterials = async (student_user_id) => {
  const [[student]] = await pool.query(
    `SELECT section_id FROM students WHERE user_id = ?`,
    [student_user_id]
  );
  if (!student || !student.section_id) return [];

  const [rows] = await pool.query(
    `SELECT em.*, c.name AS class_name, sec.name AS section_name, u.full_name AS teacher_name
     FROM elearning_materials em
     JOIN sections sec ON em.section_id = sec.id
     JOIN classes c ON sec.class_id = c.id
     JOIN users u ON em.teacher_id = u.id
     WHERE em.section_id = ?
     ORDER BY em.created_at DESC`,
    [student.section_id]
  );
  return rows;
};

const deleteMaterial = async (id, teacher_id) => {
  const [res] = await pool.query(
    `DELETE FROM elearning_materials WHERE id = ? AND teacher_id = ?`,
    [id, teacher_id]
  );
  return res.affectedRows > 0;
};

module.exports = {
  extractYouTubeId,
  createMaterial,
  getTeacherMaterials,
  getStudentMaterials,
  deleteMaterial,
};
