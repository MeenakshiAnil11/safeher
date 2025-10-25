import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import periodRoutes from "./routes/periodRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; 
import healthRoutes from "./routes/healthRoutes.js";

// ✅ ADD THIS
import feedbackRoutes from "./routes/feedback.js";
import educationalContentRoutes from "./routes/educationalContentRoutes.js";

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Only parse JSON for non-GET requests 
app.use((req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD") return next();
  return express.json()(req, res, next);
});

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/periods", periodRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin", adminRoutes); 
app.use("/api/health", healthRoutes);

// ✅ ADD THIS LINE BELOW YOUR OTHER ROUTES
app.use("/api/feedback", feedbackRoutes);
app.use("/api/educational-content", educationalContentRoutes);

// Public + user routes for helplines/resources
import helplineRoutes from "./routes/helplineRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import sosRoutes from "./routes/sosRoutes.js";
app.use("/api/helplines", helplineRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/sos", sosRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({ ok: true, from: "backend" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
