import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter only if emails are enabled
let transporter = null;

if (process.env.DISABLE_EMAILS === "true") {
  console.log("📧 Emails are disabled (DISABLE_EMAILS=true)");
} else {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: false, // Mailtrap works without SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Verify connection config
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ Mail server connection failed:", error);
    } else {
      console.log("✅ Mail server ready to send emails");
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
    console.log("📧 Email skipped:", { to, subject });
    return;
  }

  if (!transporter) {
    throw new Error("❌ Transporter not initialized. Check your mailer config.");
  }

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || `SafeHer <no-reply@safeher.com>`,
    to,
    subject,
    html,
  });
}
