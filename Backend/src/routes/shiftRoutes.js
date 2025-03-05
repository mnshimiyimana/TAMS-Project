import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  createShift,
  getShifts,
  getShiftById,
  updateShift,
  deleteShift,
} from "../controllers/shiftController.js";

const router = express.Router();

router.get("/", getShifts);
router.get("/:id", getShiftById);

router.post("/", protect, authorize("shifts:create"), createShift);
router.put("/:id", protect, authorize("shifts:update"), updateShift);
router.patch("/:id", protect, authorize("shifts:update"), updateShift);
router.delete("/:id", protect, authorize("shifts:delete"), deleteShift);

export default router;
