import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
  driverId: { type: String, required: true, unique: true },
  names: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  status: { type: String, enum: ["On leave", "On Shift", "Off shift"], default: "Off shift" },
  lastShift: { type: Date } 
}, { timestamps: true });

export default mongoose.model("Driver", driverSchema);
