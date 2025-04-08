import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const subscribeToNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const { data, error } = await resend.emails.send({
      from: "TAMS <contact@tamsrw.site>",
      to: email,
      subject: "Subscription Confirmation",
      html: `
        <h1>Thank You for Subscribing!</h1>
        <p>You have successfully subscribed to our newsletter.</p>
        <p>You'll receive the latest information, news, and offers about agency management.</p>
      `,
    });

    await resend.emails.send({
      from: "TAMS <contact@tamsrw.site>",
      to: "m.nshimiyim@alustudent.com",
      subject: "New Newsletter Subscription",
      html: `
        <h1>New Subscription Alert</h1>
        <p>A new user has subscribed to your newsletter:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    if (error) {
      console.error("Email sending error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to process subscription",
        error: error.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Subscription successful",
      id: data?.id,
    });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process subscription",
      error: error.message,
    });
  }
};