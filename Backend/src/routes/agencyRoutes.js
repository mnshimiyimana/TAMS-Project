import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createAgency,
  getAgencies,
  getAgencyById,
  updateAgency,
  deleteAgency,
} from "../controllers/agencyController.js";

const router = express.Router();

router.post("/", protect, createAgency); 
router.get("/", getAgencies);
router.get("/:id", getAgencyById);
router.put("/:id", protect, updateAgency); 
router.delete("/:id", protect, deleteAgency);

export default router;
