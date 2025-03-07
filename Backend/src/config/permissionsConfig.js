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
    "packages",
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
    "packages:read",
    "packages:create",
    "packages:update",
    "packages:delete",
  ],
  manager: [
    "buses:read",
    "buses:create",
    "buses:update",
    "buses:delete",
    "drivers:read",
    "drivers:create",
    "drivers:update",
    "drivers:delete",
    "shifts:read",
    "shifts:create",
    "shifts:update",
    "shifts:delete",
    "users:read:self",
    "dashboard:manager",
    "packages:read",
    "packages:create",
    "packages:update",
    "packages:delete",
  ],
  fuel: [
    "fuel-management:read",
    "fuel-management:create",
    "fuel-management:update",
    "fuel-management:delete",
    "users:read:self",
    "dashboard:fuel",
  ],
};

const hasPermission = (userRole, requiredPermission) => {
  if (!userRole || !ROLE_PERMISSIONS[userRole]) {
    return false;
  }

  if (userRole === "superadmin") {
    return true;
  }

  const permissions = ROLE_PERMISSIONS[userRole];

  if (permissions.includes(requiredPermission)) {
    return true;
  }

  const resourcePrefix = requiredPermission.split(":")[0];
  if (permissions.includes(`${resourcePrefix}:all`)) {
    return true;
  }

  return false;
};

const isAdminOrHigher = (userRole) => {
  return ["admin", "superadmin"].includes(userRole);
};

export { ROLE_PERMISSIONS, hasPermission, isAdminOrHigher };
