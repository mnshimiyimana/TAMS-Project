import mongoose from "mongoose";

const insightsSchema = new mongoose.Schema(
  {
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    reportDate: { type: Date, required: true },
    reportDetails: { type: String, required: true },
    insightReports: [{ type: String }], 
  },
  { timestamps: true }
);

export default mongoose.model("Insights", insightsSchema);
