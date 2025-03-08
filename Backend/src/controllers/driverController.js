import Driver from "../models/driverModel.js";

export const createDriver = async (req, res) => {
  try {
    // Apply agency isolation - add agency from authenticated user if not provided
    if (!req.body.agencyName && req.userAgency) {
      req.body.agencyName = req.userAgency;
    }

    const driver = new Driver(req.body);
    await driver.save();
    res.status(201).json(driver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getDrivers = async (req, res) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Get search and status filters from query
    const search = req.query.search || "";
    const status = req.query.status || "";

    // Build query object
    let query = {};

    // Apply agency isolation
    if (req.userRole !== "superadmin") {
      query.agencyName = req.userAgency;
    } else if (req.query.agencyName) {
      query.agencyName = req.query.agencyName;
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { driverId: { $regex: search, $options: "i" } },
        { names: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Get total count of drivers matching the query
    const totalDrivers = await Driver.countDocuments(query);

    // Calculate total pages
    const totalPages = Math.ceil(totalDrivers / limit);

    // Get drivers with pagination
    const drivers = await Driver.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Send response with pagination metadata
    res.status(200).json({
      drivers,
      totalDrivers,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Apply agency isolation
    if (req.userRole !== "superadmin" && driver.agencyName !== req.userAgency) {
      return res
        .status(403)
        .json({
          message: "Not authorized to access drivers from other agencies",
        });
    }

    res.status(200).json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Apply agency isolation
    if (req.userRole !== "superadmin" && driver.agencyName !== req.userAgency) {
      return res
        .status(403)
        .json({
          message: "Not authorized to update drivers from other agencies",
        });
    }

    // Prevent changing agency for non-superadmins
    if (
      req.userRole !== "superadmin" &&
      req.body.agencyName &&
      req.body.agencyName !== req.userAgency
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to change driver's agency" });
    }

    const updatedDriver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    res.status(200).json(updatedDriver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Apply agency isolation
    if (req.userRole !== "superadmin" && driver.agencyName !== req.userAgency) {
      return res
        .status(403)
        .json({
          message: "Not authorized to delete drivers from other agencies",
        });
    }

    await Driver.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Driver deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
