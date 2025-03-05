// Update your routes to include the agency isolation middleware
import express from "express";
import { signup } from "../controllers/auth/signup.js";
import {
  login,
  createSuperAdmin,
  checkSuperAdmin,
} from "../controllers/auth/login.js";
import { checkAdmin } from "../controllers/auth/check-admin.js";
import {
  sendResetCode,
  verifyResetCode,
  resetPassword,
} from "../controllers/auth/reset.js";
import {
  verifySetupToken,
  completePasswordSetup,
  resendSetupEmail,
  updateUserDetailsWithPassword,
} from "../controllers/auth/passwordSetup.js";
import {
  createAdmin,
  createUser,
  getAgencyUsers,
  updateUserStatus,
} from "../controllers/adminController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/check-admin", checkAdmin);
router.get("/check-superadmin", checkSuperAdmin);
router.post("/create-superadmin", createSuperAdmin);

// Password reset/setup public endpoints
router.post("/send-reset-code", sendResetCode);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);
router.get("/verify-setup-token/:token", verifySetupToken);
router.post("/complete-setup/:token", completePasswordSetup);
router.post("/update-user-with-password/:token", updateUserDetailsWithPassword);

// Protected admin routes with agency isolation
router.post(
  "/create-admin",
  protect,
  authorizeRoles("superadmin"),
  createAdmin
);

router.post("/create-user", protect, authorizeRoles("admin"), createUser);

// Apply agency isolation to user data access
router.get(
  "/agency-users",
  protect,
  authorizeRoles("admin", "superadmin"),

  getAgencyUsers
);

router.patch(
  "/user-status",
  protect,
  authorizeRoles("admin", "superadmin"),

  updateUserStatus
);

router.post(
  "/resend-setup-email",
  protect,
  authorizeRoles("admin", "superadmin"),

  resendSetupEmail
);

export default router;
