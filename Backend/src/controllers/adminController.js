import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../models/userModel.js";
import Agency from "../models/agencyModel.js";
import sendEmail from "../config/nodemailer.js";

// For super admin to create admin users
export const createAdmin = async (req, res) => {
  try {
    // Get the super admin's ID from the request
    const superAdminId = req.userId;

    // Verify the creator is a super admin
    const superAdmin = await User.findById(superAdminId);
    if (!superAdmin || superAdmin.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only super admins can create admin accounts" });
    }

    const { agencyName, username, email, phone, location } = req.body;

    // Validate input
    if (!agencyName || !username || !email || !phone || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if agency exists; if not, create it
    let agency = await Agency.findOne({ agencyName });

    if (!agency) {
      agency = new Agency({
        agencyName,
        location,
      });

      await agency.save();
    }

    // Check if email or phone already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email, phone, or username already exists",
      });
    }

    // Check if an admin already exists for this agency
    const existingAdmin = await User.findOne({
      agencyName,
      role: "admin",
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: `An admin already exists for the agency '${agencyName}'`,
      });
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Create new admin user
    const newAdmin = new User({
      agencyName,
      username,
      email,
      phone,
      location,
      role: "admin",
      createdBy: superAdminId,
      passwordResetToken,
      passwordResetExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      passwordSet: false,
    });

    await newAdmin.save();

    // Send email with password setup link
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/auth/setup-password/${resetToken}`;
    const message = `
      Hello ${username},
      
      Your admin account has been created for the Transport Agency Management System.
      
      Please use the following link to set up your password: ${resetURL}
      
      This link will expire in 24 hours.
      
      If you did not request this account, please ignore this email.
      
      Regards,
      Transport Agency Management Team
    `;

    try {
      await sendEmail(email, "Welcome to TAMS - Set Up Your Password", message);

      res.status(201).json({
        message: "Admin created successfully. Password setup email sent.",
        adminId: newAdmin._id,
        agencyName: newAdmin.agencyName,
      });
    } catch (err) {
      // If email fails, still create the user but let admin know email failed
      console.error("Error sending email:", err);

      res.status(201).json({
        message:
          "Admin created successfully but email delivery failed. Please inform the user manually.",
        adminId: newAdmin._id,
        agencyName: newAdmin.agencyName,
      });
    }
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// For admin to create other users (manager, fuel)
export const createUser = async (req, res) => {
  try {
    // Get the admin's ID from the request
    const adminId = req.userId;

    // Verify the creator is an admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Only admins can create users" });
    }

    const { username, email, phone, role } = req.body;

    // Validate input
    if (!username || !email || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Ensure role is valid and not superadmin or admin
    if (!role || role === "superadmin" || role === "admin") {
      return res.status(400).json({
        message: "Invalid role. Admin can only create manager or fuel users",
      });
    }

    // Check if email or phone already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email, phone, or username already exists",
      });
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Create new user with the same agency as the admin
    const newUser = new User({
      agencyName: admin.agencyName,
      username,
      email,
      phone,
      location: admin.location, // Use admin's location by default
      role, // manager or fuel
      createdBy: adminId,
      passwordResetToken,
      passwordResetExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      passwordSet: false,
    });

    await newUser.save();

    // Send email with password setup link
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
      await sendEmail(email, "Welcome to TAMS - Set Up Your Password", message);

      res.status(201).json({
        message: "User created successfully. Password setup email sent.",
        userId: newUser._id,
        role: newUser.role,
      });
    } catch (err) {
      // If email fails, still create the user but let admin know email failed
      console.error("Error sending email:", err);

      res.status(201).json({
        message:
          "User created successfully but email delivery failed. Please inform the user manually.",
        userId: newUser._id,
        role: newUser.role,
      });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get users for an agency (admin access only for full details)
export const getAgencyUsers = async (req, res) => {
  try {
    const userId = req.userId;

    // Find the requesting user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Determine which agency to view
    let agencyName;

    if (user.role === "superadmin") {
      // Superadmin can request to see limited user info for any agency
      agencyName = req.query.agencyName;
      if (!agencyName) {
        return res.status(400).json({ message: "Agency name is required" });
      }

      // For superadmin, only return summary counts of users by role
      const userSummary = await User.aggregate([
        { $match: { agencyName } },
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            role: "$_id",
            count: 1,
          },
        },
      ]);

      // Get only admin users with limited fields
      const adminUsers = await User.find({
        agencyName,
        role: "admin",
      }).select("username email createdAt lastLogin");

      return res.status(200).json({
        agencyName,
        userSummary,
        adminUsers,
      });
    } else if (user.role === "admin") {
      // Admin can only view their own agency's users
      agencyName = user.agencyName;

      // Admins can see detailed user information for their agency
      const users = await User.find({
        agencyName,
        role: { $nin: ["superadmin"] }, // Exclude superadmins
      }).select("-password -passwordResetToken -passwordResetExpires");

      return res.status(200).json(users);
    } else {
      return res.status(403).json({ message: "Not authorized to view users" });
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update user status (activate/deactivate)
export const updateUserStatus = async (req, res) => {
  try {
    const { userId, isActive } = req.body;
    const adminId = req.userId;

    // Verify the requester is an admin or superadmin
    const admin = await User.findById(adminId);
    if (!admin || (admin.role !== "admin" && admin.role !== "superadmin")) {
      return res
        .status(403)
        .json({ message: "Not authorized to update user status" });
    }

    // Find the user to update
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    // Admin can only update users in their agency and not other admins
    if (
      admin.role === "admin" &&
      (userToUpdate.agencyName !== admin.agencyName ||
        userToUpdate.role === "admin")
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this user" });
    }

    // Superadmin can update any user except other superadmins
    if (
      admin.role === "superadmin" &&
      userToUpdate.role === "superadmin" &&
      userToUpdate._id.toString() !== adminId
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update other superadmins" });
    }

    // Update user status
    userToUpdate.isActive = isActive;
    await userToUpdate.save();

    res.status(200).json({
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
