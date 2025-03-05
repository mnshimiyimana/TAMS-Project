import Shift from "../models/shiftModel.js";
import { sendShiftNotification } from "../config/emailService.js";
import Driver from "../models/driverModel.js";
import Bus from "../models/busModel.js";

export const createShift = async (req, res) => {
  try {
    const shift = new Shift(req.body);
    await shift.save();

    const driver = await Driver.findOne({
      $or: [{ driverId: shift.driverName }, { names: shift.driverName }],
    });

    if (driver && driver.email) {
      const notificationResult = await sendShiftNotification(driver, shift);
      if (!notificationResult.success) {
        console.log(
          `Warning: Failed to send email notification to driver ${driver.names}: ${notificationResult.error}`
        );
      } else {
        console.log(`Shift notification email sent to ${driver.email}`);
      }
    } else {
      console.log(
        `Could not send notification: Driver ${shift.driverName} not found or has no email`
      );
    }

    res.status(201).json(shift);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getShifts = async (req, res) => {
  try {
    let shifts = await Shift.find();

    shifts = shifts.map((shift) => {
      const shiftObj = shift.toObject();

      if (!shiftObj.endTime) {
        delete shiftObj.endTime;
      }

      return shiftObj;
    });

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

    const significantChanges = [
      "startTime",
      "Date",
      "origin",
      "destination",
      "plateNumber",
    ];
    const needsNotification = Object.keys(req.body).some((key) =>
      significantChanges.includes(key)
    );

    if (needsNotification) {
      const driver = await Driver.findOne({
        $or: [{ driverId: shift.driverName }, { names: shift.driverName }],
      });

      if (driver && driver.email) {
        await sendShiftNotification(driver, shift);
        console.log(`Shift update notification sent to ${driver.email}`);
      }
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
