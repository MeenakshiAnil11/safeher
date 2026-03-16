// backend/list-all-users.js
// List all users in the database

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./models/User.js";

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB\n");

    const users = await User.find()
      .select("name email role isActive createdAt")
      .sort({ createdAt: -1 })
      .lean();

    console.log(`📊 Total users in database: ${users.length}\n`);

    if (users.length === 0) {
      console.log("   No users found in database");
    } else {
      users.forEach((user, idx) => {
        console.log(`${idx + 1}. ${user.name || "No name"}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.isActive ? "Yes" : "No"}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log("");
      });
    }

    // Check specifically for meenakshianil33@gmail.com
    const targetEmail = "meenakshianil33@gmail.com";
    const normalizedEmail = targetEmail.toLowerCase().trim();
    console.log(`\n🔍 Searching for: ${targetEmail}`);
    console.log(`   Normalized: ${normalizedEmail}`);
    
    const found = users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (found) {
      console.log(`   ✅ Found: ${found.name} (${found.email})`);
    } else {
      console.log(`   ❌ Not found in database`);
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

listUsers();
