import {
  hasPermission,
  ROLE_PERMISSIONS,
} from "../src/config/permissionsConfig.js";

describe("Permission Configuration", () => {
  describe("hasPermission", () => {
    it("should return true for superadmin regardless of permission", () => {
      expect(hasPermission("superadmin", "anything")).toBe(true);
      expect(hasPermission("superadmin", "users:delete")).toBe(true);
    });

    it("should return true when user role has exact permission", () => {
      expect(hasPermission("admin", "buses:all")).toBe(true);
      expect(hasPermission("manager", "buses:read")).toBe(true);
    });

    it("should return true when user role has wildcard permission", () => {
      expect(hasPermission("admin", "buses:read")).toBe(true);
      expect(hasPermission("manager", "buses:update")).toBe(true);
    });

    it("should return false when user role lacks permission", () => {
      expect(hasPermission("fuel", "buses:read")).toBe(false);
      expect(hasPermission("manager", "agencies:create")).toBe(false);
    });

    it("should return false for non-existent roles", () => {
      expect(hasPermission("nonexistent", "users:read")).toBe(false);
      expect(hasPermission(null, "buses:all")).toBe(false);
    });
  });
});
