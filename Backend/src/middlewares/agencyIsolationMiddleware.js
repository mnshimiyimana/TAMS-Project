import { User } from "../models/userModel.js";

/**
 * Enhanced middleware to ensure agency isolation
 * This middleware automatically adds agency filters to database queries
 * to ensure users can only access data from their own agency
 */
export const enforceAgencyIsolation = async (req, res, next) => {
  try {
    // Skip for unauthenticated routes
    if (!req.userId) {
      return next();
    }

    // Skip for superadmin who can access all data
    if (req.userRole === "superadmin") {
      // Allow superadmin to access specific agency data if requested
      if (
        req.query.agencyName ||
        req.params.agencyName ||
        (req.body && req.body.agencyName)
      ) {
        // Just pass through the requested agency filter
        return next();
      }

      // Otherwise superadmin can access all agencies
      return next();
    }

    // For all other roles, enforce agency isolation
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add the user's agency to the request for use in controllers
    req.userAgency = user.agencyName;

    // Apply agency filter to query parameters (for GET requests)
    if (!req.query.agencyName) {
      req.query.agencyName = user.agencyName;
    } else if (req.query.agencyName !== user.agencyName) {
      return res.status(403).json({
        message:
          "You do not have permission to access data from other agencies",
      });
    }

    // Apply agency filter to request body (for POST, PUT, PATCH requests)
    if (req.body && req.method !== "GET") {
      if (!req.body.agencyName) {
        req.body.agencyName = user.agencyName;
      } else if (req.body.agencyName !== user.agencyName) {
        return res.status(403).json({
          message:
            "You do not have permission to create or modify data for other agencies",
        });
      }
    }

    // Handle path parameters if they contain agencyName
    if (req.params.agencyName && req.params.agencyName !== user.agencyName) {
      return res.status(403).json({
        message:
          "You do not have permission to access data from other agencies",
      });
    }

    next();
  } catch (error) {
    console.error("Agency isolation middleware error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Helper middleware to apply agency filter to database queries
 * This can be used in controllers to automatically filter by agency
 */
export const applyAgencyFilter = (query) => {
  return async (req, res, next) => {
    try {
      // Skip for superadmin who can access all data
      if (req.userRole === "superadmin") {
        // If superadmin explicitly requests an agency filter, apply it
        if (req.query.agencyName) {
          query.agencyName = req.query.agencyName;
        }
        return next();
      }

      // For all other roles, force agency filter
      query.agencyName = req.userAgency;
      next();
    } catch (error) {
      console.error("Apply agency filter middleware error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};
