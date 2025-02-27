import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  getAgenciesOverview,
  updateAgencyStatus,
  getSystemSummary,
  getAgencyHighLevelStats,
  deleteAgency
} from "../controllers/superadminController.js";

const router = express.Router();

// All routes require superadmin role
router.use(protect, authorize("superadmin"));

// Get overview of all agencies (no sensitive data)
router.get("/agencies", getAgenciesOverview);

// Update agency status
router.patch("/agency-status", updateAgencyStatus);

// Get system-wide summary
router.get("/system-summary", getSystemSummary);

// Get high-level stats for a specific agency
router.get("/agency-stats/:agencyName", getAgencyHighLevelStats);

// Delete an agency (with safety checks)
router.delete("/agency", deleteAgency);

export default router;