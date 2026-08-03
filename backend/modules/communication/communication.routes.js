const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/auth");
const { authorize } = require("../../middleware/rbac");
const { ROLES } = require("../../config/constants");
const svc = require("./communication.service");

const canManage = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

// GET /api/communication/templates - Fetch saved WhatsApp message templates
router.get(
  "/templates",
  verifyToken,
  authorize(...canManage),
  async (req, res, next) => {
    try {
      const templates = await svc.getTemplates();
      res.json({ success: true, data: templates });
    } catch (error) {
      console.error("Error fetching communication templates:", error);
      next(error);
    }
  },
);

// POST /api/communication/templates - Create a new WhatsApp message template
router.post(
  "/templates",
  verifyToken,
  authorize(...canManage),
  async (req, res, next) => {
    try {
      const { title, category, subject, body } = req.body;
      if (!title || !body) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Template title and body content are required.",
          });
      }

      const id = await svc.createTemplate({
        title,
        category,
        subject,
        body,
        created_by: req.user.id,
      });

      res
        .status(201)
        .json({
          success: true,
          message: "WhatsApp template saved successfully",
          id,
        });
    } catch (error) {
      console.error("Error creating communication template:", error);
      next(error);
    }
  },
);

// DELETE /api/communication/templates/:id - Delete a WhatsApp template
router.delete(
  "/templates/:id",
  verifyToken,
  authorize(...canManage),
  async (req, res, next) => {
    try {
      const success = await svc.deleteTemplate(req.params.id);
      if (!success) {
        return res
          .status(404)
          .json({ success: false, message: "Template not found" });
      }
      res.json({ success: true, message: "Template deleted successfully" });
    } catch (error) {
      console.error("Error deleting communication template:", error);
      next(error);
    }
  },
);

// GET /api/communication/logs - Fetch WhatsApp communication broadcast logs
router.get("/logs", verifyToken, authorize(...canManage), async (req, res, next) => {
  try {
    const logs = await svc.getLogs();
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error("Error fetching communication logs:", error);
    next(error);
  }
});

// POST /api/communication/send - Dispatch / Log a WhatsApp Broadcast
router.post("/send", verifyToken, authorize(...canManage), async (req, res, next) => {
  try {
    const {
      recipient_group,
      custom_recipients,
      subject,
      message_body,
      is_scheduled,
      scheduled_time,
      recipient_count,
    } = req.body;

    if (!recipient_group || !message_body) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Recipient group and message body are required.",
        });
    }

    if (is_scheduled && (!scheduled_time || !String(scheduled_time).trim())) {
      return res.status(400).json({
        success: false,
        message: "Scheduled time is required for scheduled broadcasts.",
      });
    }

    let senderName = req.user.full_name;
    if (!senderName) {
      const pool = require("../../config/db");
      const [[uRow]] = await pool.query("SELECT full_name FROM users WHERE id = ?", [req.user.id]);
      senderName = uRow?.full_name || "School Admin";
    }

    const effectiveGroup = recipient_group === 'Custom Phone List' && custom_recipients
      ? `Custom Phone List (${custom_recipients})`
      : recipient_group;

    const status = is_scheduled ? "Scheduled" : "Recorded";
    const count = typeof recipient_count === "number" && !isNaN(recipient_count) ? recipient_count : null;

    const id = await svc.createLog({
      recipient_group: effectiveGroup,
      subject,
      message_body,
      sender_id: req.user.id,
      sender_name: senderName,
      scheduled_time: is_scheduled ? scheduled_time : null,
      status,
      recipient_count: count,
    });

    res.status(201).json({
      success: true,
      message: is_scheduled
        ? "WhatsApp message scheduled successfully"
        : "WhatsApp broadcast logged successfully",
      id,
    });
  } catch (error) {
    console.error("Error sending WhatsApp communication broadcast:", error);
    next(error);
  }
});

module.exports = router;
