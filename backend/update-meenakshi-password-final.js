// backend/update-meenakshi-password-final.js
// Update password for meenakshianil33@gmail.com to Meenakshi123

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./models/User.js";

const updatePassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB\n");

    const email = "meenakshianil33@gmail.com";
    // Password must meet requirements: uppercase, lowercase, number, special char, min 8 chars
    // Using Meenakshi123! to meet all requirements
    const newPassword = "Meenakshi123!";

    console.log(`🔍 Finding user: ${email}`);
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    
    if (!user) {
      console.error("❌ User not found!");
      process.exit(1);
    }

    console.log("✅ User found!");
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}\n`);

    console.log(`🔧 Updating password to: ${newPassword}`);
    
    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    // Verify password works
    const updatedUser = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    const isMatch = await updatedUser.matchPassword(newPassword);
    
    if (isMatch) {
      console.log("✅ Password updated and verified successfully!\n");
      console.log("✅ Login credentials:");
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${newPassword}\n`);
      
      // Test via API
      console.log("🧪 Testing login via API...");
      try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: newPassword }),
        });
        const data = await response.json();
        if (response.ok) {
          console.log("✅ API login test: SUCCESS!");
        } else {
          console.log(`⚠️  API login test: ${data.message}`);
        }
      } catch (apiErr) {
        console.log("⚠️  Could not test API (backend might not be running)");
      }
    } else {
      console.log("❌ Password update failed verification");
    }

    await mongoose.connection.close();
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

updatePassword();
