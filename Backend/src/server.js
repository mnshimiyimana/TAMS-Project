import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from 'mongoose';
import connectDB from "./config/db.js";
import agencyRoutes from './routes/agencyRoutes.js';
import userRoutes from './routes/userRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import busRoutes from './routes/busRoutes.js';
import fuelManagementRoutes from './routes/fuelManagementRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import shiftRoutes from './routes/shiftRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json()); // JSON parsing
app.use(cors()); // Enable CORS
app.use(helmet()); // Security headers
app.use(morgan("dev")); // Logging
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/agencies', agencyRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/fuel-management', fuelManagementRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/insights', insightRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
