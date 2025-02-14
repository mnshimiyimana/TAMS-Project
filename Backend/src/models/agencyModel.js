import mongoose from "mongoose";

const agencySchema = new mongoose.Schema(
  {
    agencyName: { type: String, required: true, unique: true },
    location: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Agency", agencySchema);
