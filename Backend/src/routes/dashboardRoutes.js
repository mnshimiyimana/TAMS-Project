import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { getDashboardData } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/", protect, getDashboardData);

export default router;
