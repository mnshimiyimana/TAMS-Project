import mongoose from "mongoose";

const busSchema = new mongoose.Schema({
  busId: { type: String, required: true, unique: true },
  plateNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true }, // e.g., Mini Bus, Coach
  agencyName: { type: String, required: true },
  status: { type: String, enum: ["Assigned", "Available", "Under Maintenance"], default: "Available" },
  capacity: { type: Number, required: true },
  busHistory: [{ type: String }] // Array of past trips or maintenance records
}, { timestamps: true });

export default mongoose.model("Bus", busSchema);
