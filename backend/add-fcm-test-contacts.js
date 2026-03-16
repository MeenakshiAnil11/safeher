// backend/add-fcm-test-contacts.js
import mongoose from "mongoose";
import Contact from "./models/Contact.js";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

async function addFCMTestContacts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get first user
    const user = await User.findOne();
    if (!user) {
      console.log("❌ No users found. Please register a user first.");
      return;
    }

    console.log(`👤 Found user: ${user.name} (${user.email})`);

    // Sample FCM tokens (these are fake - real ones come from browser)
    const testContacts = [
      {
        name: "Emergency Contact 1",
        number: "+1234567890",
        relationship: "Family",
        email: "emergency1@example.com",
        fcmToken: "test-fcm-token-1", // This will be replaced with real token
        notes: "Primary emergency contact"
      },
      {
        name: "Emergency Contact 2", 
        number: "+0987654321",
        relationship: "Friend",
        email: "emergency2@example.com",
        fcmToken: "test-fcm-token-2", // This will be replaced with real token
        notes: "Secondary emergency contact"
      }
    ];

    // Clear existing contacts for this user
    await Contact.deleteMany({ user: user._id });
    console.log("🗑️ Cleared existing contacts");

    // Add test contacts
    for (const contactData of testContacts) {
      const contact = await Contact.create({
        ...contactData,
        user: user._id
      });
      console.log(`✅ Added contact: ${contact.name}`);
    }

    console.log("\n🎉 Test contacts added successfully!");
    console.log("\nNext steps:");
    console.log("1. Start backend: npm start");
    console.log("2. Start frontend: npm start");
    console.log("3. Go to My Contacts page");
    console.log("4. Click 'Enable Notifications' to get real FCM token");
    console.log("5. Test SOS from dashboard");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

addFCMTestContacts();
