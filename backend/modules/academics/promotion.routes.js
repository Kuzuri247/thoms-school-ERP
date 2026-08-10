const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/auth");
const { authorize } = require("../../middleware/rbac");
const { ROLES } = require("../../config/constants");
const { promoteStudentsAnnualCycle } = require("./promotion.service");

/**
 * POST /api/admin/promote-students
 * Manually or automatically trigger annual April 1st student grade promotion (Class N -> N+1)
 */
router.post(
  "/promote-students",
  [verifyToken, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)],
  async (req, res) => {
    try {
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
