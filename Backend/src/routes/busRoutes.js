import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  createBus,
  getBuses,
  getBusById,
  updateBus,
  deleteBus,
} from "../controllers/busController.js";

const router = express.Router();

router.get("/", getBuses);
router.get("/:id", getBusById);

router.post("/", protect, authorize("buses:create"), createBus);
router.put("/:id", protect, authorize("buses:update"), updateBus);
router.delete("/:id", protect, authorize("buses:delete"), deleteBus);

export default router;
