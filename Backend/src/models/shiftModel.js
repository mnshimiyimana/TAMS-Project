import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
    plateNumber: { type: String, required: true }, // References Bus
    driverName: { type: String, required: true }, // References Driver
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    destination: { type: String, required: true },
    origin: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Shift", shiftSchema);
