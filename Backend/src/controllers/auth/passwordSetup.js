import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../../models/userModel.js";
import sendEmail, { FRONTEND_URL } from "../../config/emailService.js";
import dotenv from "dotenv";

dotenv.config();

export const verifySetupToken = async (req, res) => {
  try {
    const { token } = req.params;
    console.log("Received token for verification:", token);

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Token is invalid or has expired",
      });
    }

    res.status(200).json({
      message: "Token is valid",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
        agencyName: user.agencyName,
      },
    });
  } catch (error) {
    console.error("Error verifying setup token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const completePasswordSetup = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Token is invalid or has expired",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordSet = true;

    await user.save();

    const message = `
      Hello ${user.username},
      
      Your password has been successfully set up for your account in the Transport Agency Management System.
      
      You can now log in using your email and new password.
      
      If you did not set up this password, please contact your administrator immediately.
      
      Regards,
      Transport Agency Management Team
    `;

    await sendEmail(user.email, "Password Setup Complete", message);

    res.status(200).json({
      message: "Password has been set successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Error completing password setup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserDetailsWithPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, username, email, phone, location } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Token is invalid or has expired",
      });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: user._id },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already in use" });
      }
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: user._id },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Username is already in use" });
      }
    }

    if (phone && phone !== user.phone) {
      const existingUser = await User.findOne({
        phone,
        _id: { $ne: user._id },
      });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Phone number is already in use" });
      }
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (location) user.location = location;

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordSet = true;

    await user.save();

    const message = `
      Hello ${user.username},
      
      Your account has been successfully set up for the Transport Agency Management System.
      
      You can now log in using your email and new password.
      
      If you did not set up this account, please contact your administrator immediately.
      
      Regards,
      Transport Agency Management Team
    `;

    await sendEmail(user.email, "Account Setup Complete", message);

    res.status(200).json({
      message: "Account has been set up successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Error completing account setup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resendSetupEmail = async (req, res) => {
  try {
    const { userId } = req.body;
    const adminId = req.userId;

    const admin = await User.findById(adminId);
    if (!admin || (admin.role !== "admin" && admin.role !== "superadmin")) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (admin.role === "admin" && user.agencyName !== admin.agencyName) {
      return res
        .status(403)
        .json({ message: "Not authorized to manage this user" });
    }

    if (user.passwordSet) {
      return res
        .status(400)
        .json({ message: "User has already set up their password" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    // Use environment variable for the frontend URL
    const resetURL = `${FRONTEND_URL}/auth/setup-password/${resetToken}`;

    const message = `
      Hello ${user.username},
      
      Your admin account has been created for the Transport Agency Management System.
      
      Please use the following link to set up your password: ${resetURL}
      
      This link will expire in 24 hours.
      
      If you did not request this account, please ignore this email.
      
      Regards,
      Transport Agency Management Team
    `;

    await sendEmail(user.email, "TAMS - Password Setup", message);

    res.status(200).json({
      message: "Password setup email has been sent",
    });
  } catch (error) {
    console.error("Error resending setup email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
