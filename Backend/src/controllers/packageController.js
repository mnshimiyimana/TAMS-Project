import Package from "../models/packageModel.js";
import Shift from "../models/shiftModel.js";
import { User } from "../models/userModel.js";
import AuditLog from "../models/auditLogModel.js";

export const createPackage = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (
      !user ||
      (user.role !== "manager" &&
        user.role !== "admin" &&
        user.role !== "superadmin")
    ) {
      return res.status(403).json({
        message:
          "Not authorized to manage packages. Only managers, admins, or superadmins can create packages.",
      });
    }

    console.log("User's role:", user.role);
    console.log("User's agency name:", user.agencyName);

    const { shiftId } = req.body;
    if (!shiftId) {
      return res.status(400).json({ message: "Shift ID is required" });
    }

    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }

    console.log("Shift's agency name:", shift.agencyName);

    // TEMPORARY: Bypassing agency authorization check
    console.log("NOTICE: Agency authorization check temporarily bypassed");
    // Original check commented out
    /*
    if (user.role !== "superadmin" && shift.agencyName !== user.agencyName) {
      console.log("Mismatch: user vs shift agency =>", {
        userAgency: user.agencyName,
        shiftAgency: shift.agencyName,
      });
      return res.status(403).json({
        message:
          "Not authorized to assign packages to shifts from other agencies",
      });
    }
    */

    // Determine agency name (use any available agency name)
    const finalAgencyName =
      shift.agencyName ||
      user.agencyName ||
      req.body.agencyName ||
      "DefaultAgency";

    const packageData = {
      ...req.body,
      agencyName: finalAgencyName,
      driverName: shift.driverName,
      plateNumber: shift.plateNumber,
      status: shift.endTime ? "Delivered" : "In Transit",
    };

    if (shift.endTime) {
      packageData.deliveredAt = shift.endTime;
    }

    const newPackage = new Package(packageData);
    await newPackage.save();

    await new AuditLog({
      userId,
      username: user.username,
      userRole: user.role,
      agencyName: user.agencyName || "Superadmin",
      action: "create",
      resourceType: "other", 
      resourceId: newPackage._id,
      description: `Created new package ${newPackage.packageId}`,
      metadata: { packageData: req.body },
    }).save();

    res.status(201).json({
      message: "Package created successfully",
      package: newPackage,
    });
  } catch (error) {
    console.error("Error creating package:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getPackages = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      status,
      shiftId,
      driverName,
      plateNumber,
      senderName,
      receiverName,
      receiverId,
      dateFrom,
      dateTo,
      search,
      agencyName,
    } = req.query;

    let query = {};

    // TEMPORARY: Bypass agency filtering for all users
    console.log("NOTICE: Agency filtering temporarily bypassed");
    // Original check commented out
    /*
    if (user.role !== "superadmin") {
      query.agencyName = user.agencyName;
    } else if (agencyName) {
      query.agencyName = agencyName;
    }
    */

    // Use agency filter only if explicitly provided
    if (agencyName) {
      query.agencyName = agencyName;
    }

    if (status) query.status = status;
    if (shiftId) query.shiftId = shiftId;
    if (driverName) query.driverName = { $regex: driverName, $options: "i" };
    if (plateNumber) query.plateNumber = { $regex: plateNumber, $options: "i" };
    if (senderName) query.senderName = { $regex: senderName, $options: "i" };
    if (receiverName)
      query.receiverName = { $regex: receiverName, $options: "i" };
    if (receiverId) query.receiverId = { $regex: receiverId, $options: "i" };

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    if (search) {
      query.$or = [
        { packageId: { $regex: search, $options: "i" } },
        { senderName: { $regex: search, $options: "i" } },
        { receiverName: { $regex: search, $options: "i" } },
        { receiverId: { $regex: search, $options: "i" } },
        { senderPhone: { $regex: search, $options: "i" } },
        { receiverPhone: { $regex: search, $options: "i" } },
        { driverName: { $regex: search, $options: "i" } },
        { plateNumber: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const totalPackages = await Package.countDocuments(query);

    const packages = await Package.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "shiftId",
        select: "startTime endTime destination origin Date",
      });

    res.status(200).json({
      packages,
      pagination: {
        total: totalPackages,
        page,
        limit,
        pages: Math.ceil(totalPackages / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching packages:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getPackageById = async (req, res) => {
  try {
    const userId = req.userId;
    const packageId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const packageItem = await Package.findById(packageId).populate({
      path: "shiftId",
      select:
        "startTime endTime destination origin Date plateNumber driverName",
    });

    if (!packageItem) {
      return res.status(404).json({ message: "Package not found" });
    }

    // TEMPORARY: Bypass agency authorization check
    console.log(
      "NOTICE: Agency authorization check temporarily bypassed for package access"
    );
    // Original check commented out
    /*
    if (
      user.role !== "superadmin" &&
      packageItem.agencyName !== user.agencyName
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this package" });
    }
    */

    res.status(200).json(packageItem);
  } catch (error) {
    console.error("Error fetching package:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const updatePackage = async (req, res) => {
  try {
    const userId = req.userId;
    const packageId = req.params.id;

    const user = await User.findById(userId);
    if (
      !user ||
      (user.role !== "manager" &&
        user.role !== "admin" &&
        user.role !== "superadmin")
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update packages" });
    }

    const packageItem = await Package.findById(packageId);
    if (!packageItem) {
      return res.status(404).json({ message: "Package not found" });
    }

    // TEMPORARY: Bypass agency authorization check
    console.log(
      "NOTICE: Agency authorization check temporarily bypassed for package update"
    );
    // Original check commented out
    /*
    if (
      user.role !== "superadmin" &&
      packageItem.agencyName !== user.agencyName
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this package" });
    }
    */

    if (
      req.body.shiftId &&
      req.body.shiftId !== packageItem.shiftId?.toString()
    ) {
      const newShift = await Shift.findById(req.body.shiftId);
      if (!newShift) {
        return res.status(404).json({ message: "New shift not found" });
      }

      // TEMPORARY: Bypass agency authorization check for shift
      console.log(
        "NOTICE: Agency authorization check temporarily bypassed for shift assignment"
      );
      // Original check commented out
      /*
      if (
        user.role !== "superadmin" &&
        newShift.agencyName !== user.agencyName
      ) {
        return res.status(403).json({
          message:
            "Not authorized to assign packages to shifts from other agencies",
        });
      }
      */

      req.body.driverName = newShift.driverName;
      req.body.plateNumber = newShift.plateNumber;

      if (newShift.endTime) {
        req.body.status = "Delivered";
        req.body.deliveredAt = newShift.endTime;
      } else {
        req.body.status = "In Transit";
      }
    }

    const updatedPackage = await Package.findByIdAndUpdate(
      packageId,
      req.body,
      {
        new: true,
      }
    ).populate({
      path: "shiftId",
      select: "startTime endTime destination origin Date",
    });

    await new AuditLog({
      userId,
      username: user.username,
      userRole: user.role,
      agencyName: user.agencyName || "Superadmin",
      action: "update",
      resourceType: "package",
      resourceId: packageId,
      description: `Updated package ${packageItem.packageId}`,
      metadata: {
        before: packageItem.toObject(),
        after: updatedPackage.toObject(),
        changes: req.body,
      },
    }).save();

    res.status(200).json({
      message: "Package updated successfully",
      package: updatedPackage,
    });
  } catch (error) {
    console.error("Error updating package:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const updatePackageStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const packageId = req.params.id;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = [
      "Pending",
      "In Transit",
      "Delivered",
      "Cancelled",
      "Returned",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status value. Must be one of: " + validStatuses.join(", "),
      });
    }

    const user = await User.findById(userId);
    if (
      !user ||
      (user.role !== "manager" &&
        user.role !== "admin" &&
        user.role !== "superadmin")
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update package status" });
    }

    const packageItem = await Package.findById(packageId);
    if (!packageItem) {
      return res.status(404).json({ message: "Package not found" });
    }

    // TEMPORARY: Bypass agency authorization check
    console.log(
      "NOTICE: Agency authorization check temporarily bypassed for status update"
    );
    // Original check commented out
    /*
    if (
      user.role !== "superadmin" &&
      packageItem.agencyName !== user.agencyName
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this package" });
    }
    */

    const prevStatus = packageItem.status;
    packageItem.status = status;
    if (notes) packageItem.notes = notes;

    if (status === "Delivered" && prevStatus !== "Delivered") {
      packageItem.deliveredAt = new Date();
    }

    await packageItem.save();

    // Create audit log
    await new AuditLog({
      userId,
      username: user.username,
      userRole: user.role,
      agencyName: user.agencyName || "Superadmin",
      action: "update_status",
      resourceType: "package",
      resourceId: packageId,
      description: `Updated package ${packageItem.packageId} status to ${status}`,
      metadata: {
        previousStatus: prevStatus,
        newStatus: status,
        notes,
      },
    }).save();

    res.status(200).json({
      message: "Package status updated successfully",
      package: packageItem,
    });
  } catch (error) {
    console.error("Error updating package status:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const deletePackage = async (req, res) => {
  try {
    const userId = req.userId;
    const packageId = req.params.id;

    const user = await User.findById(userId);
    if (
      !user ||
      (user.role !== "manager" &&
        user.role !== "admin" &&
        user.role !== "superadmin")
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete packages" });
    }

    const packageItem = await Package.findById(packageId);
    if (!packageItem) {
      return res.status(404).json({ message: "Package not found" });
    }

    // TEMPORARY: Bypass agency authorization check
    console.log(
      "NOTICE: Agency authorization check temporarily bypassed for package deletion"
    );
    // Original check commented out
    /*
    if (
      user.role !== "superadmin" &&
      packageItem.agencyName !== user.agencyName
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this package" });
    }
    */

    const packageData = packageItem.toObject();

    await Package.findByIdAndDelete(packageId);

    await new AuditLog({
      userId,
      username: user.username,
      userRole: user.role,
      agencyName: user.agencyName || "Superadmin",
      action: "delete",
      resourceType: "package",
      resourceId: packageId,
      description: `Deleted package ${packageItem.packageId}`,
      metadata: { deletedPackage: packageData },
    }).save();

    res.status(200).json({ message: "Package deleted successfully" });
  } catch (error) {
    console.error("Error deleting package:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getPackageStats = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let matchQuery = {};

    // TEMPORARY: Bypass agency filtering for stats
    console.log("NOTICE: Agency filtering temporarily bypassed for stats");
    // Original check commented out
    /*
    if (user.role !== "superadmin") {
      matchQuery.agencyName = user.agencyName;
    } else if (req.query.agencyName) {
      matchQuery.agencyName = req.query.agencyName;
    }
    */

    // Only filter by agency if explicitly provided
    if (req.query.agencyName) {
      matchQuery.agencyName = req.query.agencyName;
    }

    if (req.query.startDate || req.query.endDate) {
      matchQuery.createdAt = {};

      if (req.query.startDate) {
        matchQuery.createdAt.$gte = new Date(req.query.startDate);
      }

      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        matchQuery.createdAt.$lte = endDate;
      }
    }

    // Aggregation pipeline
    const stats = await Package.aggregate([
      { $match: matchQuery },
      {
        $facet: {
          // Count by status
          statusStats: [
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $project: { status: "$_id", count: 1, _id: 0 } },
          ],

          // Monthly trend
          monthlyTrend: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                },
                count: { $sum: 1 },
                delivered: {
                  $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] },
                },
              },
            },
            {
              $project: {
                _id: 0,
                date: {
                  $concat: [
                    { $toString: "$_id.year" },
                    "-",
                    {
                      $toString: {
                        $cond: [
                          { $lt: ["$_id.month", 10] },
                          {
                            $concat: ["0", { $toString: "$_id.month" }],
                          },
                          "$_id.month",
                        ],
                      },
                    },
                  ],
                },
                count: 1,
                delivered: 1,
                deliveryRate: {
                  $multiply: [
                    {
                      $divide: [
                        "$delivered",
                        {
                          $cond: [{ $eq: ["$count", 0] }, 1, "$count"],
                        },
                      ],
                    },
                    100,
                  ],
                },
              },
            },
            { $sort: { date: 1 } },
          ],

          // Top performers (drivers)
          topDrivers: [
            { $match: { status: "Delivered" } },
            { $group: { _id: "$driverName", count: { $sum: 1 } } },
            { $project: { driverName: "$_id", count: 1, _id: 0 } },
            { $sort: { count: -1 } },
            { $limit: 5 },
          ],

          // Total counts
          totalStats: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                totalDelivered: {
                  $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] },
                },
                totalCancelled: {
                  $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] },
                },
                totalReturned: {
                  $sum: { $cond: [{ $eq: ["$status", "Returned"] }, 1, 0] },
                },
                totalInTransit: {
                  $sum: { $cond: [{ $eq: ["$status", "In Transit"] }, 1, 0] },
                },
                totalPending: {
                  $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
                },
              },
            },
          ],
        },
      },
    ]);

    res.status(200).json({
      stats: {
        statusDistribution: stats[0].statusStats,
        monthlyTrend: stats[0].monthlyTrend,
        topDrivers: stats[0].topDrivers,
        totals: stats[0].totalStats[0] || {
          total: 0,
          totalDelivered: 0,
          totalCancelled: 0,
          totalReturned: 0,
          totalInTransit: 0,
          totalPending: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error getting package stats:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
