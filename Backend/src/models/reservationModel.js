import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reservationDate: { type: Date, required: true },
    isPaid: { type: Boolean, default: false },
    reservationHistory: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("Reservation", reservationSchema);
