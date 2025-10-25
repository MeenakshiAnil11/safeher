// backend/controllers/authController.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Utility: sign JWT with role
const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role }, // ✅ include role
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

// Helper: check if an email should be admin based on env ADMIN_EMAILS
const isAdminEmail = (email) => {
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes((email || "").toLowerCase());
};

// -------------------- REGISTER --------------------
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth } = req.body;

    if (!name || !email || !password || !phone || !dateOfBirth) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const role = isAdminEmail(email) ? "admin" : "user";

    const user = await User.create({
      name,
      email,
      password, // hashed by model hook
      phone,
      dateOfBirth,
      role,
    });

    const token = signToken(user); // ✅ pass full user object

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        createdAt: user.createdAt,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- LOGIN --------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Block deactivated users
    if (user.isActive === false) {
      return res.status(403).json({ message: "Account is deactivated. Contact support." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Auto-promote to admin if email is in ADMIN_EMAILS (useful for first admin)
    if (isAdminEmail(user.email) && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    const token = signToken(user); // ✅ pass full user object (with updated role if changed)

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        createdAt: user.createdAt,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- GET PROFILE (ME) --------------------
export const me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user }); // ✅ role included automatically
  } catch (err) {
    console.error("Me Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- SETTINGS --------------------
export const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.settings || {});
  } catch (err) {
    console.error("GetSettings Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const updates = req.body || {};
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { settings: updates } },
      { new: true }
    ).lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Settings saved", settings: user.settings || {} });
  } catch (err) {
    console.error("UpdateSettings Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
