// backend/routes/authRoutes.js
import express from "express";
import { body, validationResult } from "express-validator";
import {
  register,
  login,
  me,
  getSettings,
  updateSettings,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/auth.js";

// ✅ Firebase Admin + User model + JWT
import admin from "../utils/firebaseAdmin.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Test endpoint to check if body parsing works
router.post("/test-body", (req, res) => {
  console.log("Test body endpoint - Request body:", req.body);
  res.json({ received: req.body, bodyType: typeof req.body });
});

// Diagnostic endpoint to check database and users
router.get("/diagnostics", async (req, res) => {
  try {
    const mongoose = (await import("mongoose")).default;
    const User = (await import("../models/User.js")).default;
    
    const dbStatus = {
      connected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
      readyStateText: ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState] || "unknown",
      host: mongoose.connection.host || "N/A",
      database: mongoose.connection.name || "N/A"
    };
    
    let userCount = 0;
    let sampleUsers = [];
    
    if (dbStatus.connected) {
      try {
        userCount = await User.countDocuments();
        sampleUsers = await User.find().select("name email role isActive").limit(5).lean();
      } catch (err) {
        console.error("Error querying users:", err);
      }
    }
    
    res.json({
      database: dbStatus,
      users: {
        count: userCount,
        sample: sampleUsers
      },
      message: dbStatus.connected 
        ? `Database connected. Found ${userCount} user(s).` 
        : "Database not connected. Check MongoDB connection."
    });
  } catch (err) {
    res.status(500).json({ 
      error: err.message,
      message: "Error checking diagnostics"
    });
  }
});

// Check if a specific user exists (for debugging)
router.get("/check-user/:email", async (req, res) => {
  try {
    const mongoose = (await import("mongoose")).default;
    const User = (await import("../models/User.js")).default;
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        exists: false,
        message: "Database not connected",
        error: "DATABASE_CONNECTION_ERROR"
      });
    }
    
    const email = req.params.email.toLowerCase().trim();
    const user = await User.findOne({ email }).select("name email role isActive createdAt").lean();
    
    res.json({
      exists: !!user,
      email: email,
      user: user || null,
      message: user 
        ? `User found: ${user.name} (${user.email})` 
        : `No user found with email: ${email}`
    });
  } catch (err) {
    res.status(500).json({ 
      exists: false,
      error: err.message,
      message: "Error checking user"
    });
  }
});

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  console.log("🔍 Validation check for:", req.path);
  console.log("Request method:", req.method);
  console.log("Request body:", req.body);
  console.log("Request body type:", typeof req.body);
  console.log("Email:", req.body?.email);
  console.log("Password:", req.body?.password ? "***" : "missing");
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("❌ Validation errors:", JSON.stringify(errors.array(), null, 2));
    const errorMessages = errors.array().map(err => err.msg || err.message || "Validation error").join(", ");
    return res.status(400).json({
      message: errorMessages || "Validation failed",
      errors: errors.array(),
    });
  }
  console.log("✅ Validation passed");
  next();
};

/* -------------------- REGISTER -------------------- */
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("phone").notEmpty().withMessage("Phone number is required"),
    body("dateOfBirth").notEmpty().withMessage("Date of birth is required"),
  ],
  handleValidationErrors,
  register
);

/* -------------------- LOGIN -------------------- */
router.post(
  "/login",
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Valid email required")
      .normalizeEmail(),
    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],
  handleValidationErrors,
  login
);

/* -------------------- FORGOT PASSWORD -------------------- */
router.post("/forgot-password", forgotPassword);

/* -------------------- RESET PASSWORD -------------------- */
router.post("/reset-password", resetPassword);

/* -------------------- PROTECTED USER ROUTES -------------------- */
router.get("/me", protect, me);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.get("/settings", protect, getSettings);
router.put("/settings", protect, updateSettings);

/* -------------------- ADMIN ROUTES -------------------- */
router.get("/admin/dashboard", protect, adminOnly, (req, res) => {
  res.json({ message: "Welcome Admin" });
});

/* -------------------- GOOGLE SIGN-IN -------------------- */
router.post("/google", async (req, res) => {
  try {
    if (!admin?.apps?.length) {
      return res.status(503).json({ message: "Google login not configured on server" });
    }

    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "ID token missing" });

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    let user = await User.findOne({ email });
    if (!user) {
      // Check if email should be admin or doctor (you can add DOCTOR_EMAILS env var similar to ADMIN_EMAILS)
      const role = isAdminEmail(email) ? "admin" : "user";
      user = new User({
        email,
        name: name || email.split("@")[0],
        role,
        avatar: picture || "",
        provider: "google",
        googleUid: uid,
      });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      message: "Google login successful",
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(401).json({ message: "Invalid Google token" });
  }
});

export default router;
