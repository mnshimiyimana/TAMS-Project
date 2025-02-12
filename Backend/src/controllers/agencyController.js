import Agency from "../models/agencyModel.js";

// Create a new agency
export const createAgency = async (req, res) => {
  try {
    const agency = new Agency(req.body);
    await agency.save();
    res.status(201).json(agency);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all agencies
export const getAgencies = async (req, res) => {
  try {
    const agencies = await Agency.find();
    res.status(200).json(agencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get agency by ID
export const getAgencyById = async (req, res) => {
  try {
    const agency = await Agency.findById(req.params.id);
    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }
    res.status(200).json(agency);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update agency by ID
export const updateAgency = async (req, res) => {
  try {
    const agency = await Agency.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }
    res.status(200).json(agency);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete agency by ID
export const deleteAgency = async (req, res) => {
  try {
    const agency = await Agency.findByIdAndDelete(req.params.id);
    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }
    res.status(200).json({ message: "Agency deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
