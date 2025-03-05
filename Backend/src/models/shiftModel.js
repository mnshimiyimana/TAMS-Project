import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
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
