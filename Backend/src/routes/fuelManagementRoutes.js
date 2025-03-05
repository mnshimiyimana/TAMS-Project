import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  createFuelTransaction,
  getFuelTransactions,
  getFuelTransactionById,
  updateFuelTransaction,
  deleteFuelTransaction,
} from "../controllers/fuelManagementController.js";

const router = express.Router();

router.get("/", getFuelTransactions);
router.get("/:id", getFuelTransactionById);

router.post(
  "/",
  protect,
  authorize("fuel-management:create"),
  createFuelTransaction
);
router.put(
  "/:id",
  protect,
  authorize("fuel-management:update"),
  updateFuelTransaction
);
router.delete(
  "/:id",
  protect,
  authorize("fuel-management:delete"),
  deleteFuelTransaction
);

export default router;
