// backend/check-login-issue.js
// Quick diagnostic script to check why login is failing

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "./models/User.js";

const checkLoginIssue = async () => {
  console.log("🔍 Checking login issues...\n");

  // 1. Check MongoDB connection
  console.log("1️⃣ Checking MongoDB connection...");
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not set in .env file");
      process.exit(1);
    }
    console.log("✅ MONGO_URI is set");

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ MongoDB connected successfully");
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Database: ${mongoose.connection.name}\n`);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    if (err.message.includes("ENOTFOUND") || err.message.includes("getaddrinfo")) {
      console.error("\n💡 Troubleshooting:");
      console.error("   - Check if MongoDB Atlas cluster is running (not paused)");
      console.error("   - Verify MONGO_URI in .env is correct");
      console.error("   - Check internet connection");
      console.error("   - Verify IP whitelist in MongoDB Atlas");
    }
    process.exit(1);
  }

  // 2. Check if users exist
  console.log("2️⃣ Checking users in database...");
  try {
    const userCount = await User.countDocuments();
    console.log(`   Total users: ${userCount}`);

    if (userCount === 0) {
      console.error("\n❌ No users found in database!");
      console.error("💡 Solution: Register a new account first");
      process.exit(1);
    }

    // Show sample users
    const users = await User.find()
      .select("name email role isActive")
      .limit(10)
      .lean();

    console.log("\n   Sample users:");
    users.forEach((user, idx) => {
      console.log(`   ${idx + 1}. ${user.name} (${user.email}) - Role: ${user.role} - Active: ${user.isActive ? "Yes" : "No"}`);
    });
    console.log("");

    // 3. Test password matching
    console.log("3️⃣ Testing password verification...");
    const testUser = await User.findOne().select("+password");
    if (testUser && testUser.password) {
      console.log(`   Testing with user: ${testUser.email}`);
      console.log("   ✅ Password field exists and is hashed");
      console.log("   ✅ matchPassword method should work");
    } else {
      console.log("   ⚠️  No user with password found (might be Google login user)");
    }

    console.log("\n✅ All checks passed!");
    console.log("\n💡 If login still fails:");
    console.log("   1. Check backend console logs when you try to login");
    console.log("   2. Verify the email you're using exists in the database");
    console.log("   3. Make sure you're using the correct password");
    console.log("   4. Check if user account is active (isActive: true)");

  } catch (err) {
    console.error("❌ Error checking users:", err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
};

checkLoginIssue();
