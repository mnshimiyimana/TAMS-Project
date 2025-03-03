import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  submitFeedback,
  getUserFeedback,
  getAllFeedback,
  updateFeedback,
  getFeedbackStats,
} from "../controllers/feedbackController.js";

const router = express.Router();

router.use(protect);

router.post("/", submitFeedback);

router.get("/my-feedback", getUserFeedback);

router.get("/", authorize("admin"), getAllFeedback);

router.get("/stats", authorize("admin"), getFeedbackStats);

router.patch("/:id", authorize("admin"), updateFeedback);

export default router;
