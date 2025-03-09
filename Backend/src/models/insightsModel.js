import mongoose from "mongoose";

const insightsSchema = new mongoose.Schema(
  {
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
    },
    reportDate: { type: Date, required: true },
    reportDetails: { type: String, required: true },
    insightReports: [{ type: String }],

    packageAnalytics: {
      deliveryEfficiency: { type: Number },
      packageVolume: { type: Number },
      successRate: { type: Number },
      averageTransitTime: { type: Number },
      hotRoutes: [
        {
          origin: String,
          destination: String,
          count: Number,
        },
      ],
      packageTrends: [
        {
          date: Date,
          count: Number,
          status: String,
        },
      ],
    },

    finesAnalytics: {
      totalAmount: { type: Number, default: 0 },
      unpaidAmount: { type: Number, default: 0 },
      finesByCategory: [
        {
          category: String,
          count: Number,
          amount: Number,
        },
      ],
      finesByDriver: [
        {
          driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
          driverName: String,
          count: Number,
          amount: Number,
          status: String,
        },
      ],
      recentFines: [
        {
          date: Date,
          driverName: String,
          vehiclePlate: String,
          amount: Number,
          reason: String,
          location: String,
          status: String,
        },
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Insights", insightsSchema);
