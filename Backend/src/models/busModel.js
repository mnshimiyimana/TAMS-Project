import mongoose from "mongoose";

const busSchema = new mongoose.Schema({
  busId: { type: String, required: true, unique: true },
  plateNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  agencyName: { type: String, required: true },
  status: { type: String, enum: ["Assigned", "Available", "Under Maintenance"], default: "Available" },
  capacity: { type: Number, required: true },
  busHistory: [{ type: String }]
}, { timestamps: true });

export default mongoose.model("Bus", busSchema);
