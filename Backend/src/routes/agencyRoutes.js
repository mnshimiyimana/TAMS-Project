import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  createAgency,
  getAgencies,
  getAgencyById,
  updateAgency,
  deleteAgency,
} from "../controllers/agencyController.js";

const router = express.Router();

router.post("/", protect, authorize("superadmin"), createAgency);
router.get("/", protect, getAgencies);
router.get("/:id", protect, getAgencyById);
router.put("/:id", protect, updateAgency);
router.delete("/:id", protect, deleteAgency);

export default router;
