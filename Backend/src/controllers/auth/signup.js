import bcrypt from "bcryptjs";
import { User } from "../../models/userModel.js";
import Agency from "../../models/agencyModel.js";

export const signup = async (req, res) => {
  try {
    const { agencyName, username, email, phone, location, password, role } =
      req.body;

    // First check if a super admin exists
    const superAdminExists = await User.exists({ role: "superadmin" });

    // If no super admin exists and this is not a super admin creation request, block it
    if (!superAdminExists && role !== "superadmin") {
      return res.status(403).json({
        message: "System requires a super admin to be created first",
      });
    }

    // If a super admin exists, only allow admin creation if the request is from a super admin
    // This check would typically be done via middleware, but we're including it here for clarity
    if (superAdminExists && role === "admin") {
      // In a real implementation, we'd verify the token here
      // For now, we'll just block admin creation via signup
      return res.status(403).json({
        message:
          "Admins can only be created by super admins through the admin creation API",
      });
    }

    // Validate required fields
    if (!username || !email || !phone || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // For non-superadmin roles, agency and location are required
    if (role !== "superadmin" && (!agencyName || !location)) {
      return res.status(400).json({
        message:
          "Agency name and location are required for non-superadmin roles",
      });
    }

    // Check if email or phone or username already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "A user with this email, phone, or username already exists",
      });
    }

    // For regular users, check agency
    if (role !== "superadmin") {
      // Check if agency exists; if not, create it (for first-time setup)
      let agency = await Agency.findOne({ agencyName });

      if (!agency) {
        agency = new Agency({
          agencyName,
          location,
        });

        await agency.save();
      }

      // Check for existing admin in this agency
      if (role === "admin") {
        const existingAdmin = await User.findOne({ agencyName, role: "admin" });

        if (existingAdmin) {
          return res.status(403).json({
            message: `An admin already exists for the agency '${agencyName}'. Only one admin is allowed per agency.`,
          });
        }
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = new User({
      ...(role !== "superadmin" && { agencyName, location }),
      username,
      email,
      phone,
      password: hashedPassword,
      role: role || "manager", // Default to manager if not specified
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
