import { enforceAgencyIsolation } from "../src/middlewares/agencyIsolationMiddleware.js";
import { User } from "../src/models/userModel.js";

jest.mock("../src/models/userModel.js");

describe("Agency Isolation Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      userId: "user123",
      userRole: "admin",
      query: {},
      body: {},
      params: {},
      method: "GET",
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    User.findById = jest.fn().mockResolvedValue({
      _id: "user123",
      role: "admin",
      agencyName: "testAgency",
    });
  });

  it("should add userAgency to request for non-superadmin users", async () => {
    await enforceAgencyIsolation(req, res, next);

    expect(req.userAgency).toBe("testAgency");
    expect(req.query.agencyName).toBe("testAgency");
    expect(next).toHaveBeenCalled();
  });

  it("should allow superadmins to access any agency", async () => {
    req.userRole = "superadmin";
    req.query.agencyName = "anotherAgency";

    await enforceAgencyIsolation(req, res, next);

    expect(req.query.agencyName).toBe("anotherAgency");
    expect(next).toHaveBeenCalled();
  });

  it("should reject requests from users trying to access other agencies", async () => {
    req.query.agencyName = "anotherAgency";

    await enforceAgencyIsolation(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "You do not have permission to access data from other agencies",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should add agency to request body for write operations", async () => {
    req.method = "POST";

    await enforceAgencyIsolation(req, res, next);

    expect(req.body.agencyName).toBe("testAgency");
    expect(next).toHaveBeenCalled();
  });

  it("should reject write operations for other agencies", async () => {
    req.method = "POST";
    req.body.agencyName = "anotherAgency";

    await enforceAgencyIsolation(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "You do not have permission to create or modify data for other agencies",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
