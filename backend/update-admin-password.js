// backend/update-admin-password.js
// Update admin password to match what user is trying

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

    const email = "admin@example.com";
    const newPassword = "Admin@123"; // The password user is trying to use

    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`❌ User ${email} not found`);
      process.exit(1);
    }

    console.log(`📝 Updating password for: ${email}`);
    console.log(`   Current role: ${user.role}`);
    
    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    // Verify password works
    const isMatch = await user.matchPassword(newPassword);
    if (isMatch) {
      console.log(`✅ Password updated and verified successfully!\n`);
      console.log(`✅ You can now login with:`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${newPassword}`);
    } else {
      console.log(`❌ Password update failed verification`);
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

updatePassword();
