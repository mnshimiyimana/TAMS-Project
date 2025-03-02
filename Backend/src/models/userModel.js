import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    agencyName: {
      type: String,
      required: function () {
        return this.role !== "superadmin";
      }, 
    },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    location: {
      type: String,
      required: function () {
        return this.role !== "superadmin";
      },
    },
    password: { type: String, required: false }, // Changed to not required
    role: {
      type: String,
      enum: ["superadmin", "admin", "manager", "fuel"],
      default: "manager",
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.role !== "superadmin";
      }, 
    },
    // Adding fields for password setup
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    passwordSet: { type: Boolean, default: false },
  },
  { timestamps: true }
);


UserSchema.methods.hasPermission = function (requiredRole) {
  const roleHierarchy = {
    superadmin: 3,
    admin: 2,
    manager: 1,
    fuel: 0,
  };

  return roleHierarchy[this.role] >= roleHierarchy[requiredRole];
};

export const User = mongoose.model("User", UserSchema);