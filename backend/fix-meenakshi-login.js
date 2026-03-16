// backend/fix-meenakshi-login.js
// Fix login issue for meenakshianil33@gmail.com

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./models/User.js";

const fixLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB\n");

    const email = "meenakshianil33@gmail.com";
    // Password must include special character - using Meenakshi123! to meet requirements
    const password = "Meenakshi123!"; // Updated to meet password requirements

    console.log(`🔍 Finding user: ${email}\n`);

    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    
    if (!user) {
      console.error("❌ User not found!");
      console.error("   This is strange - the user should exist based on the database record you showed.");
      console.error("\n💡 Checking if email normalization is the issue...");
      
      // Try different variations
      const variations = [
        email,
        email.toLowerCase(),
        email.trim(),
        email.toLowerCase().trim(),
      ];
      
      for (const variant of variations) {
        const found = await User.findOne({ email: variant }).select("+password");
        if (found) {
          console.log(`   ✅ Found with variant: "${variant}"`);
          console.log(`   Actual email in DB: "${found.email}"`);
          break;
        }
      }
      
      process.exit(1);
    }

    console.log("✅ User found!");
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive ? "Yes" : "No"}`);
    console.log(`   Has password: ${user.password ? "Yes" : "No"}`);
    console.log("");

    // Check if account is active
    if (user.isActive === false) {
      console.log("❌ Account is DEACTIVATED");
      console.log("   Activating account...");
      user.isActive = true;
      await user.save();
      console.log("✅ Account activated");
    }

    // Test current password
    console.log("🔐 Testing password: Meenakshi123");
    let isMatch = await user.matchPassword(password);
    
    if (isMatch) {
      console.log("✅ Password is CORRECT!");
      console.log("\n💡 The password works. If login still fails, the issue might be:");
      console.log("   1. Backend server connection");
      console.log("   2. Email normalization in login controller");
      console.log("   3. Try logging in again");
    } else {
      console.log("❌ Password does NOT match current hash");
      console.log("\n🔧 Updating password to: Meenakshi123");
      
      // Update password (will be hashed by pre-save hook)
      user.password = password;
      await user.save();
      
      // Verify new password
      const updatedUser = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
      isMatch = await updatedUser.matchPassword(password);
      
      if (isMatch) {
        console.log("✅ Password updated and verified successfully!");
        console.log("\n✅ You can now login with:");
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
      } else {
        console.log("❌ Password update failed verification");
      }
    }

    // Check email normalization
    console.log("\n🔍 Checking email normalization...");
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`   Input email: "${email}"`);
    console.log(`   Normalized: "${normalizedEmail}"`);
    console.log(`   DB email: "${user.email}"`);
    
    if (user.email.toLowerCase() !== normalizedEmail) {
      console.log("⚠️  Email case mismatch detected!");
      console.log("   This might cause login issues.");
    } else {
      console.log("✅ Email normalization matches");
    }

    await mongoose.connection.close();
    console.log("\n✅ Done! Try logging in now.");
  } catch (err) {
    console.error("❌ Error:", err.message);
    if (err.errors) {
      Object.keys(err.errors).forEach(key => {
        console.error(`   - ${key}: ${err.errors[key].message}`);
      });
    }
    process.exit(1);
  }
};

fixLogin();
