import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  createPackage,
  getPackages,
  getPackageById,
  updatePackage,
  updatePackageStatus,
  deletePackage,
  getPackageStats,
} from "../controllers/packageController.js";

const router = express.Router();

router.use(protect);

router.post("/", authorize("packages:create"), createPackage);

router.get("/", authorize("packages:read"), getPackages);

router.get("/stats", authorize("packages:read"), getPackageStats);

router.get("/:id", authorize("packages:read"), getPackageById);

router.put("/:id", authorize("packages:update"), updatePackage);

router.patch("/:id/status", authorize("packages:update"), updatePackageStatus);

router.delete("/:id", authorize("packages:delete"), deletePackage);

export default router;
