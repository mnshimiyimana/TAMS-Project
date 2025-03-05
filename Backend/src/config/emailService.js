import { Resend } from "resend";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, "../../email-logs.txt");

const appendToLog = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  try {
    fs.appendFileSync(logFile, logMessage);
  } catch (err) {
    console.error("Could not write to log file:", err);
  }
};

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error("⚠️ ERROR: Missing RESEND_API_KEY in environment variables");

  appendToLog("ERROR: Missing RESEND_API_KEY in environment variables");
}

const resend = apiKey
  ? new Resend(apiKey)
  : {
      emails: {
        send: async () => {
          const message =
            "⚠️ DEVELOPMENT MODE: No API key provided, email would have been sent";
          console.log(message);
          appendToLog(message);
          return { data: { id: "dev-mode-no-email-sent" } };
        },
      },
    };

const sendEmail = async (to, subject, text) => {
  try {
    appendToLog(`Attempting to send email to: ${to}`);
    appendToLog(`Subject: ${subject}`);
    console.log(`📧 Sending email to: ${to}`);

    const html = text.replace(/\n/g, "<br>");

    const emailData = {
      from: process.env.EMAIL_FROM || "TAMS <onboarding@resend.dev>",
      to,
      subject,
      text,
      html,
    };

    appendToLog(
      `Email configuration: ${JSON.stringify({
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
      })}`
    );

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      const errorMessage = `Email API error: ${JSON.stringify(error)}`;
      console.error(`❌ ${errorMessage}`);
      appendToLog(errorMessage);

      return {
        success: false,
        error: error.message || "Unknown error from Resend API",
      };
    }

    const successMessage = `Email sent successfully to ${to}. ID: ${data?.id}`;
    console.log(`✅ ${successMessage}`);
    appendToLog(successMessage);

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    const errorMessage = `Email sending exception: ${error.message}`;
    console.error(`❌ ${errorMessage}`);
    appendToLog(errorMessage);

    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
};

export default sendEmail;

const sendShiftNotification = async (driver, shift) => {
  try {
    const to = driver.email;
    const subject = "New Shift Assignment";

    const startTime = new Date(shift.startTime).toLocaleString();
    const endTime = shift.endTime
      ? new Date(shift.endTime).toLocaleString()
      : "To be determined";

    const text = `
      Hello ${driver.names},
      
      You have been assigned to a new shift with the following details:
      
      Date: ${shift.Date}
      From: ${shift.origin}
      To: ${shift.destination}
      Start Time: ${startTime}
      Expected End Time: ${endTime}
      Vehicle: ${shift.plateNumber}
      
      Please ensure you are prepared and on time for this assignment.
      
      Regards,
      Transport Agency Management Team
    `;
    return await sendEmail(to, subject, text);
  } catch (error) {
    console.error("Error sending shift notification:", error);
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
};

export { sendEmail, sendShiftNotification };
