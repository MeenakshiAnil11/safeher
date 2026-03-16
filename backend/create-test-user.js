
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./models/User.js";

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const email = "test@example.com";
    const password = "Password123!";

    let user = await User.findOne({ email });
    if (user) {
      console.log("Test user already exists. Deleting and recreating...");
      await User.deleteOne({ email });
    }

    user = await User.create({
      name: "Test User",
      email: email,
      password: password,
      phone: "1234567890",
      dateOfBirth: new Date("1990-01-01"),
      role: "user"
    });

    console.log("Test user created successfully");

    const isMatch = await user.matchPassword(password);
    console.log("Password match check:", isMatch ? "SUCCESS" : "FAILED");

    await mongoose.connection.close();
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

createTestUser();
