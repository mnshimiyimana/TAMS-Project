import Shift from "../models/shiftModel.js";

export const createShift = async (req, res) => {
  try {
    const shift = new Shift(req.body);
    await shift.save();
    res.status(201).json(shift);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find();
    res.status(200).json(shifts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getShiftById = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }
    res.status(200).json(shift);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }
    res.status(200).json(shift);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);
    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }
    res.status(200).json({ message: "Shift deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
