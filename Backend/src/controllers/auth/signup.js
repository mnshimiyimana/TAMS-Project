import bcrypt from "bcryptjs";
import { User } from "../../models/userModel.js";
import Agency from "../../models/agencyModel.js";

export const signup = async (req, res) => {
  try {
    const { agencyName, username, email, phone, location, password, role } =
      req.body;

    const superAdminExists = await User.exists({ role: "superadmin" });

    if (!superAdminExists && role !== "superadmin") {
      return res.status(403).json({
        message: "System requires a super admin to be created first",
      });
    }

    if (superAdminExists && role === "admin") {

      return res.status(403).json({
        message:
          "Admins can only be created by super admins through the admin creation API",
      });
    }

    if (!username || !email || !phone || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (role !== "superadmin" && (!agencyName || !location)) {
      return res.status(400).json({
        message:
          "Agency name and location are required for non-superadmin roles",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "A user with this email, phone, or username already exists",
      });
    }

    if (role !== "superadmin") {
      let agency = await Agency.findOne({ agencyName });

      if (!agency) {
        agency = new Agency({
          agencyName,
          location,
        });

        await agency.save();
      }

      if (role === "admin") {
        const existingAdmin = await User.findOne({ agencyName, role: "admin" });

        if (existingAdmin) {
          return res.status(403).json({
            message: `An admin already exists for the agency '${agencyName}'. Only one admin is allowed per agency.`,
          });
        }
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      ...(role !== "superadmin" && { agencyName, location }),
      username,
      email,
      phone,
      password: hashedPassword,
      role: role || "manager",
    });

    await newUser.save();

    return res.status(201).json({
      message: "User registered successfully",
      role: newUser.role,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
