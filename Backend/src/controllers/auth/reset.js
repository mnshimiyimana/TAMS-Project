import crypto from "crypto";
import bcrypt from "bcryptjs";
import { User } from "../../models/userModel.js";
import sendEmail from "../../config/emailService.js";

const resetTokens = new Map();

export const sendResetCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: "If a user with this email exists, a reset code has been sent",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error:
          "This account is deactivated. Please contact your administrator.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetCode = crypto.randomInt(100000, 999999).toString();

    resetTokens.set(resetToken, {
      email: user.email,
      code: resetCode,
      expiresAt: Date.now() + 30 * 60 * 1000,
    });

    // Prepare email
    const emailText = `
      Hello ${user.username},
      
      You've requested to reset your password for the Transport Agency Management System.
      
      Your password reset code is: ${resetCode}
      
      This code will expire in 30 minutes.
      
      If you didn't request a password reset, please ignore this email or contact your administrator.
      
      Regards,
      Transport Agency Management Team
    `;

    await sendEmail(user.email, "Password Reset Code", emailText);

    res.status(200).json({
      message: "Reset code sent to email",
      resetToken,
    });
  } catch (error) {
    console.error("Error sending reset code:", error);
    res.status(500).json({ error: "Error sending reset code" });
  }
};

export const verifyResetCode = (req, res) => {
  try {
    const { resetToken, code } = req.body;

    if (!resetToken || !code) {
      return res
        .status(400)
        .json({ error: "Reset token and code are required" });
    }

    const resetData = resetTokens.get(resetToken);

    if (!resetData) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    if (Date.now() > resetData.expiresAt) {
      resetTokens.delete(resetToken);
      return res.status(400).json({ error: "Reset code has expired" });
    }

    if (resetData.code !== code) {
      return res.status(400).json({ error: "Invalid reset code" });
    }

    resetData.verified = true;
    resetTokens.set(resetToken, resetData);

    res.status(200).json({
      message: "Code verified. Proceed to reset password",
      resetToken,
    });
  } catch (error) {
    console.error("Error verifying reset code:", error);
    res.status(500).json({ error: "Error verifying reset code" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res
        .status(400)
        .json({ error: "Reset token and new password are required" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long" });
    }

    const resetData = resetTokens.get(resetToken);

    if (!resetData || !resetData.verified) {
      return res
        .status(400)
        .json({ error: "Invalid reset token or code not verified" });
    }

    if (Date.now() > resetData.expiresAt) {
      resetTokens.delete(resetToken);
      return res.status(400).json({ error: "Reset token has expired" });
    }

    const user = await User.findOne({ email: resetData.email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    resetTokens.delete(resetToken);

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
