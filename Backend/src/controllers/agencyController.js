import Agency from "../models/agencyModel.js";
import { User } from "../models/userModel.js";
import Bus from "../models/busModel.js";
import Driver from "../models/driverModel.js";
import Shift from "../models/shiftModel.js";

// Create a new agency (superadmin only)
export const createAgency = async (req, res) => {
  try {
    // Verify user is superadmin
    const user = await User.findById(req.userId);
    if (!user || user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can create agencies" });
    }

    const { agencyName, location } = req.body;

    // Check if agency already exists
    const existingAgency = await Agency.findOne({ agencyName });
    if (existingAgency) {
      return res
        .status(400)
        .json({ error: "Agency with this name already exists" });
    }

    // Create new agency
    const agency = new Agency({
      agencyName,
      location,
    });

    await agency.save();
    res.status(201).json(agency);
  } catch (error) {
    console.error("Error creating agency:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all agencies (with proper filtering)
export const getAgencies = async (req, res) => {
  try {
    console.log("GetAgencies called with userId:", req.userId);

    // Try to find the user
    const user = await User.findById(req.userId);
    console.log(
      "User lookup result:",
      user ? `Found (role: ${user.role})` : "Not found"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If not superadmin, only return user's agency
    if (user.role !== "superadmin") {
      const agency = await Agency.findOne({ agencyName: user.agencyName });
      return res.status(200).json(agency ? [agency] : []);
    }

    // Superadmin can see all agencies
    const agencies = await Agency.find();
    console.log(`Found ${agencies.length} agencies for superadmin`);
    res.status(200).json(agencies);
  } catch (error) {
    console.error("Error fetching agencies:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get agency by ID (with permission check)
export const getAgencyById = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const agency = await Agency.findById(req.params.id);

    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    // Check permission: superadmin can access any agency, others only their own
    if (user.role !== "superadmin" && agency.agencyName !== user.agencyName) {
      return res.status(403).json({ message: "Access denied to this agency" });
    }

    res.status(200).json(agency);
  } catch (error) {
    console.error("Error fetching agency:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update agency (superadmin or agency admin only)
export const updateAgency = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const agency = await Agency.findById(req.params.id);

    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    // Permission check
    if (
      user.role !== "superadmin" &&
      (user.role !== "admin" || agency.agencyName !== user.agencyName)
    ) {
      return res.status(403).json({
        message: "Only superadmin or agency admin can update agency",
      });
    }

    // Admin can only update location, not agency name
    if (user.role === "admin") {
      const { location } = req.body;
      agency.location = location;
      await agency.save();
      return res.status(200).json(agency);
    }

    // Superadmin can update all fields
    const updatedAgency = await Agency.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedAgency);
  } catch (error) {
    console.error("Error updating agency:", error);
    res.status(400).json({ error: error.message });
  }
};

// Delete agency (superadmin only)
export const deleteAgency = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only superadmin can delete agencies
    if (user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can delete agencies" });
    }

    const agency = await Agency.findById(req.params.id);
    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    // Check if agency has associated users
    const usersExist = await User.exists({ agencyName: agency.agencyName });
    if (usersExist) {
      return res.status(400).json({
        message: "Cannot delete agency with associated users",
      });
    }

    await Agency.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Agency deleted" });
  } catch (error) {
    console.error("Error deleting agency:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get agency stats (admin or superadmin)
export const getAgencyStats = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Determine which agency to get stats for
    const agencyName =
      user.role === "superadmin" && req.query.agencyName
        ? req.query.agencyName
        : user.agencyName;

    // Check access permission
    if (user.role !== "superadmin" && agencyName !== user.agencyName) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Verify agency exists
    const agency = await Agency.findOne({ agencyName });
    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }

    // Get counts from various collections
    const userCounts = await User.aggregate([
      { $match: { agencyName } },
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

    // For superadmin, only return high-level stats
    if (user.role === "superadmin") {
      const totalUsers = userCounts.reduce(
        (sum, roleData) => sum + roleData.count,
        0
      );
      const busCount = await Bus.countDocuments({ agencyName });
      const driverCount = await Driver.countDocuments({ agencyName });
      const shiftCount = await Shift.countDocuments({ agencyName });

      return res.status(200).json({
        agencyName,
        location: agency.location,
        createdAt: agency.createdAt,
        stats: {
          totalUsers,
          roleDistribution: userCounts,
          busCount,
          driverCount,
          shiftCount,
        },
      });
    }

    // For admin, return detailed agency stats
    const totalUsers = userCounts.reduce(
      (sum, roleData) => sum + roleData.count,
      0
    );
    const busCount = await Bus.countDocuments({ agencyName });
    const driverCount = await Driver.countDocuments({ agencyName });
    const activeBuses = await Bus.countDocuments({
      agencyName,
      status: "Available",
    });
    const activeDrivers = await Driver.countDocuments({
      agencyName,
      status: "Off shift",
    });
    const currentShifts = await Shift.countDocuments({
      agencyName,
      endTime: { $exists: false },
    });

    res.status(200).json({
      agencyName,
      location: agency.location,
      users: {
        total: totalUsers,
        byRole: userCounts,
      },
      resources: {
        buses: {
          total: busCount,
          available: activeBuses,
        },
        drivers: {
          total: driverCount,
          available: activeDrivers,
        },
      },
      operations: {
        currentShifts,
      },
    });
  } catch (error) {
    console.error("Error getting agency stats:", error);
    res.status(500).json({ error: error.message });
  }
};
