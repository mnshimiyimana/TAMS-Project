import Bus from "../models/busModel.js";

export const createBus = async (req, res) => {
  try {
    if (!req.body.agencyName && req.userAgency) {
      req.body.agencyName = req.userAgency;
    }

    const bus = new Bus(req.body);
    await bus.save();
    res.status(201).json(bus);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getBuses = async (req, res) => {
  try {
    const query = {};

    if (req.userRole !== "superadmin") {
      query.agencyName = req.userAgency;
    } else if (req.query.agencyName) {
      query.agencyName = req.query.agencyName;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.type) {
      query.type = req.query.type;
    }

    if (req.query.search) {
      const search = req.query.search;
      query.$or = [
        { busId: { $regex: search, $options: "i" } },
        { plateNumber: { $regex: search, $options: "i" } },
      ];
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const totalBuses = await Bus.countDocuments(query);

    const buses = await Bus.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      buses,
      totalBuses,
      totalPages: Math.ceil(totalBuses / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    if (req.userRole !== "superadmin" && bus.agencyName !== req.userAgency) {
      return res
        .status(403)
        .json({
          message: "Not authorized to access buses from other agencies",
        });
    }

    res.status(200).json(bus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    if (req.userRole !== "superadmin" && bus.agencyName !== req.userAgency) {
      return res
        .status(403)
        .json({
          message: "Not authorized to update buses from other agencies",
        });
    }

    if (
      req.userRole !== "superadmin" &&
      req.body.agencyName &&
      req.body.agencyName !== req.userAgency
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to change bus's agency" });
    }

    const updatedBus = await Bus.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json(updatedBus);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    if (req.userRole !== "superadmin" && bus.agencyName !== req.userAgency) {
      return res
        .status(403)
        .json({
          message: "Not authorized to delete buses from other agencies",
        });
    }

    await Bus.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Bus deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
