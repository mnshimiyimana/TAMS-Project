import { User } from "../models/userModel.js";
import Bus from "../models/busModel.js";
import Driver from "../models/driverModel.js";
import Shift from "../models/shiftModel.js";
import FuelManagement from "../models/fuelManagementModel.js";

export const getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let dashboardData = {};

    dashboardData.user = {
      username: user.username,
      role: user.role,
      agencyName: user.agencyName,
      lastLogin: user.lastLogin,
    };

    switch (user.role) {
      case "superadmin":
        dashboardData = await getSuperAdminDashboard(dashboardData);
        break;

      case "admin":
        dashboardData = await getAdminDashboard(dashboardData, user.agencyName);
        break;

      case "manager":
        dashboardData = await getManagerDashboard(
          dashboardData,
          user.agencyName
        );
        break;

      case "fuel":
        dashboardData = await getFuelDashboard(dashboardData, user.agencyName);
        break;

      default:
        return res.status(403).json({ message: "Invalid user role" });
    }

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

async function getSuperAdminDashboard(dashboardData) {
  const agencies = await User.aggregate([
    {
      $group: {
        _id: "$agencyName",
        totalUsers: { $sum: 1 },
        adminCount: {
          $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] },
        },
        managerCount: {
          $sum: { $cond: [{ $eq: ["$role", "manager"] }, 1, 0] },
        },
        fuelManagerCount: {
          $sum: { $cond: [{ $eq: ["$role", "fuel"] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        agencyName: "$_id",
        totalUsers: 1,
        userRoles: {
          admin: "$adminCount",
          manager: "$managerCount",
          fuel: "$fuelManagerCount",
        },
      },
    },
  ]);

  const adminUsers = await User.find({ role: "admin" })
    .select("username email agencyName createdAt lastLogin")
    .sort({ agencyName: 1 });

  const systemStats = {
    agencyCount: agencies.length,
    adminCount: await User.countDocuments({ role: "admin" }),
    totalUserCount: await User.countDocuments(),
  };

  return {
    ...dashboardData,
    systemStats,
    agencies,
    adminUsers,
  };
}

async function getAdminDashboard(dashboardData, agencyName) {
  const users = await User.find({ agencyName })
    .select("-password")
    .sort({ createdAt: -1 });

  const buses = await Bus.find({ agencyName });
  const drivers = await Driver.find({ agencyName });

  const activeShifts = await Shift.find({
    agencyName,
    endTime: { $exists: false }, 
  });

  const fuelTransactions = await FuelManagement.find({ agencyName })
    .sort({ fuelDate: -1 })
    .limit(5);

  return {
    ...dashboardData,
    agencyStats: {
      userCount: users.length,
      busCount: buses.length,
      driverCount: drivers.length,
      activeShiftsCount: activeShifts.length,
    },
    users,
    buses,
    drivers,
    activeShifts,
    fuelTransactions,
  };
}

async function getManagerDashboard(dashboardData, agencyName) {
  const availableBuses = await Bus.find({
    agencyName,
    status: "Available",
  });

  const availableDrivers = await Driver.find({
    agencyName,
    status: "Off shift",
  });

  const activeShifts = await Shift.find({
    agencyName,
    endTime: { $exists: false },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayShifts = await Shift.find({
    agencyName,
    Date: today.toISOString().split("T")[0],
  });

  return {
    ...dashboardData,
    resources: {
      availableBuses,
      availableDrivers,
    },
    operations: {
      activeShifts,
      todayShifts,
    },
  };
}

async function getFuelDashboard(dashboardData, agencyName) {
  const recentFuelTransactions = await FuelManagement.find({ agencyName })
    .sort({ fuelDate: -1 })
    .limit(10);

  const buses = await Bus.find({ agencyName });

  const fuelStats = await FuelManagement.aggregate([
    { $match: { agencyName } },
    {
      $group: {
        _id: "$plateNumber",
        totalFuel: { $sum: "$amount" },
        avgFill: { $avg: "$amount" },
        lastFill: { $max: "$fuelDate" },
      },
    },
  ]);

  return {
    ...dashboardData,
    fuelManagement: {
      recentFuelTransactions,
      buses,
      fuelStats,
    },
  };
}
