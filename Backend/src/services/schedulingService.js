import schedule from "node-schedule";
import { sendShiftNotification } from "../config/emailService.js";
import Driver from "../models/driverModel.js";
import Shift from "../models/shiftModel.js";

export const scheduleShiftReminders = () => {
  console.log("Setting up daily shift reminder schedule");

  schedule.scheduleJob("0 0 * * *", async () => {
    console.log("Running scheduled shift reminders");

    try {
      const tomorrow = new Date();
      tomorrow.setHours(tomorrow.getHours() + 24);

      const today = new Date();

      const upcomingShifts = await Shift.find({
        startTime: { $gte: today, $lte: tomorrow },

        endTime: { $exists: false },
      });

      console.log(
        `Found ${upcomingShifts.length} upcoming shifts for reminders`
      );

      for (const shift of upcomingShifts) {
        const driver = await Driver.findOne({
          $or: [{ driverId: shift.driverName }, { names: shift.driverName }],
        });

        if (driver && driver.email) {
          const to = driver.email;
          const subject = "Reminder: Upcoming Shift Tomorrow";
          const startTime = new Date(shift.startTime).toLocaleString();

          const text = `
            Hello ${driver.names},
            
            This is a reminder that you have an upcoming shift scheduled for tomorrow:
            
            Date: ${shift.Date}
            From: ${shift.origin}
            To: ${shift.destination}
            Start Time: ${startTime}
            Vehicle: ${shift.plateNumber}
            
            Please ensure you are prepared and on time for this assignment.
            
            Regards,
            Transport Agency Management Team
          `;

          await sendEmail(to, subject, text);
          console.log(`Reminder sent to ${driver.email} for shift tomorrow`);
        }
      }
    } catch (error) {
      console.error("Error sending shift reminders:", error);
    }
  });
};
