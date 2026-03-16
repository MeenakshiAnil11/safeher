/**
 * Debug SOS Functionality
 * 
 * This script helps debug why SOS isn't sending emails/SMS
 * 
 * Usage: node backend/debug-sos.js
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Contact from "./models/Contact.js";
import User from "./models/User.js";

console.log("\n🔍 Debugging SOS Functionality\n");
console.log("=" .repeat(50));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB\n");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

const debugSOS = async () => {
  await connectDB();

  try {
    // Check all users
    const users = await User.find().select("name email phone").lean();
    console.log(`📊 Found ${users.length} user(s) in database\n`);

    if (users.length === 0) {
      console.log("❌ No users found in database!");
      console.log("   → Create a user account first\n");
      process.exit(0);
    }

    // For each user, check their contacts
    for (const user of users) {
      console.log(`\n👤 User: ${user.name} (${user.email})`);
      console.log("-".repeat(50));

      const contacts = await Contact.find({ user: user._id }).lean();
      
      if (contacts.length === 0) {
        console.log("❌ No emergency contacts found!");
        console.log("   → Add emergency contacts via /api/contacts");
        console.log("   → Or create test contacts\n");
        console.log("📝 Example contact:");
        console.log(JSON.stringify({
          name: "Test Contact",
          number: "+1234567890",
          email: "test@example.com",
          relationship: "Test"
        }, null, 2));
      } else {
        console.log(`✅ Found ${contacts.length} emergency contact(s):\n`);
        
        contacts.forEach((contact, index) => {
          console.log(`Contact ${index + 1}:`);
          console.log(`  Name: ${contact.name}`);
          console.log(`  Phone: ${contact.number || "❌ Not set"}`);
          console.log(`  Email: ${contact.email || "❌ Not set"}`);
          console.log(`  Relationship: ${contact.relationship || "N/A"}`);
          console.log();
        });

        // Check if contacts have email or phone
        const contactsWithEmail = contacts.filter(c => c.email).length;
        const contactsWithPhone = contacts.filter(c => c.number).length;

        console.log(`📧 Contacts with email: ${contactsWithEmail}`);
        console.log(`📱 Contacts with phone: ${contactsWithPhone}`);

        if (contactsWithEmail === 0 && contactsWithPhone === 0) {
          console.log("\n⚠️  WARNING: None of your contacts have email or phone!");
          console.log("   → Emails/SMS will NOT be sent");
          console.log("   → Update contacts to include email and/or phone numbers\n");
        }
      }
    }

    // Check email configuration
    console.log("\n📧 EMAIL CONFIGURATION:");
    console.log("-".repeat(50));
    
    if (process.env.DISABLE_EMAILS === "true") {
      console.log("❌ EMAIL is DISABLED (DISABLE_EMAILS=true)");
    } else if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log("✅ Email is configured");
      console.log(`   Host: ${process.env.EMAIL_HOST}`);
      console.log(`   User: ${process.env.EMAIL_USER}`);
    } else {
      console.log("❌ Email is NOT configured");
    }

    // Check SMS configuration
    console.log("\n📱 SMS CONFIGURATION:");
    console.log("-".repeat(50));
    
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      console.log("✅ SMS is configured (Twilio)");
    } else {
      console.log("⚠️  SMS is NOT configured (optional)");
    }

    console.log("\n💡 TROUBLESHOOTING:");
    console.log("-".repeat(50));
    console.log("If emails/SMS are not being sent:");
    console.log("1. Make sure contacts have email and/or phone numbers");
    console.log("2. Check backend console logs when clicking SOS button");
    console.log("3. Verify EMAIL_* variables in backend/.env");
    console.log("4. For Gmail: Use app password, not regular password");
    console.log("5. Check spam folder for test emails");

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed\n");
    process.exit(0);
  }
};

debugSOS();

