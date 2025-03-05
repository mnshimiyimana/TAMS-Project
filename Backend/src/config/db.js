import mongoose from "mongoose";
import { scheduleShiftReminders } from "../services/schedulingService.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {});
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
  scheduleShiftReminders();
};

export default connectDB;
