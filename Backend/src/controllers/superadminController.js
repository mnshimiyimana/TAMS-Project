import Agency from "../models/agencyModel.js";
import { User } from "../models/userModel.js";
import Bus from "../models/busModel.js";
import Driver from "../models/driverModel.js";
import Shift from "../models/shiftModel.js";
import FuelManagement from "../models/fuelManagementModel.js";
import Feedback from "../models/feedbackModel.js";

export const getAgenciesOverview = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can access this endpoint" });
    }

    const agencies = await Agency.find().select(
      "agencyName location createdAt"
    );

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

export const updateAgencyStatus = async (req, res) => {
  try {
    const { agencyName, isActive } = req.body;

    const user = await User.findById(req.userId);
    if (!user || user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can modify agency status" });
    }

    const agency = await Agency.findOne({ agencyName });
    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    agency.isActive = isActive;
    await agency.save();

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

export const getSystemSummary = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can access system summary" });
    }

    const totalAgencies = await Agency.countDocuments();

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

    const recentAgencies = await Agency.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("agencyName location createdAt");

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

export const getAgencyHighLevelStats = async (req, res) => {
  try {
    const { agencyName } = req.params;

    const user = await User.findById(req.userId);
    if (!user || user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can access this endpoint" });
    }

    const agency = await Agency.findOne({ agencyName });
    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

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

    const resourceCounts = {
      buses: await Bus.countDocuments({ agencyName }),
      drivers: await Driver.countDocuments({ agencyName }),
      shifts: await Shift.countDocuments({ agencyName }),
      fuelTransactions: await FuelManagement.countDocuments({ agencyName }),
    };

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

export const deleteAgency = async (req, res) => {
  try {
    const { agencyName } = req.body;

    const user = await User.findById(req.userId);
    if (!user || user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can delete agencies" });
    }

    const agency = await Agency.findOne({ agencyName });
    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

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

export const getAgenciesDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can access this endpoint" });
    }

    const agencies = await Agency.find().select(
      "agencyName location createdAt isActive"
    );

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

    const resourceCounts = await Promise.all(
      agencies.map(async (agency) => {
        const buses = await Bus.countDocuments({
          agencyName: agency.agencyName,
        });
        const drivers = await Driver.countDocuments({
          agencyName: agency.agencyName,
        });
        const shifts = await Shift.countDocuments({
          agencyName: agency.agencyName,
        });
        const feedback = await Feedback.countDocuments({
          agencyName: agency.agencyName,
        });

        return {
          agencyName: agency.agencyName,
          resourceCounts: { buses, drivers, shifts, feedback },
        };
      })
    );

    const agenciesWithStats = agencies.map((agency) => {
      const stats = agencyStats.find(
        (stat) => stat.agencyName === agency.agencyName
      ) || {
        totalUsers: 0,
        roles: [],
      };

      const resources = resourceCounts.find(
        (resource) => resource.agencyName === agency.agencyName
      )?.resourceCounts || {
        buses: 0,
        drivers: 0,
        shifts: 0,
        feedback: 0,
      };

      return {
        _id: agency._id,
        agencyName: agency.agencyName,
        location: agency.location,
        createdAt: agency.createdAt,
        isActive: agency.isActive !== false,
        userStats: {
          total: stats.totalUsers,
          roleDistribution: stats.roles,
        },
        resources,
      };
    });

    res.status(200).json(agenciesWithStats);
  } catch (error) {
    console.error("Error getting agencies dashboard:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getEnhancedSystemSummary = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can access system summary" });
    }

    const totalAgencies = await Agency.countDocuments();
    const activeAgencies = await Agency.countDocuments({
      isActive: { $ne: false },
    });

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

    const recentAgencies = await Agency.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("agencyName location createdAt");

    const recentActivity = await User.find()
      .sort({ lastLogin: -1 })
      .limit(5)
      .select("username role agencyName lastLogin");

    const oldestAgency = await Agency.findOne()
      .sort({ createdAt: 1 })
      .select("createdAt");

    const newestAgency = await Agency.findOne()
      .sort({ createdAt: -1 })
      .select("createdAt");

    const totalBuses = await Bus.countDocuments();
    const totalDrivers = await Driver.countDocuments();
    const totalShifts = await Shift.countDocuments();
    const totalFeedback = await Feedback.countDocuments();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersLast30Days = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const newFeedbackLast30Days = await Feedback.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const recentFeedbackByType = await Feedback.aggregate([
      {
        $match: { createdAt: { $gte: thirtyDaysAgo } },
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      agencyStats: {
        totalAgencies,
        activeAgencies,
        inactiveAgencies: totalAgencies - activeAgencies,
      },
      userStats: {
        totalUsers: userDistribution.reduce((sum, role) => sum + role.count, 0),
        userDistribution,
      },
      resourceStats: {
        totalBuses,
        totalDrivers,
        totalShifts,
        totalFeedback,
      },
      recentActivity: {
        newUsersLast30Days,
        newFeedbackLast30Days,
        feedbackByType: recentFeedbackByType,
      },
      recentAgencies,
      recentLogins: recentActivity,
      timespan: {
        firstAgencyCreated: oldestAgency?.createdAt,
        lastAgencyCreated: newestAgency?.createdAt,
      },
    });
  } catch (error) {
    console.error("Error getting enhanced system summary:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateAgencyUsers = async (req, res) => {
  try {
    const { agencyName, isActive } = req.body;

    const user = await User.findById(req.userId);
    if (!user || user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can perform this action" });
    }

    const agency = await Agency.findOne({ agencyName });
    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    const result = await User.updateMany({ agencyName }, { isActive });

    agency.isActive = isActive;
    await agency.save();

    res.status(200).json({
      message: `${result.modifiedCount} users in agency ${agencyName} ${
        isActive ? "activated" : "deactivated"
      } successfully`,
      agencyName,
      affectedUsers: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating agency users:", error);
    res.status(500).json({ error: error.message });
  }
};

export const resetAgencyPasswords = async (req, res) => {
  try {
    const { agencyName } = req.body;

    const user = await User.findById(req.userId);
    if (!user || user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can perform this action" });
    }

    const agency = await Agency.findOne({ agencyName });
    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    const users = await User.find({
      agencyName,
      role: { $ne: "superadmin" },
    });

    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found for this agency" });
    }

    let processedCount = 0;

    for (const user of users) {
      user.passwordSet = false;
      await user.save();
      processedCount++;
    }

    res.status(200).json({
      message: `Password reset initialized for ${processedCount} users in agency ${agencyName}`,
      agencyName,
      affectedUsers: processedCount,
    });
  } catch (error) {
    console.error("Error resetting agency passwords:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can access audit logs" });
    }

    const { limit = 50, page = 1, agencyName } = req.query;

    const skip = (page - 1) * limit;

    const query = {};
    if (agencyName) {
      query.agencyName = agencyName;
    }

    const users = await User.find(query)
      .select("username role agencyName lastLogin createdAt")
      .sort({ lastLogin: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting audit logs:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const superAdmin = await User.findById(req.userId);
    if (!superAdmin || superAdmin.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can access user details" });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;

    if (!["admin", "manager", "operator"].includes(newRole)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const superAdmin = await User.findById(req.userId);
    if (!superAdmin || superAdmin.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can update user roles" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "superadmin") {
      return res
        .status(403)
        .json({ message: "Cannot modify superadmin accounts" });
    }

    const oldRole = user.role;
    user.role = newRole;
    await user.save();

    await createAuditLog({
      userId: req.userId,
      action: "update_role",
      resourceType: "user",
      resourceId: userId,
      description: `Changed user ${user.username} role from ${oldRole} to ${newRole}`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      metadata: { oldRole, newRole },
    });

    res.status(200).json({
      message: "User role updated successfully",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        agencyName: user.agencyName,
      },
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const superAdmin = await User.findById(req.userId);
    if (!superAdmin || superAdmin.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can delete users" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "superadmin") {
      return res
        .status(403)
        .json({ message: "Cannot delete superadmin accounts" });
    }

    const userInfo = {
      username: user.username,
      role: user.role,
      agencyName: user.agencyName,
    };

    await User.findByIdAndDelete(userId);

    await createAuditLog({
      userId: req.userId,
      action: "delete",
      resourceType: "user",
      resourceId: userId,
      description: `Deleted user ${userInfo.username} (${userInfo.role}) from agency ${userInfo.agencyName}`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      metadata: { deletedUser: userInfo },
    });

    res.status(200).json({
      message: "User deleted successfully",
      deletedUser: userInfo,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: error.message });
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.body;

    const superAdmin = await User.findById(req.userId);
    if (!superAdmin || superAdmin.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can reset passwords" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.passwordSet = false;
    await user.save();

    await createAuditLog({
      userId: req.userId,
      action: "reset_password",
      resourceType: "user",
      resourceId: userId,
      description: `Reset password for user ${user.username}`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(200).json({
      message: "User password reset successfully",
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Error resetting user password:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getUsersByAgency = async (req, res) => {
  try {
    const { agencyName } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const superAdmin = await User.findById(req.userId);
    if (!superAdmin || superAdmin.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can access this endpoint" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { agencyName };

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching users by agency:", error);
    res.status(500).json({ error: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query, page = 1, limit = 20 } = req.query;

    const superAdmin = await User.findById(req.userId);
    if (!superAdmin || superAdmin.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can access this endpoint" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const searchQuery = {
      $or: [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { agencyName: { $regex: query, $options: "i" } },
      ],
    };

    const users = await User.find(searchQuery)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(searchQuery);

    res.status(200).json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: error.message });
  }
};
