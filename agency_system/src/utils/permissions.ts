export type UserRole = "superadmin" | "admin" | "manager" | "fuel";

// Update permissions - remove regular dashboard items from superadmin
const ROLE_PERMISSIONS = {
  superadmin: [
    "superadmin-portal"  // Only allow superadmin portal access
  ],
  admin: [
    "drivers",
    "vehicles",
    "shifts",
    "fuels",
    "insights",
    "profile"
  ],
  manager: [
    "drivers",
    "vehicles",
    "shifts",
    "profile"
  ],
  fuel: [
    "fuels",
    "profile"
  ],
};

// This function stays the same
export const hasPermission = (
  role: UserRole | undefined,
  feature: string
): boolean => {
  if (!role) return false;
  
  // Special case for superadmin - ONLY allow superadmin-portal
  if (role === "superadmin") {
    // Only return true for superadmin-portal or explicitly permitted features
    return feature === "superadmin-portal" || ROLE_PERMISSIONS.superadmin.includes(feature);
  }
  
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(feature);
};