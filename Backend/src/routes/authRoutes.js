import express from "express";
import { signup } from "../controllers/auth/signup.js";
import { login } from "../controllers/auth/login.js";
import { checkAdmin } from "../controllers/auth/check-admin.js";
import {
  sendResetCode,
  verifyResetCode,
  resetPassword,
} from "../controllers/auth/reset.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/check-admin", checkAdmin);

// Reset password routes
router.post("/send-reset-code", sendResetCode);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

export default router;
