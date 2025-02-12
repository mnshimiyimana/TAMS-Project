import mongoose from "mongoose";

const fuelManagementSchema = new mongoose.Schema(
  {
    plateNumber: { type: String, required: true }, // References Bus
    fuelDate: { type: Date, required: true, default: Date.now },
    amount: { type: Number, required: true }, // Liters or Gallons
    lastFill: { type: Number, required: true }, // Last recorded fuel level
    driverName: { type: String, required: true }, // List of fuel-related transactions
  },
  { timestamps: true }
);

export default mongoose.model("FuelManagement", fuelManagementSchema);
