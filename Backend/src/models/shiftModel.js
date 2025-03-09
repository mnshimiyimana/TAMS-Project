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
    agencyName: { 
      type: String, 
      required: true,
      index: true 
    }
  },
  { timestamps: true }
);


shiftSchema.index({ agencyName: 1, plateNumber: 1 });
shiftSchema.index({ agencyName: 1, driverName: 1 });
shiftSchema.index({ agencyName: 1, Date: 1 });

export default mongoose.model("Shift", shiftSchema);