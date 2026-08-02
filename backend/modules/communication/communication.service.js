const pool = require('../../config/db');

const getTemplates = async () => {
  const [rows] = await pool.query(
    `SELECT * FROM communication_templates WHERE channel = 'WhatsApp' ORDER BY created_at DESC`
  );
  return rows;
};

const createTemplate = async ({ title, category, subject, body, created_by }) => {
  const [res] = await pool.query(
    `INSERT INTO communication_templates (title, category, channel, subject, body, created_by)
     VALUES (?, ?, 'WhatsApp', ?, ?, ?)`,
    [title, category || 'General', subject || null, body, created_by || null]
  );
  return res.insertId;
};

const deleteTemplate = async (id) => {
  const [res] = await pool.query(
    `DELETE FROM communication_templates WHERE id = ?`,
    [id]
  );
  return res.affectedRows > 0;
};

const getLogs = async () => {
  const [rows] = await pool.query(
    `SELECT * FROM communication_logs WHERE channel = 'WhatsApp' ORDER BY created_at DESC`
  );
  return rows;
};

const createLog = async ({ recipient_group, subject, message_body, sender_id, sender_name, scheduled_time, status, recipient_count }) => {
  const [res] = await pool.query(
    `INSERT INTO communication_logs (channel, recipient_group, subject, message_body, sender_id, sender_name, scheduled_time, status, recipient_count)
     VALUES ('WhatsApp', ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      recipient_group,
      subject || '(No Subject Header)',
      message_body,
      sender_id || null,
      sender_name || 'School Admin',
      scheduled_time || 'Instant',
      status || 'Delivered',
      recipient_count || 0,
    ]
  );
  return res.insertId;
};

module.exports = {
  getTemplates,
  createTemplate,
  deleteTemplate,
  getLogs,
  createLog,
};
