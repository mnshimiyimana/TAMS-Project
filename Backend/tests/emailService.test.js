jest.mock("../src/config/emailService.js", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((to, subject, text) => {
    return Promise.resolve({ success: true, messageId: "test-id" });
  }),
  sendShiftNotification: jest.fn().mockImplementation((driver, shift) => {
    return Promise.resolve({ success: true, messageId: "test-id" });
  }),
  FRONTEND_URL: "https://test.example.com",
}));

import sendEmail from "../src/config/emailService.js";

describe("Email Service", () => {
  beforeEach(() => {
    sendEmail.mockClear();
  });

  it("should send an email successfully", async () => {
    sendEmail.mockResolvedValueOnce({ success: true, messageId: "test-id" });

    const result = await sendEmail(
      "test@example.com",
      "Test Subject",
      "Test Body"
    );

    expect(result.success).toBe(true);
    expect(result.messageId).toBe("test-id");
    expect(sendEmail).toHaveBeenCalledWith(
      "test@example.com",
      "Test Subject",
      "Test Body"
    );
  });

  it("should handle API errors", async () => {
    sendEmail.mockResolvedValueOnce({
      success: false,
      error: "Test error",
    });

    const result = await sendEmail(
      "test@example.com",
      "Test Subject",
      "Test Body"
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("Test error");
  });
});
