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

// Important: Apply the protect middleware to all routes
router.post("/", protect, authorize("superadmin"), createAgency);
router.get("/", protect, getAgencies); // This was missing the protect middleware
router.get("/:id", protect, getAgencyById);
router.put("/:id", protect, updateAgency);
router.delete("/:id", protect, deleteAgency);

export default router;
