const ROLE_PERMISSIONS = {
  superadmin: [
    "agencies",
    "buses",
    "drivers",
    "fuel-management",
    "insights",
    "notifications",
    "shifts",
    "users",
    "system",
    "superadmin",
  ],
  admin: [
    "agencies:read",
    "agencies:update",
    "buses:all",
    "drivers:all",
    "fuel-management:all",
    "insights:all",
    "notifications:all",
    "shifts:all",
    "users:read",
    "users:update",
    "users:create",
    "dashboard:all",
  ],
  manager: [
    "buses:read",
    "buses:update",
    "drivers:all",
    "shifts:all",
    "users:read:self",
    "dashboard:manager",
  ],
  fuel: ["fuel-management:all", "users:read:self", "dashboard:fuel"],
};

// Helper function to check if a user has permission
const hasPermission = (userRole, requiredPermission) => {
  if (!userRole || !ROLE_PERMISSIONS[userRole]) {
    return false;
  }

  // Superadmin has access to everything
  if (userRole === "superadmin") {
    return true;
  }

  const permissions = ROLE_PERMISSIONS[userRole];

  // Direct permission check
  if (permissions.includes(requiredPermission)) {
    return true;
  }

  // Check for wildcard permissions
  const resourcePrefix = requiredPermission.split(":")[0];
  if (permissions.includes(`${resourcePrefix}:all`)) {
    return true;
  }

  return false;
};

// Check if a user has admin-level access or higher
const isAdminOrHigher = (userRole) => {
  return ["admin", "superadmin"].includes(userRole);
};

// Using ES module exports instead of CommonJS
export { ROLE_PERMISSIONS, hasPermission, isAdminOrHigher };
