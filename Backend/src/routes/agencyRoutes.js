import express from "express";
import { protect } from "../middlewares/authMiddleware.js"; // Protect routes
import {
  createAgency,
  getAgencies,
  getAgencyById,
  updateAgency,
  deleteAgency,
} from "../controllers/agencyController.js";

const router = express.Router();

router.post("/", protect, createAgency); // Protected route
router.get("/", getAgencies);
router.get("/:id", getAgencyById);
router.put("/:id", protect, updateAgency); // Protected route
router.delete("/:id", protect, deleteAgency); // Protected route

export default router;
