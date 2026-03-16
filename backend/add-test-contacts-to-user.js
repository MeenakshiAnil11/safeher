/**
 * Add Test Emergency Contacts to a User
 * 
 * This script adds test emergency contacts to a specific user
 * 
 * Usage: node backend/add-test-contacts-to-user.js <email>
 * Example: node backend/add-test-contacts-to-user.js meenakshianil33@gmail.com
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Contact from "./models/Contact.js";
import User from "./models/User.js";

const userEmail = process.argv[2] || "meenakshianil33@gmail.com";

console.log("\n🚨 Adding Test Emergency Contacts\n");
console.log("=" .repeat(50));

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

const addTestContacts = async () => {
  await connectDB();

  try {
    // Find user by email
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log(`❌ User not found: ${userEmail}`);
      console.log("\nAvailable users:");
      const allUsers = await User.find().select("name email").lean();
      allUsers.forEach(u => console.log(`  - ${u.name} (${u.email})`));
      process.exit(0);
    }

    console.log(`👤 User: ${user.name} (${user.email})\n`);

    // Check existing contacts
    const existingContacts = await Contact.find({ user: user._id });
    console.log(`📋 Found ${existingContacts.length} existing contacts`);

    // Test contacts to add
    const testContacts = [
      {
        name: "Test Contact 1",
        number: "+1234567890",
        email: "test1@example.com",
        relationship: "Family",
        notes: "Test emergency contact"
      },
      {
        name: "Test Contact 2",
        number: "+1987654321",
        email: "test2@example.com",
        relationship: "Friend",
        notes: "Test emergency contact"
      },
      {
        name: "Emergency Services",
        number: "911",
        email: "",
        relationship: "Emergency",
        notes: "Local emergency services"
      }
    ];

    console.log("\n➕ Adding test contacts...\n");

    for (const contact of testContacts) {
      try {
        const newContact = await Contact.create({
          user: user._id,
          ...contact
        });
        console.log(`✅ Added: ${newContact.name}`);
        console.log(`   📧 ${newContact.email || "No email"}`);
        console.log(`   📱 ${newContact.number}`);
      } catch (error) {
        console.log(`⚠️  Skipped: ${contact.name} (${error.message})`);
      }
    }

    // Show updated contacts
    const updatedContacts = await Contact.find({ user: user._id });
    console.log(`\n✅ Total contacts: ${updatedContacts.length}`);

    console.log("\n💡 Next steps:");
    console.log("1. Login as this user in the app");
    console.log("2. Click the SOS button");
    console.log("3. Check your email inbox for test emails");
    console.log("4. Check backend console for detailed logs");

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ Done!\n");
    process.exit(0);
  }
};

addTestContacts();

