import Driver from "../models/driverModel.js";

export const createDriver = async (req, res) => {
  try {
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const status = req.query.status || "";

    let query = {};

    if (req.userRole !== "superadmin") {
      query.agencyName = req.userAgency;
    } else if (req.query.agencyName) {
      query.agencyName = req.query.agencyName;
    }

    if (search) {
      query.$or = [
        { driverId: { $regex: search, $options: "i" } },
        { names: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const totalDrivers = await Driver.countDocuments(query);

    const totalPages = Math.ceil(totalDrivers / limit);

    const drivers = await Driver.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

    if (req.userRole !== "superadmin" && driver.agencyName !== req.userAgency) {
      return res
        .status(403)
        .json({
          message: "Not authorized to update drivers from other agencies",
        });
    }

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
