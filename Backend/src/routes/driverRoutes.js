import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
} from "../controllers/driverController.js";

const router = express.Router();

router.get("/", getDrivers);
router.get("/:id", getDriverById);

router.post("/", protect, authorize("drivers:create"), createDriver);
router.put("/:id", protect, authorize("drivers:update"), updateDriver);
router.delete("/:id", protect, authorize("drivers:delete"), deleteDriver);

export default router;
