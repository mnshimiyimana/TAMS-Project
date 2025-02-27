import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../../models/userModel.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res
        .status(403)
        .json({
          message: "Account is deactivated. Please contact your administrator.",
        });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        agencyName: user.agencyName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Return user info and token
    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        agencyName: user.agencyName,
        location: user.location,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Create a superadmin (this should be a protected route, used only for initial setup)
export const createSuperAdmin = async (req, res) => {
  try {
    // Check if a superadmin already exists
    const superAdminExists = await User.findOne({ role: "superadmin" });

    if (superAdminExists) {
      return res.status(400).json({ message: "A super admin already exists" });
    }

    const { username, email, phone, password } = req.body;

    // Validate input
    if (!username || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email, phone or username already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email, phone, or username already exists",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create super admin user
    const superAdmin = new User({
      username,
      email,
      phone,
      password: hashedPassword,
      role: "superadmin",
    });

    await superAdmin.save();

    res.status(201).json({
      message: "Super admin created successfully",
    });
  } catch (error) {
    console.error("Error creating super admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Check if a superadmin exists
export const checkSuperAdmin = async (req, res) => {
  try {
    const superAdminExists = await User.exists({ role: "superadmin" });
    return res.json({ superAdminExists: !!superAdminExists });
  } catch (error) {
    console.error("Error checking super admin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
