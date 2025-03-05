import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
    plateNumber: { type: String, required: true },
    driverName: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    actualEndTime: { type: Date },
    destination: { type: String, required: true },
    origin: { type: String, required: true },
    Date: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Shift", shiftSchema);
