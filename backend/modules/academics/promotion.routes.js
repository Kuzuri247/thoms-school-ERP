const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../../config/db");
const { verifyToken } = require("../../middleware/auth");
const { authorize } = require("../../middleware/rbac");
const { ROLES } = require("../../config/constants");
const { promoteStudentsAnnualCycle } = require("./promotion.service");

/**
 * POST /api/admin/promote-students
 * Protected by admin password authorization to trigger annual grade advancement
 */
router.post(
  "/promote-students",
  [verifyToken, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)],
  async (req, res) => {
    try {
      const { password } = req.body;
      if (!password || typeof password !== "string" || !password.trim()) {
        return res.status(400).json({
          success: false,
          message: "Administrator password is required to authorize annual grade advancement.",
        });
      }

      // Verify administrator password
      const [[userRow]] = await pool.query("SELECT password FROM users WHERE id = ?", [req.user.id]);
      if (!userRow) {
        return res.status(401).json({ success: false, message: "User account not found." });
      }

      const validPass = await bcrypt.compare(password, userRow.password);
      if (!validPass) {
        return res.status(401).json({
          success: false,
          message: "Invalid administrator password. Authorization denied.",
        });
      }

      const result = await promoteStudentsAnnualCycle();
      res.json(result);
    } catch (error) {
      console.error("Failed to execute grade promotion:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to execute grade promotion." });
    }
  },
);

module.exports = router;
