import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createShift,
  getShifts,
  getShiftById,
  updateShift,
  deleteShift,
} from "../controllers/shiftController.js";

const router = express.Router();

router.post("/", protect, createShift);
router.get("/", getShifts);
router.get("/:id", getShiftById);
router.put("/:id", protect, updateShift);
router.patch("/:id", protect, updateShift);
router.delete("/:id", protect, deleteShift);

export default router;
