// backend/config/db.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Prevents deprecation warnings in newer Mongoose
    mongoose.set("strictQuery", true);

    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not set in environment variables");
      throw new Error("MONGO_URI environment variable is required");
    }

    console.log("🔄 Attempting to connect to MongoDB...");
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
    });

  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    
    if (err.message.includes("ENOTFOUND") || err.message.includes("getaddrinfo")) {
      console.error("\n🔍 Troubleshooting:");
      console.error("1. Check your internet connection");
      console.error("2. Verify MongoDB Atlas cluster is running (not paused)");
      console.error("3. Check if the cluster hostname is correct in MONGO_URI");
      console.error("4. Verify IP whitelist in MongoDB Atlas Network Access");
    }
    
    // Don't exit immediately - allow server to start but log the error
    // This way the server can still run and show helpful error messages
    console.error("\n⚠️  Server will continue but database operations will fail until connection is restored.");
  }
};

export default connectDB;
