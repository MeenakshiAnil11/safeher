// backend/config/db.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Prevents deprecation warnings in newer Mongoose
    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
