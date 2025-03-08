import FuelManagement from "../models/fuelManagementModel.js";
import Bus from "../models/busModel.js";

export const createFuelTransaction = async (req, res) => {
  try {
    // Apply agency isolation - add agency from authenticated user if not provided
    if (!req.body.agencyName && req.userAgency) {
      req.body.agencyName = req.userAgency;
    }

    // Verify that the bus belongs to the user's agency
    const { plateNumber } = req.body;

    if (plateNumber) {
      const bus = await Bus.findOne({ plateNumber });

      if (
        bus &&
        req.userRole !== "superadmin" &&
        bus.agencyName !== req.userAgency
      ) {
        return res.status(403).json({
          message:
            "Not authorized to add fuel transactions for buses from other agencies",
        });
      }
    }

    const fuelTransaction = new FuelManagement(req.body);
    await fuelTransaction.save();
    res.status(201).json(fuelTransaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getFuelTransactions = async (req, res) => {
  try {
    // Build query with agency isolation
    const query = {};

    // Apply agency isolation
    if (req.userRole !== "superadmin") {
      query.agencyName = req.userAgency;
    } else if (req.query.agencyName) {
      query.agencyName = req.query.agencyName;
    }

    // Add date range filter if provided
    if (req.query.startDate || req.query.endDate) {
      query.fuelDate = {};

      if (req.query.startDate) {
        query.fuelDate.$gte = new Date(req.query.startDate);
      }

      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        query.fuelDate.$lte = endDate;
      }
    }

    // Filter by plate number if provided
    if (req.query.plateNumber) {
      query.plateNumber = { $regex: req.query.plateNumber, $options: "i" };
    }

    // Filter by driver if provided
    if (req.query.driverName) {
      query.driverName = { $regex: req.query.driverName, $options: "i" };
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get total count
    const totalTransactions = await FuelManagement.countDocuments(query);

    // Get fuel transactions with pagination
    const fuelTransactions = await FuelManagement.find(query)
      .sort({ fuelDate: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      fuelTransactions,
      totalTransactions,
      totalPages: Math.ceil(totalTransactions / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFuelTransactionById = async (req, res) => {
  try {
    const fuelTransaction = await FuelManagement.findById(req.params.id);

    if (!fuelTransaction) {
      return res.status(404).json({ message: "Fuel transaction not found" });
    }

    // Apply agency isolation
    if (
      req.userRole !== "superadmin" &&
      fuelTransaction.agencyName !== req.userAgency
    ) {
      return res.status(403).json({
        message:
          "Not authorized to access fuel transactions from other agencies",
      });
    }

    res.status(200).json(fuelTransaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateFuelTransaction = async (req, res) => {
  try {
    const fuelTransaction = await FuelManagement.findById(req.params.id);

    if (!fuelTransaction) {
      return res.status(404).json({ message: "Fuel transaction not found" });
    }

    // Apply agency isolation
    if (
      req.userRole !== "superadmin" &&
      fuelTransaction.agencyName !== req.userAgency
    ) {
      return res.status(403).json({
        message:
          "Not authorized to update fuel transactions from other agencies",
      });
    }

    // Prevent changing agency for non-superadmins
    if (
      req.userRole !== "superadmin" &&
      req.body.agencyName &&
      req.body.agencyName !== req.userAgency
    ) {
      return res.status(403).json({
        message: "Not authorized to change fuel transaction's agency",
      });
    }

    // If changing plate number, verify bus agency
    if (
      req.body.plateNumber &&
      req.body.plateNumber !== fuelTransaction.plateNumber
    ) {
      const bus = await Bus.findOne({ plateNumber: req.body.plateNumber });

      if (
        bus &&
        req.userRole !== "superadmin" &&
        bus.agencyName !== req.userAgency
      ) {
        return res.status(403).json({
          message:
            "Not authorized to assign fuel transactions to buses from other agencies",
        });
      }
    }

    const updatedTransaction = await FuelManagement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedTransaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteFuelTransaction = async (req, res) => {
  try {
    const fuelTransaction = await FuelManagement.findById(req.params.id);

    if (!fuelTransaction) {
      return res.status(404).json({ message: "Fuel transaction not found" });
    }

    // Apply agency isolation
    if (
      req.userRole !== "superadmin" &&
      fuelTransaction.agencyName !== req.userAgency
    ) {
      return res.status(403).json({
        message:
          "Not authorized to delete fuel transactions from other agencies",
      });
    }

    await FuelManagement.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Fuel transaction deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Additional utility endpoints for fuel management

export const getFuelStatsByBus = async (req, res) => {
  try {
    // Build query with agency isolation
    const query = {};

    // Apply agency isolation
    if (req.userRole !== "superadmin") {
      query.agencyName = req.userAgency;
    } else if (req.query.agencyName) {
      query.agencyName = req.query.agencyName;
    }

    // Add date range filter if provided
    if (req.query.startDate || req.query.endDate) {
      query.fuelDate = {};

      if (req.query.startDate) {
        query.fuelDate.$gte = new Date(req.query.startDate);
      }

      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        query.fuelDate.$lte = endDate;
      }
    }

    // Aggregate fuel stats by bus
    const fuelStats = await FuelManagement.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$plateNumber",
          totalAmount: { $sum: "$amount" },
          totalCost: { $sum: "$amountPrice" },
          count: { $sum: 1 },
          lastFill: { $max: "$fuelDate" },
        },
      },
      {
        $project: {
          plateNumber: "$_id",
          _id: 0,
          totalAmount: 1,
          totalCost: 1,
          averageCost: { $divide: ["$totalCost", "$totalAmount"] },
          fillCount: "$count",
          lastFill: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    res.status(200).json(fuelStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFuelConsumptionTrends = async (req, res) => {
  try {
    // Build query with agency isolation
    const query = {};

    // Apply agency isolation
    if (req.userRole !== "superadmin") {
      query.agencyName = req.userAgency;
    } else if (req.query.agencyName) {
      query.agencyName = req.query.agencyName;
    }

    // Add date range filter if provided
    if (req.query.startDate || req.query.endDate) {
      query.fuelDate = {};

      if (req.query.startDate) {
        query.fuelDate.$gte = new Date(req.query.startDate);
      }

      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        query.fuelDate.$lte = endDate;
      }
    }

    // Filter by plate number if provided
    if (req.query.plateNumber) {
      query.plateNumber = req.query.plateNumber;
    }

    // Aggregate monthly fuel consumption trends
    const monthlyTrends = await FuelManagement.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: "$fuelDate" },
            month: { $month: "$fuelDate" },
            plateNumber: "$plateNumber",
          },
          totalAmount: { $sum: "$amount" },
          totalCost: { $sum: "$amountPrice" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          plateNumber: "$_id.plateNumber",
          year: "$_id.year",
          month: "$_id.month",
          period: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" },
                ],
              },
            ],
          },
          totalAmount: 1,
          totalCost: 1,
          fillCount: "$count",
          averageCost: { $divide: ["$totalCost", "$totalAmount"] },
        },
      },
      { $sort: { plateNumber: 1, year: 1, month: 1 } },
    ]);

    res.status(200).json(monthlyTrends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
