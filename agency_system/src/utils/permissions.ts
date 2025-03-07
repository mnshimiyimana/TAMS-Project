export type UserRole = "superadmin" | "admin" | "manager" | "fuel";

const ROLE_PERMISSIONS = {
  superadmin: ["superadmin-portal"],
  admin: [
    "drivers",
    "vehicles",
    "shifts",
    "fuels",
    "packages",
    "insights",
    "profile",
  ],
  manager: ["drivers", "vehicles", "shifts", "packages", "profile"],
  fuel: ["fuels", "profile"],
};

export const hasPermission = (
  role: UserRole | undefined,
  feature: string
): boolean => {
  if (!role) return false;

  if (role === "superadmin") {
    return (
      feature === "superadmin-portal" ||
      ROLE_PERMISSIONS.superadmin.includes(feature)
    );
  }

  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(feature);
};

export const isAdminOrHigher = (role: UserRole | undefined): boolean => {
  return role === "admin" || role === "superadmin";
};
