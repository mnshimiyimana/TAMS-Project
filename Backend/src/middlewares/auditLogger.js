import AuditLog from "../models/auditLogModel.js";
import { User } from "../models/userModel.js";

export const createAuditLog = async (details) => {
  try {
    const {
      userId,
      action,
      resourceType,
      resourceId,
      description,
      ipAddress,
      userAgent,
      metadata,
    } = details;

    const user = await User.findById(userId);
    if (!user) {
      console.error("Audit log error: User not found");
      return;
    }

    const logEntry = new AuditLog({
      userId,
      username: user.username,
      userRole: user.role,
      agencyName: user.role !== "superadmin" ? user.agencyName : undefined,
      action,
      resourceType,
      resourceId: resourceId || "",
      description,
      ipAddress: ipAddress || "",
      userAgent: userAgent || "",
      metadata: metadata || {},
    });

    await logEntry.save();
    return logEntry;
  } catch (error) {
    console.error("Error creating audit log:", error);

    return null;
  }
};

export const auditLogger = (action, resourceType, descriptionFn) => {
  return async (req, res, next) => {
    const originalJson = res.json;

    res.json = function (data) {
      res.json = originalJson;

      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.userId;
        const resourceId = req.params.id || (data && data._id) || "";

        const description =
          typeof descriptionFn === "function"
            ? descriptionFn(req, res, data)
            : `${action} ${resourceType}`;

        createAuditLog({
          userId,
          action,
          resourceType,
          resourceId,
          description,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          metadata: {
            requestMethod: req.method,
            requestPath: req.path,
            requestParams: req.params,
            requestBody: req.method !== "GET" ? req.body : undefined,
            responseStatus: res.statusCode,
            responseData: data,
          },
        }).catch((err) => console.error("Audit logging error:", err));
      }

      return res.json(data);
    };

    next();
  };
};

export const auditLogin = async (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    res.json = originalJson;

    if (
      res.statusCode >= 200 &&
      res.statusCode < 300 &&
      data.user &&
      data.user.id
    ) {
      createAuditLog({
        userId: data.user.id,
        action: "login",
        resourceType: "user",
        resourceId: data.user.id,
        description: `User ${data.user.username} logged in`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      }).catch((err) => console.error("Login audit logging error:", err));
    }

    return res.json(data);
  };

  next();
};
