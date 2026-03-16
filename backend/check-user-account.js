// backend/check-user-account.js
// Check specific user account and verify password

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./models/User.js";

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB\n");

    const email = "meenakshianil33@gmail.com";
    const password = "Meenakshi123";

    console.log(`🔍 Checking user account: ${email}\n`);

    // Find user (need to select password field)
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    
    if (!user) {
      console.log("❌ User NOT found in database");
      console.log("\n💡 Possible reasons:");
      console.log("   1. User was never registered");
      console.log("   2. User was deleted");
      console.log("   3. Email is different (case-sensitive search)");
      console.log("\n🔍 Searching for similar emails...");
      
      // Search for similar emails
      const similarUsers = await User.find({
        email: { $regex: "meenakshi", $options: "i" }
      }).select("name email role isActive");
      
      if (similarUsers.length > 0) {
        console.log(`\n   Found ${similarUsers.length} user(s) with similar email:`);
        similarUsers.forEach((u, idx) => {
          console.log(`   ${idx + 1}. ${u.name} (${u.email}) - Role: ${u.role} - Active: ${u.isActive ? "Yes" : "No"}`);
        });
      } else {
        console.log("   No similar emails found");
      }
      
      process.exit(1);
    }

    console.log("✅ User found!");
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive ? "Yes" : "No"}`);
    console.log(`   Has password: ${user.password ? "Yes" : "No"}`);
    console.log(`   Created: ${user.createdAt}`);
    console.log("");

    // Check if account is active
    if (user.isActive === false) {
      console.log("❌ Account is DEACTIVATED");
      console.log("💡 This is why login is failing. Contact support to reactivate.");
      process.exit(1);
    }

    // Check if password exists
    if (!user.password) {
      console.log("❌ User has NO password set");
      console.log("💡 This might be a Google login user. Try logging in with Google instead.");
      process.exit(1);
    }

    // Test password
    console.log("🔐 Testing password...");
    const isMatch = await user.matchPassword(password);
    
    if (isMatch) {
      console.log("✅ Password is CORRECT!");
      console.log("\n💡 The account looks good. If login still fails, check:");
      console.log("   1. Backend server is running");
      console.log("   2. MongoDB connection is stable");
      console.log("   3. Try logging in again");
    } else {
      console.log("❌ Password is INCORRECT");
      console.log("\n💡 The password you're using doesn't match the stored password.");
      console.log("   Options:");
      console.log("   1. Use 'Forgot Password' to reset");
      console.log("   2. Update password to match what you're trying");
      console.log("\n   Would you like me to update the password to 'Meenakshi123'?");
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error:", err.message);
    if (err.message.includes("ENOTFOUND") || err.message.includes("getaddrinfo")) {
      console.error("\n💡 MongoDB connection failed. Check your connection.");
    }
    process.exit(1);
  }
};

checkUser();
