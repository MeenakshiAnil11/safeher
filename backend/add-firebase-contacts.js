// backend/add-firebase-contacts.js
import mongoose from "mongoose";
import Contact from "./models/Contact.js";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

async function addFirebaseContacts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const user = await User.findOne();
    if (!user) {
      console.log("❌ No users found. Please register a user first.");
      return;
    }

    console.log(`👤 Found user: ${user.name} (${user.email})`);

    // Add emergency contacts (FCM tokens will be added via frontend)
    const firebaseContacts = [
      {
        name: "Emergency Contact 1",
        number: "+1234567890",
        relationship: "Family",
        email: "contact1@example.com",
        fcmToken: "", // Will be filled when they enable notifications
        notes: "Primary emergency contact - needs to enable notifications"
      },
      {
        name: "Emergency Contact 2",
        number: "+0987654321", 
        relationship: "Friend",
        email: "contact2@example.com",
        fcmToken: "", // Will be filled when they enable notifications
        notes: "Secondary emergency contact - needs to enable notifications"
      }
    ];

    // Clear existing contacts
    await Contact.deleteMany({ user: user._id });
    console.log("🗑️ Cleared existing contacts");

    // Add Firebase contacts
    for (const contactData of firebaseContacts) {
      const contact = await Contact.create({
        ...contactData,
        user: user._id
      });
      console.log(`✅ Added contact: ${contact.name}`);
    }

    console.log("\n🔥 Firebase emergency contacts added!");
    console.log("📱 These contacts need to:");
    console.log("   1. Open the app on their device");
    console.log("   2. Go to My Contacts page");
    console.log("   3. Click 'Enable Notifications'");
    console.log("   4. Allow notification permission");
    console.log("\n🚨 Then they will receive push notifications when you send SOS!");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

addFirebaseContacts();
