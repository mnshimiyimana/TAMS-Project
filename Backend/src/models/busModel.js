import mongoose from "mongoose";

const busSchema = new mongoose.Schema(
  {
    busId: { type: String, required: true, unique: true },
    plateNumber: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    agencyName: {
      type: String,
      required: true,
      index: true, // Add index for better query performance
    },
    status: {
      type: String,
      enum: ["Assigned", "Available", "Under Maintenance"],
      default: "Available",
    },
    capacity: { type: Number, required: true },
    busHistory: [{ type: String }],
  },
  { timestamps: true }
);

// Add compound indexes for agency isolation queries
busSchema.index({ agencyName: 1, busId: 1 });
busSchema.index({ agencyName: 1, plateNumber: 1 });
busSchema.index({ agencyName: 1, status: 1 });

export default mongoose.model("Bus", busSchema);
