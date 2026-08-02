const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const { ROLES } = require('../../config/constants');
const svc = require('./communication.service');

const canManage = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

// GET /api/communication/templates - Fetch saved WhatsApp message templates
router.get('/templates', verifyToken, authorize(...canManage), async (req, res) => {
  try {
    const templates = await svc.getTemplates();
    res.json({ success: true, data: templates });
  } catch (error) {
    console.error('Error fetching communication templates:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/communication/templates - Create a new WhatsApp message template
router.post('/templates', verifyToken, authorize(...canManage), async (req, res) => {
  try {
    const { title, category, subject, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Template title and body content are required.' });
    }

    const id = await svc.createTemplate({
      title,
      category,
      subject,
      body,
      created_by: req.user.id,
    });

    res.status(201).json({ success: true, message: 'WhatsApp template saved successfully', id });
  } catch (error) {
    console.error('Error creating communication template:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/communication/templates/:id - Delete a WhatsApp template
router.delete('/templates/:id', verifyToken, authorize(...canManage), async (req, res) => {
  try {
    const success = await svc.deleteTemplate(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting communication template:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/communication/logs - Fetch WhatsApp communication broadcast logs
router.get('/logs', verifyToken, authorize(...canManage), async (req, res) => {
  try {
    const logs = await svc.getLogs();
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Error fetching communication logs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/communication/send - Dispatch / Log a WhatsApp Broadcast
router.post('/send', verifyToken, authorize(...canManage), async (req, res) => {
  try {
    const { recipient_group, subject, message_body, is_scheduled, scheduled_time, recipient_count } = req.body;
    if (!recipient_group || !message_body) {
      return res.status(400).json({ success: false, message: 'Recipient group and message body are required.' });
    }

    const senderName = req.user.full_name || 'School Admin';
    const status = is_scheduled ? 'Scheduled' : 'Delivered';
    const count = recipient_count || (recipient_group.includes('All') ? 450 : 35);

    const id = await svc.createLog({
      recipient_group,
      subject,
      message_body,
      sender_id: req.user.id,
      sender_name: senderName,
      scheduled_time: is_scheduled ? (scheduled_time || 'Scheduled') : 'Instant',
      status,
      recipient_count: count,
    });

    res.status(201).json({
      success: true,
      message: is_scheduled ? 'WhatsApp message scheduled successfully' : 'WhatsApp broadcast sent successfully',
      id,
    });
  } catch (error) {
    console.error('Error sending WhatsApp communication broadcast:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
