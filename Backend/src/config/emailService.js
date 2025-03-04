import { Resend } from "resend";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

// Get current file directory for log file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, "../../email-logs.txt");

// Log email activity to file for debugging
const appendToLog = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  try {
    fs.appendFileSync(logFile, logMessage);
  } catch (err) {
    console.error("Could not write to log file:", err);
  }
};

// Validate API key
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error("⚠️ ERROR: Missing RESEND_API_KEY in environment variables");
  // Log to file for persistence
  appendToLog("ERROR: Missing RESEND_API_KEY in environment variables");
}

// Initialize Resend with a fallback for development
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

/**
 * Send an email using the Resend service with enhanced error handling and logging
 */
const sendEmail = async (to, subject, text) => {
  try {
    appendToLog(`Attempting to send email to: ${to}`);
    appendToLog(`Subject: ${subject}`);
    console.log(`📧 Sending email to: ${to}`);

    // Convert plain text to HTML for better formatting
    const html = text.replace(/\n/g, "<br>");

    // Prepare email data
    const emailData = {
      from: process.env.EMAIL_FROM || "TAMS <onboarding@resend.dev>",
      to,
      subject,
      text,
      html,
    };

    // Log attempt
    appendToLog(
      `Email configuration: ${JSON.stringify({
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
      })}`
    );

    // Send the email via Resend API
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
