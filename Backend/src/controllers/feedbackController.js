import Feedback from "../models/feedbackModel.js";
import { User } from "../models/userModel.js";

export const submitFeedback = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { type, message } = req.body;

    if (!type || !message) {
      return res.status(400).json({ message: "Type and message are required" });
    }

    const newFeedback = new Feedback({
      userId,
      userName: user.username,
      userRole: user.role,
      agencyName: user.role !== "superadmin" ? user.agencyName : undefined,
      type,
      message,
    });

    await newFeedback.save();

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedbackId: newFeedback._id,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserFeedback = async (req, res) => {
  try {
    const userId = req.userId;

    const feedback = await Feedback.find({ userId })
      .sort({ createdAt: -1 })
      .select("-__v");

    res.status(200).json(feedback);
  } catch (error) {
    console.error("Error fetching user feedback:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllFeedback = async (req, res) => {
  try {
    const { userRole, agencyName } = req.query;
    const user = await User.findById(req.userId);

    if (user.role !== "superadmin" && !agencyName) {
      return res.status(403).json({
        message: "Access denied. Agency name required for non-superadmin users",
      });
    }

    const query = {};

    if (user.role === "admin") {
      query.agencyName = user.agencyName;
    } else if (agencyName) {
      query.agencyName = agencyName;
    }

    if (userRole) {
      query.userRole = userRole;
    }

    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .select("-__v");

    res.status(200).json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin" && user.role !== "superadmin") {
      return res.status(403).json({
        message: "Access denied. Only admins can update feedback status",
      });
    }

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    if (user.role === "admin" && feedback.agencyName !== user.agencyName) {
      return res.status(403).json({
        message: "Access denied. Cannot update feedback from other agencies",
      });
    }

    // Update fields
    if (status) {
      feedback.status = status;

      // If resolving, set resolved date
      if (status === "resolved" || status === "closed") {
        feedback.resolvedAt = new Date();
      }
    }

    if (response) {
      feedback.response = response;
      feedback.respondedBy = userId;
    }

    await feedback.save();

    res.status(200).json({
      message: "Feedback updated successfully",
      feedback,
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFeedbackStats = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (user.role !== "superadmin" && user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Only admins can view feedback statistics",
      });
    }

    const query = {};

    if (user.role === "admin") {
      query.agencyName = user.agencyName;
    }

    const statusStats = await Feedback.aggregate([
      { $match: query },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } },
    ]);

    const typeStats = await Feedback.aggregate([
      { $match: query },
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $project: { type: "$_id", count: 1, _id: 0 } },
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentStats = await Feedback.aggregate([
      {
        $match: {
          ...query,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", count: 1, _id: 0 } },
    ]);

    res.status(200).json({
      byStatus: statusStats,
      byType: typeStats,
      recent: recentStats,
      total: await Feedback.countDocuments(query),
    });
  } catch (error) {
    console.error("Error getting feedback stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
