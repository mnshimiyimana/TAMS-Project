import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    driverId: { type: String, required: true, unique: true },
    names: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ["On leave", "On Shift", "Off shift"],
      default: "Off shift",
    },
    agencyName: {
      type: String,
      required: true,
      index: true, // Add index for better query performance
    },
    lastShift: { type: Date },
  },
  { timestamps: true }
);

// Add compound index for agency isolation queries
driverSchema.index({ agencyName: 1, driverId: 1 });
driverSchema.index({ agencyName: 1, names: 1 });

export default mongoose.model("Driver", driverSchema);
