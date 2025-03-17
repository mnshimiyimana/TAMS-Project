import jwt from "jsonwebtoken";
import { protect } from "../src/middlewares/authMiddleware.js";
import { User } from "../src/models/userModel.js";

jest.mock("jsonwebtoken");
jest.mock("../src/models/userModel.js");

describe("Auth Middleware", () => {
  let req, res, next;
  let originalConsole;

  beforeAll(() => {
    // Save all original console methods
    originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
    };

    // Mock all console methods
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
    console.info = jest.fn();
  });

  afterAll(() => {
    // Restore all original console methods
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      headers: {
        authorization: "Bearer valid-token",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    jwt.verify = jest.fn().mockReturnValue({ id: "user123", role: "admin" });

    User.findById = jest.fn().mockResolvedValue({
      _id: "user123",
      role: "admin",
      agencyName: "testAgency",
      isActive: true,
    });

    User.findOne = jest.fn().mockResolvedValue(null);
  });

  it("should add user data to request and call next() with valid token", async () => {
    await protect(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "valid-token",
      process.env.JWT_SECRET
    );
    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(req.userId).toBe("user123");
    expect(req.userRole).toBe("admin");
    expect(req.userAgency).toBe("testAgency");
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 when no token is provided", async () => {
    req.headers.authorization = undefined;

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Not authorized, no token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when token is invalid", async () => {
    const jwtError = new Error("invalid token");
    jwtError.name = "JsonWebTokenError";

    jwt.verify.mockImplementation(() => {
      throw jwtError;
    });

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when token is expired", async () => {
    const expiredError = new Error("jwt expired");
    expiredError.name = "TokenExpiredError";
    expiredError.message = "jwt expired";

    jwt.verify.mockImplementation(() => {
      throw expiredError;
    });

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token expired" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when user is not found", async () => {
    jwt.verify.mockReturnValue({ id: "user123", role: "admin" });

    User.findById.mockResolvedValue(null);
    User.findOne.mockResolvedValue(null);

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    const jsonCall = res.json.mock.calls[0][0];
    expect(jsonCall).toHaveProperty("message");

    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when user account is deactivated", async () => {
    User.findById.mockResolvedValue({
      _id: "user123",
      role: "admin",
      agencyName: "testAgency",
      isActive: false,
    });

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "User account is deactivated",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
