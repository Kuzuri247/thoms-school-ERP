const pool = require('../../config/db');

const getTemplates = async (limit = 100, offset = 0) => {
  const parsedLimit = Math.max(1, parseInt(limit) || 100);
  const parsedOffset = Math.max(0, parseInt(offset) || 0);
  const [rows] = await pool.query(
    `SELECT id, title, category, channel, subject, body, created_by, created_at, updated_at
     FROM communication_templates
     WHERE channel = 'WhatsApp'
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [parsedLimit, parsedOffset]
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

const getLogs = async (limit = 100, offset = 0) => {
  const parsedLimit = Math.max(1, parseInt(limit) || 100);
  const parsedOffset = Math.max(0, parseInt(offset) || 0);
  const [rows] = await pool.query(
    `SELECT id, channel, recipient_group, subject, message_body, sender_id, sender_name, scheduled_time, status, recipient_count, created_at
     FROM communication_logs
     WHERE channel = 'WhatsApp'
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [parsedLimit, parsedOffset]
  );
  return rows;
};

const createLog = async ({ recipient_group, subject, message_body, sender_id, sender_name, scheduled_time, status, recipient_count }) => {
  let formattedScheduledTime = null;
  if (scheduled_time && typeof scheduled_time === 'string' && scheduled_time.trim()) {
    const rawStr = scheduled_time.trim().replace('T', ' ');
    formattedScheduledTime = rawStr.length === 16 ? `${rawStr}:00` : rawStr;
  }

  const [res] = await pool.query(
    `INSERT INTO communication_logs (channel, recipient_group, subject, message_body, sender_id, sender_name, scheduled_time, status, recipient_count)
     VALUES ('WhatsApp', ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      recipient_group,
      subject || '(No Subject Header)',
      message_body,
      sender_id || null,
      sender_name || 'School Admin',
      formattedScheduledTime,
      status || 'Recorded',
      recipient_count != null ? recipient_count : null,
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
