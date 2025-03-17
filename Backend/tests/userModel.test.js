import { User } from "../src/models/userModel.js";

describe("User Model", () => {
  describe("hasPermission method", () => {
    it("should return true when user has higher role", () => {
      const user = new User({ role: "superadmin" });
      expect(user.hasPermission("admin")).toBe(true);

      const adminUser = new User({ role: "admin" });
      expect(adminUser.hasPermission("manager")).toBe(true);
    });

    it("should return true when user has same role", () => {
      const user = new User({ role: "manager" });
      expect(user.hasPermission("manager")).toBe(true);
    });

    it("should return false when user has lower role", () => {
      const user = new User({ role: "manager" });
      expect(user.hasPermission("admin")).toBe(false);

      const fuelUser = new User({ role: "fuel" });
      expect(fuelUser.hasPermission("manager")).toBe(false);
    });
  });
});
