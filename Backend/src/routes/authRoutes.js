import express from "express";
import { signup } from "../controllers/auth/signup.js";
import {
  login,
  createSuperAdmin,
  checkSuperAdmin,
} from "../controllers/auth/login.js";
import { checkAdmin } from "../controllers/auth/check-admin.js";
import {
  sendResetLink,
  verifyResetToken,
  resetPassword,
  cleanupExpiredTokens,
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


router.post("/signup", signup);
router.post("/login", login);
router.get("/check-admin", checkAdmin);
router.get("/check-superadmin", checkSuperAdmin);
router.post("/create-superadmin", createSuperAdmin);

router.post("/send-reset-link", sendResetLink);
router.get("/verify-reset-token/:token", verifyResetToken);
router.post("/reset-password/:token", resetPassword);


router.post("/send-reset-code", sendResetLink);
router.post("/verify-reset-code", (req, res) => {
  return res.status(400).json({ error: "This endpoint is deprecated. Please use the new reset link method." });
});
router.post("/reset-password", (req, res) => {
  return res.status(400).json({ error: "This endpoint is deprecated. Please use the new reset link method." });
});


router.get("/verify-setup-token/:token", verifySetupToken);
router.post("/complete-setup/:token", completePasswordSetup);
router.post("/update-user-with-password/:token", updateUserDetailsWithPassword);

router.post(
  "/create-admin",
  protect,
  authorizeRoles("superadmin"),
  createAdmin
);

router.post("/create-user", protect, authorizeRoles("admin"), createUser);

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