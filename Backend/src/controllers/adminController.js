import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../models/userModel.js";
import Agency from "../models/agencyModel.js";
import sendEmail from "../config/emailService.js";

// Create a new admin (by superadmin)
// Update the createAdmin function in your adminController.js file

export const createAdmin = async (req, res) => {
  try {
    const superAdminId = req.userId;

    const superAdmin = await User.findById(superAdminId);
    if (!superAdmin || superAdmin.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only super admins can create admin accounts" });
    }

    const { agencyName, username, email, phone, location } = req.body;

    if (!agencyName || !username || !email || !phone || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let agency = await Agency.findOne({ agencyName });

    if (!agency) {
      agency = new Agency({
        agencyName,
        location,
      });

      await agency.save();
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email, phone, or username already exists",
      });
    }

    const existingAdmin = await User.findOne({
      agencyName,
      role: "admin",
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: `An admin already exists for the agency '${agencyName}'`,
      });
    }

    console.log("Creating admin account for:", username, email);

    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const newAdmin = new User({
      agencyName,
      username,
      email,
      phone,
      location,
      role: "admin",
      createdBy: superAdminId,
      passwordResetToken,
      passwordResetExpires: Date.now() + 24 * 60 * 60 * 1000,
      passwordSet: false,
    });

    await newAdmin.save();
    console.log("Admin created with ID:", newAdmin._id);

    const frontendBaseUrl =
      process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
    const resetURL = `${frontendBaseUrl}/setup-password/${resetToken}`;

    console.log("Password setup URL:", resetURL);

    const message = `
      Hello ${username},
      
      Your admin account has been created for the Transport Agency Management System.
      
      Please use the following link to set up your password: ${resetURL}
      
      This link will expire in 24 hours.
      
      If you did not request this account, please ignore this email.
      
      Regards,
      Transport Agency Management Team
    `;

    console.log("Attempting to send email to:", email);
    const emailResult = await sendEmail(
      email,
      "Welcome to TAMS - Set Up Your Password",
      message
    );
    console.log("Email result:", emailResult);

    if (!emailResult.success) {
      console.error("Email sending failed:", emailResult.error);

      console.log("====================================================");
      console.log("🔗 DEVELOPMENT - SETUP LINK:");
      console.log(resetURL);
      console.log("====================================================");

      return res.status(201).json({
        message:
          "Admin created successfully but email delivery failed. Please note the setup URL for manual sharing.",
        adminId: newAdmin._id,
        agencyName: newAdmin.agencyName,
        setupUrl: process.env.NODE_ENV === "development" ? resetURL : undefined,
        emailError: emailResult.error,
      });
    }

    res.status(201).json({
      message: "Admin created successfully. Password setup email sent.",
      adminId: newAdmin._id,
      agencyName: newAdmin.agencyName,
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const adminId = req.userId;

    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can create user accounts" });
    }

    const adminAgency = admin.agencyName;
    const { username, email, phone, location } = req.body;

    if (!username || !email || !phone || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email, phone, or username already exists",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const newUser = new User({
      username,
      email,
      phone,
      location,
      role: "user",
      agencyName: adminAgency,
      createdBy: adminId,
      passwordResetToken,
      passwordResetExpires: Date.now() + 24 * 60 * 60 * 1000,
      passwordSet: false,
    });

    await newUser.save();

    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/auth/setup-password/${resetToken}`;
    const message = `
      Hello ${username},
      
      Your account has been created for the Transport Agency Management System.
      
      Please use the following link to set up your password: ${resetURL}
      
      This link will expire in 24 hours.
      
      If you did not request this account, please ignore this email.
      
      Regards,
      Transport Agency Management Team
    `;

    try {
      const emailResult = await sendEmail(
        email,
        "Welcome to TAMS - Set Up Your Password",
        message
      );
      console.log(
        `Email sent to ${email} with message ID: ${emailResult.messageId}`
      );

      res.status(201).json({
        message: "User created successfully. Password setup email sent.",
        userId: newUser._id,
        agencyName: newUser.agencyName,
      });
    } catch (err) {
      console.error("Error sending email:", err);

      res.status(201).json({
        message:
          "User created successfully but email delivery failed. Please inform the user manually.",
        userId: newUser._id,
        agencyName: newUser.agencyName,
      });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAgencyUsers = async (req, res) => {
  try {
    const adminId = req.userId;
    const { agencyName } = req.query;

    const requester = await User.findById(adminId);
    if (
      !requester ||
      (requester.role !== "admin" && requester.role !== "superadmin")
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (requester.role === "admin") {
      if (agencyName && agencyName !== requester.agencyName) {
        return res
          .status(403)
          .json({ message: "Not authorized to access other agencies" });
      }
    }

    const queryAgencyName =
      requester.role === "admin" ? requester.agencyName : agencyName || null;

    let query = {};
    if (queryAgencyName) {
      query.agencyName = queryAgencyName;
    }

    const users = await User.find(query).select(
      "-password -passwordResetToken -passwordResetExpires"
    );

    res.status(200).json({
      message: "Users retrieved successfully",
      users,
    });
  } catch (error) {
    console.error("Error getting agency users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const adminId = req.userId;
    const { userId, isActive } = req.body;

    if (!userId || isActive === undefined) {
      return res
        .status(400)
        .json({ message: "User ID and status are required" });
    }

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
        .json({ message: "Not authorized to update this user" });
    }

    if (admin.role === "admin" && user.role === "superadmin") {
      return res
        .status(403)
        .json({ message: "Not authorized to update superadmin accounts" });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      message: "User status updated successfully",
      userId: user._id,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
