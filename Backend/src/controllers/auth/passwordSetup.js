import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../../models/userModel.js";
import sendEmail from "../../config/nodemailer.js";

// Verify a password setup token and show user information
export const verifySetupToken = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the provided token to match it with what's stored in the database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Token is invalid or has expired",
      });
    }

    // Return user info (excluding sensitive data)
    res.status(200).json({
      message: "Token is valid",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        agencyName: user.agencyName,
      },
    });
  } catch (error) {
    console.error("Error verifying setup token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Complete password setup
export const completePasswordSetup = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validate password
    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    // Hash the provided token to match it with what's stored in the database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Token is invalid or has expired",
      });
    }

    // Update user with new password and clear reset token
    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordSet = true;

    await user.save();

    // Send confirmation email
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

// Allow admins to resend setup email for users who haven't set their password
export const resendSetupEmail = async (req, res) => {
  try {
    const { userId } = req.body;
    const adminId = req.userId;

    // Verify requester is admin or superadmin
    const admin = await User.findById(adminId);
    if (!admin || (admin.role !== "admin" && admin.role !== "superadmin")) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is part of admin's agency (for admin role)
    if (admin.role === "admin" && user.agencyName !== admin.agencyName) {
      return res
        .status(403)
        .json({ message: "Not authorized to manage this user" });
    }

    // Check if the user has already set up their password
    if (user.passwordSet) {
      return res
        .status(400)
        .json({ message: "User has already set up their password" });
    }

    // Generate a new token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();

    // Send the email
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/auth/setup-password/${resetToken}`;
    const message = `
      Hello ${user.username},
      
      This is a reminder to set up your password for the Transport Agency Management System.
      
      Please use the following link to set up your password: ${resetURL}
      
      This link will expire in 24 hours.
      
      If you did not request this account, please ignore this email.
      
      Regards,
      Transport Agency Management Team
    `;

    await sendEmail(user.email, "TAMS - Password Setup Reminder", message);

    res.status(200).json({
      message: "Password setup email has been resent",
    });
  } catch (error) {
    console.error("Error resending setup email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
