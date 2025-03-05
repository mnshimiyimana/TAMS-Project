import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  getAgenciesOverview,
  updateAgencyStatus,
  getSystemSummary,
  getAgencyHighLevelStats,
  deleteAgency,
  getAgenciesDashboard,
  getEnhancedSystemSummary,
  updateAgencyUsers,
  resetAgencyPasswords,
  getAuditLogs,
  getUserDetails,
  updateUserRole,
  deleteUser,
  resetUserPassword,
  getUsersByAgency,
  searchUsers,
} from "../controllers/superadminController.js";

const router = express.Router();

router.use(protect, authorize("superadmin"));

router.get("/agencies", getAgenciesOverview);
router.patch("/agency-status", updateAgencyStatus);
router.get("/system-summary", getSystemSummary);
router.get("/agency-stats/:agencyName", getAgencyHighLevelStats);
router.delete("/agency", deleteAgency);

router.get("/agencies-dashboard", getAgenciesDashboard);
router.get("/enhanced-summary", getEnhancedSystemSummary);
router.patch("/agency-users", updateAgencyUsers);
router.post("/reset-agency-passwords", resetAgencyPasswords);
router.get("/audit-logs", getAuditLogs);

router.get("/users/:agencyName", getUsersByAgency);
router.get("/user/:userId", getUserDetails);
router.patch("/user/role", updateUserRole);
router.delete("/user", deleteUser);
router.post("/user/reset-password", resetUserPassword);
router.get("/users/search", searchUsers);

export default router;
