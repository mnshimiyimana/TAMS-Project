import { login } from "../src/controllers/auth/login.js";
import { User } from "../src/models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

jest.mock("../src/models/userModel.js");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("Auth Controller - Login", () => {
  beforeEach(() => {
    User.findOne = jest.fn();

    bcrypt.compare = jest.fn();

    jwt.sign = jest.fn().mockReturnValue("token123");
  });

  it("should login successfully with valid credentials", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockUser = {
      _id: "user123",
      username: "testuser",
      email: "test@example.com",
      role: "admin",
      agencyName: "testAgency",
      isActive: true,
      password: "hashedpassword",
      save: jest.fn().mockResolvedValue(true),
    };

    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);

    await login(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "password123",
      "hashedpassword"
    );
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "user123",
        role: "admin",
        agencyName: "testAgency",
      }),
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    expect(mockUser.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: "token123",
        user: expect.objectContaining({
          id: "user123",
          username: "testuser",
          email: "test@example.com",
          role: "admin",
          agencyName: "testAgency",
        }),
      })
    );
  });

  it("should return 401 with invalid email", async () => {
    const req = {
      body: {
        email: "wrong@example.com",
        password: "password123",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findOne.mockResolvedValue(null);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
  });

  it("should return 401 with invalid password", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "wrongpassword",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockUser = {
      _id: "user123",
      email: "test@example.com",
      password: "hashedpassword",
      isActive: true,
    };

    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
  });

  it("should return 403 for deactivated account", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockUser = {
      _id: "user123",
      email: "test@example.com",
      password: "hashedpassword",
      isActive: false,
    };

    User.findOne.mockResolvedValue(mockUser);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Account is deactivated. Please contact your administrator.",
    });
  });
});
