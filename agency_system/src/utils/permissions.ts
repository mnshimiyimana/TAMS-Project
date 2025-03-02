// Define role types for type safety
export type UserRole = 'superadmin' | 'admin' | 'manager' | 'fuel';

// Define feature access permissions by role
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: ['drivers', 'vehicles', 'shifts', 'fuels', 'insights', 'profile', 'agencies', 'users'],
  admin: ['drivers', 'vehicles', 'shifts', 'fuels', 'insights', 'profile', 'users'],
  manager: ['drivers', 'vehicles', 'shifts', 'profile'],
  fuel: ['fuels', 'profile']
};

// Helper function to check if a user has permission for a feature
export const hasPermission = (userRole: UserRole | undefined, feature: string): boolean => {
  if (!userRole) return false;
  return ROLE_PERMISSIONS[userRole]?.includes(feature) || false;
};

// Helper to get all allowed features for a role
export const getAllowedFeatures = (userRole: UserRole | undefined): string[] => {
  if (!userRole) return [];
  return ROLE_PERMISSIONS[userRole] || [];
};

// Check if a user has admin-level access or higher
export const isAdminOrHigher = (userRole: UserRole | undefined): boolean => {
  if (!userRole) return false;
  return ['admin', 'superadmin'].includes(userRole);
};

// Check if a user can access management features
export const canAccessManagement = (userRole: UserRole | undefined): boolean => {
  if (!userRole) return false;
  return ['admin', 'superadmin', 'manager'].includes(userRole);
};

// Check if a user can access fuel features
export const canAccessFuel = (userRole: UserRole | undefined): boolean => {
  if (!userRole) return false;
  return ['admin', 'superadmin', 'fuel'].includes(userRole);
};