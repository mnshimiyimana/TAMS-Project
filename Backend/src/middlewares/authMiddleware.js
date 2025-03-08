import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { hasPermission } from "../config/permissionsConfig.js";

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    const userId = decoded.id || decoded.userId;
    console.log("Using userId:", userId);

    if (!userId) {
      return res.status(401).json({
        message: "Invalid token format",
        details: "Token payload does not contain user identifier",
      });
    }

    const user = await User.findById(userId);
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      console.log("Checking for user with ID:", userId);

      const alternativeUser = await User.findOne({
        $or: [{ _id: userId }, { userId: userId }],
      });

      console.log("Alternative user found:", alternativeUser ? "Yes" : "No");

      if (alternativeUser) {
        req.userId = alternativeUser._id;
        req.userRole = alternativeUser.role;
        req.userAgency = alternativeUser.agencyName;
        console.log("Using alternative user:", alternativeUser._id);
        return next();
      }

      return res.status(401).json({
        message: "User not found",
        details: "The user associated with this token no longer exists",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "User account is deactivated" });
    }

    req.userId = user._id;
    req.userRole = user.role;
    req.userAgency = user.agencyName;

    console.log("Auth successful for user:", {
      id: user._id,
      role: user.role,
      agency: user.agencyName,
    });

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

export const authorize = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!requiredPermission) {
        return next();
      }

      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log(
        `Permission check: User role is ${user.role}, required permission is ${requiredPermission}`
      );

      if (!hasPermission(user.role, requiredPermission)) {
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

export const authorizeRoles = (...roles) => {
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

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          message: `Access denied: ${user.role} role cannot access this resource`,
        });
      }

      console.log("Role authorization successful for user:", user._id);
      next();
    } catch (error) {
      console.error("Authorization error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};
