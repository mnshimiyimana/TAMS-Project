import bcrypt from "bcryptjs";
import { User } from "../../models/userModel.js";
import Agency from "../../models/agencyModel.js"; // Import the Agency model

export const signup = async (req, res) => {
  try {
    console.log("Request body:", req.body); // Debugging

    const { agencyName, username, email, phone, location, password, role } = req.body;

    // Ensure phone number is provided
    if (!phone || phone.trim() === "") {
      return res.status(400).json({ message: "Phone number is required" });
    }


    const existingUserWithPhone = await User.findOne({ phone });
    if (existingUserWithPhone) {
      return res.status(400).json({ message: "Phone number is already associated with another user." });
    }

    // Check if the user is trying to create an admin for an agency
    if (role === "admin") {
      // Check if an admin already exists for this agency
      const existingAdmin = await User.findOne({ agencyName, role: "admin" });

      if (existingAdmin) {
        return res.status(403).json({
          message: `An admin already exists for the agency '${agencyName}'. Only one admin is allowed per agency.`,
        });
      }
    }

    // Check if agency already exists; if not, create it
    let agency = await Agency.findOne({ agencyName });

    if (!agency) {
      // Create the new agency
      agency = new Agency({
        agencyName,
        location,
      });

      await agency.save();
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = new User({
      agencyName,
      username,
      email,
      phone,
      location,
      password: hashedPassword,
      role, // Use the role provided in the request body
    });

    // Save the new user
    await newUser.save();

    return res
      .status(201)
      .json({ message: "User registered successfully", role });
  } catch (error) {
    console.error(error); // Log error for debugging
    return res.status(500).json({ message: "Internal server error" });
  }
};
