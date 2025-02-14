import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    userPreferences: [{ type: String }], 
    agency: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    // role: { type: String, enum: ["admin", "manager", "fuels"], required: true },
    role: { type: String, enum: ["admin", "manager"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
