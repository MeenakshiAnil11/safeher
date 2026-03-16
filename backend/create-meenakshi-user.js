// backend/create-meenakshi-user.js
// Create the meenakshianil33@gmail.com user account

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./models/User.js";

const createUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB\n");

    const userData = {
      name: "Meenakshi Anil",
      email: "meenakshianil33@gmail.com",
      password: "Meenakshi123!", // Added ! to meet password requirements
      phone: "1234567890",
      dateOfBirth: new Date("1990-01-01"),
      role: "user",
      isActive: true,
    };

    console.log("🔨 Creating user account...");
    console.log(`   Email: ${userData.email}`);
    console.log(`   Name: ${userData.name}`);
    console.log(`   Role: ${userData.role}\n`);

    // Check if user already exists
    let user = await User.findOne({ email: userData.email.toLowerCase() });
    
    if (user) {
      console.log("⚠️  User already exists. Updating password...");
      user.password = userData.password;
      user.name = userData.name;
      user.isActive = true;
      await user.save();
      console.log("✅ User updated successfully");
    } else {
      user = await User.create(userData);
      console.log("✅ User created successfully");
    }

    // Verify password works
    const isMatch = await user.matchPassword(userData.password);
    if (isMatch) {
      console.log("✅ Password verification: SUCCESS\n");
      console.log("✅ You can now login with:");
      console.log(`   Email: ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
    } else {
      console.log("❌ Password verification: FAILED\n");
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error:", err.message);
    if (err.errors) {
      Object.keys(err.errors).forEach(key => {
        console.error(`   - ${key}: ${err.errors[key].message}`);
      });
    }
    if (err.message.includes("ENOTFOUND") || err.message.includes("getaddrinfo")) {
      console.error("\n💡 MongoDB connection failed. Check your connection.");
    }
    process.exit(1);
  }
};

createUser();
