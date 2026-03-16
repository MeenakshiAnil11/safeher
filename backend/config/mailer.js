import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter only if emails are enabled
let transporter = null;

if (process.env.DISABLE_EMAILS === "true") {
  console.log("📧 Emails are disabled (DISABLE_EMAILS=true)");
} else {
  // Check if using Gmail (gmail.com domain) or Mailtrap
  const isGmail = process.env.EMAIL_USER && process.env.EMAIL_USER.includes("gmail.com");
  
  if (isGmail) {
    // Gmail configuration
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Mailtrap or other SMTP configuration
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Verify connection config
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ Mail server connection failed:", error);
    } else {
      console.log("✅ Mail server ready to send emails");
      console.log(`📧 Using: ${isGmail ? 'Gmail' : process.env.EMAIL_HOST}`);
    }
  });
}

/**
 * Send an email
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body content
 */
export async function sendEmail({ to, subject, html }) {
  if (process.env.DISABLE_EMAILS === "true") {
    console.log("📧 Email skipped (DISABLE_EMAILS=true):", { to, subject });
    return { messageId: "skipped" };
  }

  if (!transporter) {
    console.error("❌ Email transporter not initialized. Check EMAIL_* environment variables.");
    throw new Error("❌ Transporter not initialized. Check your mailer config.");
  }

  console.log(`📧 Sending email to ${to}...`);
  
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `SafeHer <no-reply@safeher.com>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw error;
  }
}
