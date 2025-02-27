import crypto from "crypto";
import bcrypt from "bcryptjs";
import { User } from "../models/userModel.js";
import sendEmail from "../utils/nodemailer.js";

const resetCodes = new Map(); // Temporary storage for reset codes

// Send a password reset code
export const sendResetCode = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Generate 6-digit reset code
    const resetCode = crypto.randomInt(100000, 999999).toString();
    resetCodes.set(email, resetCode);

    // Send email with reset code
    await sendEmail(email, "Password Reset Code", `Your password reset code is: ${resetCode}`);

    res.json({ message: "Reset code sent to email." });
  } catch (error) {
    res.status(500).json({ error: "Error sending reset code." });
  }
};

// Verify reset code
export const verifyResetCode = (req, res) => {
  const { email, code } = req.body;

  if (resetCodes.get(email) === code) {
    res.json({ message: "Code verified. Proceed to reset password." });
  } else {
    res.status(400).json({ error: "Invalid or expired reset code." });
  }
};

// Reset password after verifying the code
export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    resetCodes.delete(email); // Remove used reset code

    res.json({ message: "Password reset successful." });
  } catch (error) {
    res.status(500).json({ error: "Error resetting password." });
  }
};
