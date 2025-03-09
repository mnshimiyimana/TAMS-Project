import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createInsight,
  getInsights,
  getInsightById,
  updateInsight,
  deleteInsight,
  generatePackageInsights,
  generateFineInsights,
} from "../controllers/insightsController.js";

const router = express.Router();

router.post("/", protect, createInsight);
router.get("/", getInsights);
router.get("/:id", getInsightById);
router.put("/:id", protect, updateInsight);
router.delete("/:id", protect, deleteInsight);


router.get("/packages/analytics", protect, generatePackageInsights);
router.get("/fines/analytics", protect, generateFineInsights);

export default router;
