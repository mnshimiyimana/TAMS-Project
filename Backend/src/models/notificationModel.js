import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    reservationId: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation", required: true },
    sentDate: { type: Date, required: true },
    notificationType: { type: String, required: true },
    notificationLog: [{ type: String }], // List of notification records
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
