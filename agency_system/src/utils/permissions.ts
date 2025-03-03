export type UserRole = "superadmin" | "admin" | "manager" | "fuel";

const ROLE_PERMISSIONS = {
  superadmin: [
    "drivers",
    "vehicles",
    "shifts",
    "fuels",
    "insights",
    "profile",
    "superadmin-portal"
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


export const hasPermission = (
  role: UserRole | undefined,
  feature: string
): boolean => {
  if (!role) return false;
  
  if (role === "superadmin") {
    return true;
  }
  
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(feature);
};