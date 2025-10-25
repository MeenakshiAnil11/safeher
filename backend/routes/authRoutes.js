// backend/routes/authRoutes.js
import express from "express";
import { body } from "express-validator";
import {
  register,
  login,
  me,
  getSettings,
  updateSettings,
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/auth.js";

// ✅ Firebase Admin + User model + JWT
import admin from "../utils/firebaseAdmin.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

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
  register
);

/* -------------------- LOGIN -------------------- */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

/* -------------------- PROTECTED USER ROUTES -------------------- */
router.get("/me", protect, me);
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
      user = new User({
        email,
        name: name || email.split("@")[0],
        role: "user",
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
