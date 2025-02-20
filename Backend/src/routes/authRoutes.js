import express from "express";
import { signup } from "../controllers/auth/signup.js";
import { login } from "../controllers/auth/login.js";
import { checkAdmin } from "../controllers/auth/check-admin.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/api/auth/check-admin", checkAdmin);

export default router;
