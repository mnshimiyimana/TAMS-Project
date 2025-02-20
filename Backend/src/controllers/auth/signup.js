import bcrypt from "bcryptjs";
import { User } from "../../models/userModel.js";

export const signup = async (req, res) => {
  try {
    const { agencyName, username, email, phone, location, password, role } =
      req.body;

    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin && role === "admin") {
      return res.status(403).json({
        message: "Admin sign-up is restricted. An admin already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRole = existingAdmin ? role : "admin";

    const newUser = new User({
      agencyName,
      username,
      email,
      phone,
      location,
      password: hashedPassword,
      role: userRole,
    });

    await newUser.save();
    return res
      .status(201)
      .json({ message: "User registered successfully", role: userRole });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
