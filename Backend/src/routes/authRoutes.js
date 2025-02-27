import express from "express";
import { signup } from "../controllers/auth/signup.js";
import { login, createSuperAdmin, checkSuperAdmin } from "../controllers/auth/login.js";
import { checkAdmin } from "../controllers/auth/check-admin.js";
import {
  sendResetCode,
  verifyResetCode,
  resetPassword,
} from "../controllers/auth/reset.js";
import { 
  createAdmin, 
  createUser,
  getAgencyUsers,
  updateUserStatus 
} from "../controllers/adminController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/check-admin", checkAdmin);
router.get("/check-superadmin", checkSuperAdmin);

router.post("/create-superadmin", createSuperAdmin);

router.post(
  "/create-admin", 
  protect, 
  authorize("superadmin"), 
  createAdmin
);

router.post(
  "/create-user", 
  protect, 
  authorize("admin"), 
  createUser
);

router.get(
  "/agency-users", 
  protect, 
  authorize("admin", "superadmin"), 
  getAgencyUsers
);

router.patch(
  "/user-status", 
  protect, 
  authorize("admin", "superadmin"), 
  updateUserStatus
);

router.post("/send-reset-code", sendResetCode);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

export default router;