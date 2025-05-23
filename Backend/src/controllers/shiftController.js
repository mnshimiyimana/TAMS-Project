import Shift from "../models/shiftModel.js";
import { sendShiftNotification } from "../config/emailService.js";
import Driver from "../models/driverModel.js";
import Bus from "../models/busModel.js";

export const createShift = async (req, res) => {
  try {
    if (!req.body.agencyName && req.userAgency) {
      req.body.agencyName = req.userAgency;
    }

    const shift = new Shift(req.body);
    await shift.save();

    const driver = await Driver.findOne({
      $or: [{ driverId: shift.driverName }, { names: shift.driverName }],
      agencyName:
        req.userRole === "superadmin" && req.body.agencyName
          ? req.body.agencyName
          : req.userAgency,
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
    const query = {};

    if (req.userRole !== "superadmin") {
      query.agencyName = req.userAgency;
    } else if (req.query.agencyName) {
      query.agencyName = req.query.agencyName;
    }

    if (req.query.date) {
      query.Date = req.query.date;
    }

    if (req.query.driverName) {
      query.driverName = { $regex: req.query.driverName, $options: "i" };
    }

    if (req.query.plateNumber) {
      query.plateNumber = { $regex: req.query.plateNumber, $options: "i" };
    }

    if (req.query.status === "active") {
      query.endTime = { $exists: false };
    } else if (req.query.status === "completed") {
      query.endTime = { $exists: true };
    }

    if (req.query.fined === "true") {
      query.fined = true;
    } else if (req.query.fined === "false") {
      query.fined = false;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const totalShifts = await Shift.countDocuments(query);

    let shifts = await Shift.find(query)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit);

    shifts = shifts.map((shift) => {
      const shiftObj = shift.toObject();

      if (!shiftObj.endTime) {
        delete shiftObj.endTime;
      }

      return shiftObj;
    });

    res.status(200).json({
      shifts,
      totalShifts,
      totalPages: Math.ceil(totalShifts / limit),
      currentPage: page,
    });
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

    if (req.userRole !== "superadmin" && shift.agencyName !== req.userAgency) {
      return res.status(403).json({
        message: "Not authorized to access shifts from other agencies",
      });
    }

    res.status(200).json(shift);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateShift = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);

    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }

    if (req.userRole !== "superadmin" && shift.agencyName !== req.userAgency) {
      return res.status(403).json({
        message: "Not authorized to update shifts from other agencies",
      });
    }

    if (
      req.userRole !== "superadmin" &&
      req.body.agencyName &&
      req.body.agencyName !== req.userAgency
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to change shift's agency" });
    }

    if (req.body.hasOwnProperty("fined")) {
      if (req.body.fined === false) {
        req.body.fineAmount = 0;
        req.body.fineReason = "";
      } else if (
        req.body.fined === true &&
        (!req.body.fineAmount || !req.body.fineReason)
      ) {
        return res.status(400).json({
          message:
            "Fine amount and reason are required when marking a shift as fined",
        });
      }
    }

    const isCompletingShift = !shift.endTime && req.body.endTime;

    if (isCompletingShift) {
      console.log(
        `Shift ${shift._id} is being completed. Updating resources...`
      );

      try {
        const vehicle = await Bus.findOne({
          plateNumber: shift.plateNumber,
          agencyName: shift.agencyName,
        });

        if (vehicle) {
          console.log(
            `Updating vehicle ${vehicle._id} (${vehicle.plateNumber}) status to Available`
          );
          vehicle.status = "Available";
          await vehicle.save();
        } else {
          console.log(
            `Vehicle with plate number ${shift.plateNumber} not found`
          );
        }

        const driver = await Driver.findOne({
          $or: [{ driverId: shift.driverName }, { names: shift.driverName }],
          agencyName: shift.agencyName,
        });

        if (driver && driver.status !== "On leave") {
          console.log(
            `Updating driver ${driver._id} (${driver.names}) status to Off shift`
          );
          driver.status = "Off shift";
          driver.lastShift = new Date().toISOString();
          await driver.save();
        } else {
          console.log(`Driver ${shift.driverName} not found or is on leave`);
        }
      } catch (resourceError) {
        console.error(
          "Error updating resources during shift completion:",
          resourceError
        );
      }
    }

    if (req.body.actualEndTime && !shift.actualEndTime) {
      console.log(
        `Recording actual end time for shift ${shift._id}. Ensuring resources are released...`
      );

      try {
        const vehicle = await Bus.findOne({
          plateNumber: shift.plateNumber,
          agencyName: shift.agencyName,
        });

        if (vehicle && vehicle.status === "Assigned") {
          console.log(
            `Updating vehicle ${vehicle._id} (${vehicle.plateNumber}) status to Available`
          );
          vehicle.status = "Available";
          await vehicle.save();
        }

        const driver = await Driver.findOne({
          $or: [{ driverId: shift.driverName }, { names: shift.driverName }],
          agencyName: shift.agencyName,
        });

        if (driver && driver.status === "On Shift") {
          console.log(
            `Updating driver ${driver._id} (${driver.names}) status to Off shift`
          );
          driver.status = "Off shift";
          driver.lastShift = new Date().toISOString();
          await driver.save();
        }
      } catch (resourceError) {
        console.error(
          "Error updating resources during actual end time recording:",
          resourceError
        );
      }
    }

    const updatedShift = await Shift.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

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
        $or: [
          { driverId: updatedShift.driverName },
          { names: updatedShift.driverName },
        ],
        agencyName: updatedShift.agencyName,
      });

      if (driver && driver.email) {
        await sendShiftNotification(driver, updatedShift);
        console.log(`Shift update notification sent to ${driver.email}`);
      }
    }

    if (req.body.fined === true && !shift.fined) {
      const driver = await Driver.findOne({
        $or: [
          { driverId: updatedShift.driverName },
          { names: updatedShift.driverName },
        ],
        agencyName: updatedShift.agencyName,
      });

      if (driver && driver.email) {
        console.log(`Fine notification should be sent to ${driver.email}`);
      }
    }

    res.status(200).json(updatedShift);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);

    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }

    if (req.userRole !== "superadmin" && shift.agencyName !== req.userAgency) {
      return res.status(403).json({
        message: "Not authorized to delete shifts from other agencies",
      });
    }

    await Shift.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Shift deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
