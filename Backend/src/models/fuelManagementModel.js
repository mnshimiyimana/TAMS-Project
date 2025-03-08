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
    agencyName: {
      type: String,
      required: true,
      index: true, 
    },
  },
  { timestamps: true }
);

fuelManagementSchema.index({ agencyName: 1, plateNumber: 1 });
fuelManagementSchema.index({ agencyName: 1, driverName: 1 });
fuelManagementSchema.index({ agencyName: 1, fuelDate: 1 });

export default mongoose.model("FuelManagement", fuelManagementSchema);
