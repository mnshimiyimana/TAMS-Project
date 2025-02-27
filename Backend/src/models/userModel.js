import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  agencyName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true }, // Ensure this is 'phone'
  location: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "manager", "fuel"], default: "manager" },
}, { timestamps: true });

export const User = mongoose.model("User", UserSchema);
