import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import connectDB from "./config/db.js";
import agencyRoutes from "./routes/agencyRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import busRoutes from "./routes/busRoutes.js";
import fuelManagementRoutes from "./routes/fuelManagementRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";
import insightRoutes from "./routes/insightRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import superadminRoutes from "./routes/superAdminRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import packageRoutes from "./routes/packageRoutes.js";
import { auditLogin } from "./middlewares/auditLogger.js";
import { protect } from "./middlewares/authMiddleware.js";
import { enforceAgencyIsolation } from "./middlewares/agencyIsolationMiddleware.js";
// import auditLogRoutes from "./routes/auditLogRoutes.js";

// environment variables
dotenv.config();

// MongoDB
connectDB();

const app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Authentication routes (no agency isolation)
app.use("/api/auth", authRoutes);

// All other routes should apply protect middleware and agency isolation
// Protected routes
app.use("/api/agencies", protect, enforceAgencyIsolation, agencyRoutes);
app.use("/api/drivers", protect, enforceAgencyIsolation, driverRoutes);
app.use("/api/buses", protect, enforceAgencyIsolation, busRoutes);
app.use(
  "/api/fuel-management",
  protect,
  enforceAgencyIsolation,
  fuelManagementRoutes
);
app.use(
  "/api/notifications",
  protect,
  enforceAgencyIsolation,
  notificationRoutes
);
app.use("/api/shifts", protect, enforceAgencyIsolation, shiftRoutes);
app.use("/api/insights", protect, enforceAgencyIsolation, insightRoutes);
app.use("/api/superadmin", protect, superadminRoutes); // Superadmin bypasses isolation by default
app.use("/api/dashboard", protect, enforceAgencyIsolation, dashboardRoutes);
app.use("/api/feedback", protect, enforceAgencyIsolation, feedbackRoutes);
app.use("/api/packages", protect, enforceAgencyIsolation, packageRoutes);
// app.use("/api/audit-logs", auditLogRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
