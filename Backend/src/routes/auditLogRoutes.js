import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  getAuditLogs,
  getAuditLogDetails,
  getAuditLogStats,
  exportAuditLogs,
} from "../controllers/auditLogController.js";

const router = express.Router();

router.use(protect, authorize("superadmin"));

router.get("/", getAuditLogs);

router.get("/:id", getAuditLogDetails);

router.get("/stats/summary", getAuditLogStats);

router.get("/export/csv", exportAuditLogs);

export default router;
