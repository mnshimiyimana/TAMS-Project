import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    packageId: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderPhone: {
      type: String,
      required: true,
    },
    receiverName: {
      type: String,
      required: true,
    },
    receiverPhone: {
      type: String,
      required: true,
    },
    pickupLocation: {
      type: String,
      required: true,
    },
    deliveryLocation: {
      type: String,
      required: true,
    },
    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
    },
    driverName: {
      type: String,
      required: true,
    },
    plateNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Transit", "Delivered", "Cancelled", "Returned"],
      default: "Pending",
    },
    agencyName: {
      type: String,
      required: true,
    },
    deliveredAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

packageSchema.pre("save", async function (next) {
  try {
    if (this.isModified("shiftId")) {
      const Shift = mongoose.model("Shift");
      const shift = await Shift.findById(this.shiftId);

      if (shift) {
        this.driverName = shift.driverName;
        this.plateNumber = shift.plateNumber;

        if (shift.endTime) {
          this.status = "Delivered";
          this.deliveredAt = shift.endTime;
        } else {
          this.status = "In Transit";
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Package", packageSchema);
