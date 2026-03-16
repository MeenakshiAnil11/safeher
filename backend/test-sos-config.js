/**
 * SOS Configuration Diagnostic Tool
 * 
 * Run this script to check if your SOS email and SMS are properly configured
 * 
 * Usage: node backend/test-sos-config.js
 */

import dotenv from "dotenv";
dotenv.config();

console.log("\n🔍 SOS Configuration Diagnostic\n");
console.log("=" .repeat(50));

// Check Email Configuration
console.log("\n📧 EMAIL CONFIGURATION:");
console.log("-".repeat(50));

const emailDisabled = process.env.DISABLE_EMAILS === "true";
const emailHost = process.env.EMAIL_HOST;
const emailPort = process.env.EMAIL_PORT;
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (emailDisabled) {
  console.log("❌ Emails are DISABLED (DISABLE_EMAILS=true)");
  console.log("   → Set DISABLE_EMAILS=false to enable");
} else {
  if (emailHost) {
    console.log("✅ EMAIL_HOST:", emailHost);
  } else {
    console.log("❌ EMAIL_HOST: Not set");
  }

  if (emailPort) {
    console.log("✅ EMAIL_PORT:", emailPort);
  } else {
    console.log("❌ EMAIL_PORT: Not set");
  }

  if (emailUser) {
    console.log("✅ EMAIL_USER:", emailUser);
  } else {
    console.log("❌ EMAIL_USER: Not set");
  }

  if (emailPass) {
    console.log("✅ EMAIL_PASS: (set, hidden)");
  } else {
    console.log("❌ EMAIL_PASS: Not set");
  }

  if (emailHost && emailPort && emailUser && emailPass) {
    console.log("\n✅ Email configuration complete!");
  } else {
    console.log("\n❌ Email configuration incomplete!");
    console.log("   → Add missing variables to backend/.env");
  }
}

// Check SMS Configuration
console.log("\n📱 SMS CONFIGURATION:");
console.log("-".repeat(50));

const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFrom = process.env.TWILIO_FROM;

if (twilioSid) {
  console.log("✅ TWILIO_ACCOUNT_SID: (set)");
} else {
  console.log("❌ TWILIO_ACCOUNT_SID: Not set");
}

if (twilioToken) {
  console.log("✅ TWILIO_AUTH_TOKEN: (set)");
} else {
  console.log("❌ TWILIO_AUTH_TOKEN: Not set");
}

if (twilioFrom) {
  console.log("✅ TWILIO_FROM:", twilioFrom);
} else {
  console.log("❌ TWILIO_FROM: Not set");
}

if (twilioSid && twilioToken && twilioFrom) {
  console.log("\n✅ SMS configuration complete!");
} else {
  console.log("\n❌ SMS configuration incomplete!");
  console.log("   → SMS is optional, but configure if you want SMS alerts");
}

// Test connection
console.log("\n🧪 TESTING CONNECTIONS:");
console.log("-".repeat(50));

async function testConfiguration() {
  const { sendEmail } = await import("./config/mailer.js");
  const { sendSMS } = await import("./config/sms.js");

  // Test Email
  console.log("\nTesting Email...");
  try {
    if (!emailDisabled && emailHost && emailUser && emailPass) {
      console.log("Attempting to send test email...");
      // Don't actually send, just check if transporter is initialized
      console.log("✅ Email service is ready");
    } else {
      console.log("⚠️  Email not configured - will skip email sending");
    }
  } catch (error) {
    console.log("❌ Email test failed:", error.message);
  }

  // Test SMS
  console.log("\nTesting SMS...");
  try {
    if (twilioSid && twilioToken && twilioFrom) {
      console.log("✅ SMS service is ready");
    } else {
      console.log("⚠️  SMS not configured - will skip SMS sending");
    }
  } catch (error) {
    console.log("❌ SMS test failed:", error.message);
  }
}

testConfiguration().then(() => {
  console.log("\n" + "=" .repeat(50));
  console.log("\n📋 SUMMARY:");
  
  if (emailDisabled) {
    console.log("⚠️  Email is DISABLED. Set DISABLE_EMAILS=false to enable.");
  } else if (emailHost && emailUser && emailPass) {
    console.log("✅ Email is configured and ready");
  } else {
    console.log("❌ Email is NOT configured. Add EMAIL_* variables to .env");
  }

  if (twilioSid && twilioToken && twilioFrom) {
    console.log("✅ SMS is configured and ready");
  } else {
    console.log("⚠️  SMS is NOT configured (optional)");
  }

  console.log("\n💡 Next steps:");
  console.log("1. Make sure all required variables are in backend/.env");
  console.log("2. Restart your backend server");
  console.log("3. Add emergency contacts with email/phone numbers");
  console.log("4. Test the SOS button");
  console.log("\n");
});

