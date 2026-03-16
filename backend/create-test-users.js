// backend/create-test-users.js
// Create test users for admin, doctor, and regular user

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./models/User.js";

const createTestUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB\n");

    const users = [
      {
        name: "Admin User",
        email: "admin@example.com",
        password: "Admin123!",
        phone: "1234567890",
        dateOfBirth: new Date("1990-01-01"),
        role: "admin",
      },
      {
        name: "Doctor User",
        email: "doctor@example.com",
        password: "Doctor123!",
        phone: "1234567891",
        dateOfBirth: new Date("1985-05-15"),
        role: "doctor",
      },
      {
        name: "Regular User",
        email: "user@example.com",
        password: "User123!",
        phone: "1234567892",
        dateOfBirth: new Date("1995-03-20"),
        role: "user",
      },
    ];

    console.log("🔨 Creating test users...\n");

    for (const userData of users) {
      try {
        // Check if user exists
        let user = await User.findOne({ email: userData.email });
        
        if (user) {
          console.log(`⚠️  User ${userData.email} already exists. Updating...`);
          // Update password if needed
          user.password = userData.password;
          await user.save();
          console.log(`   ✅ Updated user: ${userData.email} (Role: ${userData.role})`);
        } else {
          // Create new user
          user = await User.create(userData);
          console.log(`   ✅ Created user: ${userData.email} (Role: ${userData.role})`);
        }

        // Verify password works
        const isMatch = await user.matchPassword(userData.password);
        if (isMatch) {
          console.log(`   ✅ Password verification: SUCCESS\n`);
        } else {
          console.log(`   ❌ Password verification: FAILED\n`);
        }
      } catch (err) {
        console.error(`   ❌ Error creating user ${userData.email}:`, err.message);
        if (err.errors) {
          Object.keys(err.errors).forEach(key => {
            console.error(`      - ${key}: ${err.errors[key].message}`);
          });
        }
        console.log("");
      }
    }

    console.log("\n📊 Summary:");
    const allUsers = await User.find().select("name email role isActive").lean();
    console.log(`   Total users: ${allUsers.length}`);
    allUsers.forEach((u, idx) => {
      console.log(`   ${idx + 1}. ${u.name} (${u.email}) - Role: ${u.role} - Active: ${u.isActive ? "Yes" : "No"}`);
    });

    await mongoose.connection.close();
    console.log("\n✅ Done! You can now login with:");
    console.log("   Admin: admin@example.com / Admin123!");
    console.log("   Doctor: doctor@example.com / Doctor123!");
    console.log("   User: user@example.com / User123!");
  } catch (err) {
    console.error("❌ Error:", err.message);
    if (err.message.includes("ENOTFOUND") || err.message.includes("getaddrinfo")) {
      console.error("\n💡 MongoDB connection failed. Check:");
      console.error("   1. MongoDB Atlas cluster is running (not paused)");
      console.error("   2. MONGO_URI in .env is correct");
      console.error("   3. Internet connection is working");
      console.error("   4. IP whitelist in MongoDB Atlas");
    }
    process.exit(1);
  }
};

createTestUsers();
