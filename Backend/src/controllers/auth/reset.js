import crypto from "crypto";
import bcrypt from "bcryptjs";
import { User } from "../../models/userModel.js";
import sendEmail from "../../config/emailService.js";

const resetTokens = new Map();

export const sendResetLink = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Changed this to return a proper error when user is not found
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error:
          "This account is deactivated. Please contact your administrator.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    resetTokens.set(resetToken, {
      email: user.email,
      expiresAt: Date.now() + 30 * 60 * 1000,
    });

    const resetLink = `https://www.tamsrw.site/auth/reset-password/${resetToken}`;

    const emailText = `
      Hello ${user.username},
      
      You've requested to reset your password for the Transport Agency Management System.
      
      Please click the link below to reset your password:
      ${resetLink}
      
      This link will expire in 30 minutes.
      
      If you didn't request a password reset, please ignore this email or contact your administrator.
      
      Regards,
      Transport Agency Management Team
    `;

    await sendEmail(user.email, "Password Reset Link", emailText);

    res.status(200).json({
      message: "Password reset link sent to email",
    });
  } catch (error) {
    console.error("Error sending reset link:", error);
    res.status(500).json({ error: "Error sending reset link" });
  }
};

export const verifyResetToken = (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: "Reset token is required" });
    }

    const resetData = resetTokens.get(token);

    if (!resetData) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    if (Date.now() > resetData.expiresAt) {
      resetTokens.delete(token);
      return res.status(400).json({ error: "Reset token has expired" });
    }

    res.status(200).json({
      message: "Token verified. Proceed to reset password",
      email: resetData.email,
    });
  } catch (error) {
    console.error("Error verifying reset token:", error);
    res.status(500).json({ error: "Error verifying reset token" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Reset token and new password are required" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long" });
    }

    const resetData = resetTokens.get(token);

    if (!resetData) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    if (Date.now() > resetData.expiresAt) {
      resetTokens.delete(token);
      return res.status(400).json({ error: "Reset token has expired" });
    }

    const user = await User.findOne({ email: resetData.email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    resetTokens.delete(token);

    const emailText = `
      Hello ${user.username},
      
      Your password has been successfully reset.
      
      If you did not request this change, please contact your administrator immediately.
      
      Regards,
      Transport Agency Management Team
    `;

    await sendEmail(user.email, "Password Reset Successful", emailText);

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Error resetting password" });
  }
};

export const cleanupExpiredTokens = () => {
  const now = Date.now();

  for (const [token, data] of resetTokens.entries()) {
    if (now > data.expiresAt) {
      resetTokens.delete(token);
    }
  }
};

export const sendResetCode = sendResetLink;
export const verifyResetCode = (req, res) => {
  return res.status(400).json({
    error: "This endpoint is deprecated. Please use the new reset link method.",
  });
};
