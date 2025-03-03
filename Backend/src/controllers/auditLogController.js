import AuditLog from "../models/auditLogModel.js";
import { User } from "../models/userModel.js";
import Agency from "../models/agencyModel.js";

export const getAuditLogs = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can access audit logs" });
    }

    const {
      limit = 100,
      page = 1,
      agencyName,
      action,
      resourceType,
      userId,
      username,
      userRole,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    if (agencyName) {
      query.agencyName = agencyName;
    }

    if (action) {
      query.action = action;
    }

    if (resourceType) {
      query.resourceType = resourceType;
    }

    if (userId) {
      query.userId = userId;
    }

    if (username) {
      query.username = { $regex: username, $options: "i" };
    }

    if (userRole) {
      query.userRole = userRole;
    }

    if (startDate || endDate) {
      query.createdAt = {};

      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDateObj;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const sortDirection = sortOrder.toLowerCase() === "asc" ? 1 : -1;

    const total = await AuditLog.countDocuments(query);

    const logs = await AuditLog.find(query)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-metadata.responseData -metadata.requestBody");

    res.status(200).json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAuditLogDetails = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can access audit log details" });
    }

    const logId = req.params.id;

    const log = await AuditLog.findById(logId);

    if (!log) {
      return res.status(404).json({ message: "Audit log not found" });
    }

    res.status(200).json(log);
  } catch (error) {
    console.error("Error fetching audit log details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAuditLogStats = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can access audit log statistics" });
    }

    const { startDate, endDate, agencyName } = req.query;

    const query = {};

    if (agencyName) {
      query.agencyName = agencyName;
    }

    if (startDate || endDate) {
      query.createdAt = {};

      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDateObj;
      }
    }

    const actionStats = await AuditLog.aggregate([
      { $match: query },
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $project: { action: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    const resourceStats = await AuditLog.aggregate([
      { $match: query },
      { $group: { _id: "$resourceType", count: { $sum: 1 } } },
      { $project: { resourceType: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    const roleStats = await AuditLog.aggregate([
      { $match: query },
      { $group: { _id: "$userRole", count: { $sum: 1 } } },
      { $project: { role: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    let agencyStats = [];
    if (!agencyName) {
      agencyStats = await AuditLog.aggregate([
        { $match: { agencyName: { $exists: true, $ne: null } } },
        { $group: { _id: "$agencyName", count: { $sum: 1 } } },
        { $project: { agency: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);
    }

    const timeQuery = { ...query };
    if (!timeQuery.createdAt) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      timeQuery.createdAt = { $gte: thirtyDaysAgo };
    }

    const activityTimeline = await AuditLog.aggregate([
      { $match: timeQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $project: { date: "$_id", count: 1, _id: 0 } },
      { $sort: { date: 1 } },
    ]);

    res.status(200).json({
      totalLogs: await AuditLog.countDocuments(query),
      byAction: actionStats,
      byResource: resourceStats,
      byRole: roleStats,
      byAgency: agencyStats,
      timeline: activityTimeline,
    });
  } catch (error) {
    console.error("Error fetching audit log statistics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const exportAuditLogs = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only superadmin can export audit logs" });
    }

    const {
      limit = 1000,
      page = 1,
      agencyName,
      action,
      resourceType,
      userId,
      username,
      userRole,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    if (agencyName) query.agencyName = agencyName;
    if (action) query.action = action;
    if (resourceType) query.resourceType = resourceType;
    if (userId) query.userId = userId;
    if (username) query.username = { $regex: username, $options: "i" };
    if (userRole) query.userRole = userRole;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDateObj;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select(
        "username userRole agencyName action resourceType description createdAt ipAddress"
      );

    const exportLog = await new AuditLog({
      userId: user._id,
      username: user.username,
      userRole: user.role,
      action: "export_data",
      resourceType: "audit_log",
      description: `Exported ${logs.length} audit logs with filters`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      metadata: { exportFilters: req.query },
    }).save();

    res.status(200).json({
      message: `${logs.length} audit logs exported successfully`,
      logs,
      exportId: exportLog._id,
    });
  } catch (error) {
    console.error("Error exporting audit logs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
