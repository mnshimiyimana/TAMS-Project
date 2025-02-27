import Agency from "../models/agencyModel.js";
import { User } from "../models/userModel.js";
import Bus from "../models/busModel.js";
import Driver from "../models/driverModel.js";
import Shift from "../models/shiftModel.js";
import FuelManagement from "../models/fuelManagementModel.js";

// Get a list of all agencies with basic stats (no sensitive data)
export const getAgenciesOverview = async (req, res) => {
  try {
    // Verify requester is superadmin
    const user = await User.findById(req.userId);
    if (!user || user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can access this endpoint" });
    }

    // Get all agencies
    const agencies = await Agency.find().select(
      "agencyName location createdAt"
    );

    // Get user counts by agency and role (metadata only, no user details)
    const agencyStats = await User.aggregate([
      {
        $group: {
          _id: {
            agencyName: "$agencyName",
            role: "$role",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.agencyName",
          roles: {
            $push: {
              role: "$_id.role",
              count: "$count",
            },
          },
          totalUsers: { $sum: "$count" },
        },
      },
      {
        $project: {
          _id: 0,
          agencyName: "$_id",
          roles: 1,
          totalUsers: 1,
        },
      },
    ]);

    // Combine agency details with stats
    const agenciesWithStats = agencies.map((agency) => {
      const stats = agencyStats.find(
        (stat) => stat.agencyName === agency.agencyName
      ) || {
        totalUsers: 0,
        roles: [],
      };

      return {
        agencyName: agency.agencyName,
        location: agency.location,
        createdAt: agency.createdAt,
        userStats: {
          total: stats.totalUsers,
          roleDistribution: stats.roles,
        },
      };
    });

    res.status(200).json(agenciesWithStats);
  } catch (error) {
    console.error("Error getting agencies overview:", error);
    res.status(500).json({ error: error.message });
  }
};

// Add/update agency status (activate/deactivate) without accessing user data
export const updateAgencyStatus = async (req, res) => {
  try {
    const { agencyName, isActive } = req.body;

    // Verify requester is superadmin
    const user = await User.findById(req.userId);
    if (!user || user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can modify agency status" });
    }

    // Find agency
    const agency = await Agency.findOne({ agencyName });
    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    // Update status field (add it to schema if needed)
    agency.isActive = isActive;
    await agency.save();

    // Also update the agency admin's active status
    await User.updateOne({ agencyName, role: "admin" }, { isActive: isActive });

    res.status(200).json({
      message: `Agency ${isActive ? "activated" : "deactivated"} successfully`,
      agencyName: agency.agencyName,
    });
  } catch (error) {
    console.error("Error updating agency status:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get system-wide summary (metadata only, no sensitive data)
export const getSystemSummary = async (req, res) => {
  try {
    // Verify requester is superadmin
    const user = await User.findById(req.userId);
    if (!user || user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can access system summary" });
    }

    // Count agencies
    const totalAgencies = await Agency.countDocuments();

    // User distribution by role (system-wide)
    const userDistribution = await User.aggregate([
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

    // Most recently created agencies
    const recentAgencies = await Agency.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("agencyName location createdAt");

    // Date ranges
    const oldestAgency = await Agency.findOne()
      .sort({ createdAt: 1 })
      .select("createdAt");

    const newestAgency = await Agency.findOne()
      .sort({ createdAt: -1 })
      .select("createdAt");

    res.status(200).json({
      totalAgencies,
      userDistribution,
      recentAgencies,
      timespan: {
        firstAgencyCreated: oldestAgency?.createdAt,
        lastAgencyCreated: newestAgency?.createdAt,
      },
    });
  } catch (error) {
    console.error("Error getting system summary:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get high-level agency stats without accessing PII or sensitive operational data
export const getAgencyHighLevelStats = async (req, res) => {
  try {
    const { agencyName } = req.params;

    // Verify requester is superadmin
    const user = await User.findById(req.userId);
    if (!user || user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can access this endpoint" });
    }

    // Check if agency exists
    const agency = await Agency.findOne({ agencyName });
    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    // Get user counts by role
    const userStats = await User.aggregate([
      {
        $match: { agencyName },
      },
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

    // High-level resource counts (without details)
    const resourceCounts = {
      buses: await Bus.countDocuments({ agencyName }),
      drivers: await Driver.countDocuments({ agencyName }),
      shifts: await Shift.countDocuments({ agencyName }),
      fuelTransactions: await FuelManagement.countDocuments({ agencyName }),
    };

    // Activity metrics (dates only, not specific data)
    const activityMetrics = {
      lastUserCreated: await User.findOne({ agencyName })
        .sort({ createdAt: -1 })
        .select("createdAt")
        .then((user) => user?.createdAt),
      lastLogin: await User.findOne({ agencyName })
        .sort({ lastLogin: -1 })
        .select("lastLogin")
        .then((user) => user?.lastLogin),
    };

    res.status(200).json({
      agencyName: agency.agencyName,
      location: agency.location,
      createdAt: agency.createdAt,
      userStats,
      resourceCounts,
      activityMetrics,
    });
  } catch (error) {
    console.error("Error getting agency high-level stats:", error);
    res.status(500).json({ error: error.message });
  }
};

// Add ability to delete agency (with safety checks)
export const deleteAgency = async (req, res) => {
  try {
    const { agencyName } = req.body;

    // Verify requester is superadmin
    const user = await User.findById(req.userId);
    if (!user || user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can delete agencies" });
    }

    // Find agency
    const agency = await Agency.findOne({ agencyName });
    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    // Check if agency has any resources that would be orphaned
    const resourceCounts = {
      users: await User.countDocuments({ agencyName }),
      buses: await Bus.countDocuments({ agencyName }),
      drivers: await Driver.countDocuments({ agencyName }),
      shifts: await Shift.countDocuments({ agencyName }),
      fuelTransactions: await FuelManagement.countDocuments({ agencyName }),
    };

    const totalResources = Object.values(resourceCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    if (totalResources > 0) {
      return res.status(400).json({
        message: "Cannot delete agency with existing resources",
        resourceCounts,
      });
    }

    // Delete the agency
    await Agency.deleteOne({ agencyName });

    res.status(200).json({
      message: "Agency deleted successfully",
      agencyName,
    });
  } catch (error) {
    console.error("Error deleting agency:", error);
    res.status(500).json({ error: error.message });
  }
};
