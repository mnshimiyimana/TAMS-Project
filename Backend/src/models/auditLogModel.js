import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    agencyName: {
      type: String,
      required: function () {
        return this.userRole !== "superadmin";
      },
    },
    action: {
      type: String,
      required: true,
      enum: [
        "login",
        "logout",
        "create",
        "update",
        "delete",
        "activate",
        "deactivate",
        "password_reset",
        "password_change",
        "export_data",
        "bulk_operation",
        "feedback_submission",
        "feedback_response",
        "system_config_change",
        "other",
      ],
    },
    resourceType: {
      type: String,
      required: true,
      enum: [
        "user",
        "agency",
        "bus",
        "driver",
        "shift",
        "fuel",
        "feedback",
        "notification",
        "insight",
        "system",
        "package",
        "other",
      ],
    },
    resourceId: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resourceType: 1 });
auditLogSchema.index({ agencyName: 1 });
auditLogSchema.index({ createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
