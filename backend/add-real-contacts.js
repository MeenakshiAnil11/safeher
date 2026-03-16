// backend/add-real-contacts.js
import mongoose from "mongoose";
import Contact from "./models/Contact.js";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

async function addRealContacts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const user = await User.findOne();
    if (!user) {
      console.log("❌ No users found. Please register a user first.");
      return;
    }

    console.log(`👤 Found user: ${user.name} (${user.email})`);

    // ⚠️ IMPORTANT: Replace these with YOUR REAL emergency contacts
    const realContacts = [
      {
        name: "Mom",
        number: "+1234567890", // Replace with your mom's real phone
        relationship: "Family",
        email: "mom@gmail.com", // Replace with your mom's real email
        notes: "Primary emergency contact"
      },
      {
        name: "Best Friend",
        number: "+0987654321", // Replace with your friend's real phone
        relationship: "Friend", 
        email: "friend@gmail.com", // Replace with your friend's real email
        notes: "Secondary emergency contact"
      },
      {
        name: "Emergency Contact 3",
        number: "+1122334455", // Replace with another real phone
        relationship: "Family",
        email: "contact3@gmail.com", // Replace with another real email
        notes: "Tertiary emergency contact"
      }
    ];

    // Clear existing test contacts
    await Contact.deleteMany({ user: user._id });
    console.log("🗑️ Cleared existing test contacts");

    // Add real contacts
    for (const contactData of realContacts) {
      const contact = await Contact.create({
        ...contactData,
        user: user._id
      });
      console.log(`✅ Added contact: ${contact.name} (${contact.email})`);
    }

    console.log("\n🎉 Real emergency contacts added!");
    console.log("📧 These contacts will receive REAL emails when you send SOS");
    console.log("\n⚠️  IMPORTANT: Update the email addresses above with real ones!");
    console.log("📝 Edit this file: backend/add-real-contacts.js");
    console.log("🔄 Then run: node add-real-contacts.js");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

addRealContacts();
