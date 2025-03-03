import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    userName: { 
      type: String, 
      required: true 
    },
    userRole: { 
      type: String, 
      required: true 
    },
    agencyName: { 
      type: String, 
      required: function() {
        return this.userRole !== "superadmin";
      }
    },
    type: { 
      type: String, 
      enum: ["feedback", "issue", "suggestion"], 
      required: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["pending", "in-progress", "resolved", "closed"], 
      default: "pending" 
    },
    response: { 
      type: String 
    },
    respondedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    resolvedAt: { 
      type: Date 
    }
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);