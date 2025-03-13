import { User } from "../models/userModel.js";

export const enforceAgencyIsolation = async (req, res, next) => {
  try {
    if (!req.userId) {
      return next();
    }

    if (req.userRole === "superadmin") {
      if (
        req.query.agencyName ||
        req.params.agencyName ||
        (req.body && req.body.agencyName)
      ) {
        return next();
      }

      return next();
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.userAgency = user.agencyName;

    if (!req.query.agencyName) {
      req.query.agencyName = user.agencyName;
    } else if (req.query.agencyName !== user.agencyName) {
      return res.status(403).json({
        message:
          "You do not have permission to access data from other agencies",
      });
    }

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

export const applyAgencyFilter = (query) => {
  return async (req, res, next) => {
    try {
      if (req.userRole === "superadmin") {
        if (req.query.agencyName) {
          query.agencyName = req.query.agencyName;
        }
        return next();
      }

      query.agencyName = req.userAgency;
      next();
    } catch (error) {
      console.error("Apply agency filter middleware error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};
