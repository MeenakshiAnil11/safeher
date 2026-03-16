// Test email sending
import { sendEmail } from "./config/mailer.js";
import dotenv from "dotenv";

dotenv.config();

console.log("📧 Testing email configuration...");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_HOST:", process.env.EMAIL_HOST);

try {
  const result = await sendEmail({
    to: "meenakshianil33@gmail.com",
    subject: "🧪 Test Email - SOS System",
    html: `
      <h1>Test Email</h1>
      <p>This is a test email from SafeHer SOS system.</p>
      <p>If you receive this, email is working!</p>
      <p>Timestamp: ${new Date().toLocaleString()}</p>
    `
  });
  
  console.log("✅ Email sent successfully!");
  console.log("Message ID:", result.messageId);
  process.exit(0);
} catch (error) {
  console.error("❌ Failed to send email:", error.message);
  console.error("Error details:", error);
  process.exit(1);
}

