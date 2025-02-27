import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

// Authenticate user and set userId in request
export const protect = async (req, res, next) => {
  try {
    let token;
    console.log("Auth headers:", req.headers.authorization);

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token extracted:", token ? "Token present" : "No token");
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Find user by id
    const user = await User.findById(decoded.id);
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      // Check if the ID exists in a different format
      console.log("Checking for user with ID:", decoded.id);

      // Try alternative ID field names that might be in the token
      const alternativeUser = await User.findOne({
        $or: [
          { _id: decoded.id },
          { _id: decoded.userId },
          { userId: decoded.id },
          { userId: decoded.userId },
        ],
      });

      console.log("Alternative user found:", alternativeUser ? "Yes" : "No");

      if (alternativeUser) {
        req.userId = alternativeUser._id;
        req.userRole = alternativeUser.role;
        req.agencyName = alternativeUser.agencyName;
        console.log("Using alternative user:", alternativeUser._id);
        return next();
      }

      return res.status(401).json({
        message: "User not found",
        details: "The user associated with this token no longer exists",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: "User account is deactivated" });
    }

    // Set user id and role in request
    req.userId = user._id;
    req.userRole = user.role;
    req.agencyName = user.agencyName;

    console.log("Auth successful for user:", {
      id: user._id,
      role: user.role,
      agency: user.agencyName,
    });

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    res.status(401).json({ message: "Not authorized", error: error.message });
  }
};

// Check user role permissions
export const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log(
        `Role check: User role is ${user.role}, allowed roles are ${roles.join(
          ", "
        )}`
      );

      // Check if user role is in the allowed roles
      if (!roles.includes(user.role)) {
        return res.status(403).json({
          message: `Access denied: ${user.role} role cannot access this resource`,
        });
      }

      console.log("Authorization successful for user:", user._id);
      next();
    } catch (error) {
      console.error("Authorization error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};
