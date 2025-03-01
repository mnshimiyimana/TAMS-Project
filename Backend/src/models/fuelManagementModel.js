import mongoose from "mongoose";

const fuelManagementSchema = new mongoose.Schema(
  {
    plateNumber: { type: String, required: true },
    fuelDate: { type: Date, required: true, default: Date.now },
    amount: { type: Number, required: true },
    amountPrice: { type: Number, required: true },
    lastFill: { type: Number, required: true },
    lastFillPrice: { type: Number, required: true },
    driverName: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("FuelManagement", fuelManagementSchema);
