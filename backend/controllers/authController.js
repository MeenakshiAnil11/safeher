// backend/controllers/authController.js
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail } from "../config/mailer.js";

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
    console.log("📝 Register attempt received");
    console.log("Request body:", { 
      name: req.body?.name ? "***" : "missing", 
      email: req.body?.email ? "***" : "missing", 
      phone: req.body?.phone ? "***" : "missing",
      dateOfBirth: req.body?.dateOfBirth ? "***" : "missing",
      password: req.body?.password ? "***" : "missing"
    });

    // Check if MongoDB is connected
    const mongoose = (await import("mongoose")).default;
    const connectionState = mongoose.connection.readyState;
    const stateNames = ["disconnected", "connected", "connecting", "disconnecting"];
    
    console.log("📊 MongoDB Connection State:", connectionState, `(${stateNames[connectionState] || "unknown"})`);
    
    if (connectionState !== 1) {
      console.error("❌ MongoDB not connected. Connection state:", connectionState, `(${stateNames[connectionState] || "unknown"})`);
      console.error("💡 This is why registration is failing. Please check:");
      console.error("   1. MongoDB Atlas cluster is running (not paused)");
      console.error("   2. MONGO_URI in .env is correct");
      console.error("   3. Internet connection is working");
      console.error("   4. IP whitelist in MongoDB Atlas allows your IP");
      return res.status(503).json({ 
        message: "Database connection unavailable. Please check your MongoDB connection and try again.",
        error: "DATABASE_CONNECTION_ERROR",
        connectionState: connectionState,
        connectionStateText: stateNames[connectionState] || "unknown"
      });
    }
    
    console.log("✅ MongoDB is connected");

    const { name, email, password, phone, dateOfBirth } = req.body;

    if (!name || !email || !password || !phone || !dateOfBirth) {
      console.log("⚠️  Missing required fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate dateOfBirth
    const dobDate = new Date(dateOfBirth);
    if (isNaN(dobDate.getTime())) {
      console.log("⚠️  Invalid dateOfBirth format");
      return res.status(400).json({ message: "Invalid date of birth format" });
    }

    const normalizedEmail = (email || "").trim().toLowerCase();
    console.log("🔍 Checking if user exists with email:", normalizedEmail);

    let existingUser;
    try {
      existingUser = await User.findOne({ email: normalizedEmail });
    } catch (dbError) {
      console.error("❌ Database query error during registration:", dbError);
      if (dbError.message && (dbError.message.includes("ENOTFOUND") || dbError.message.includes("getaddrinfo"))) {
        return res.status(503).json({ 
          message: "Database connection error. Please check your internet connection and MongoDB Atlas cluster status.",
          error: "DATABASE_CONNECTION_ERROR"
        });
      }
      throw dbError;
    }

    if (existingUser) {
      console.log("❌ User already exists with email:", normalizedEmail);
      return res.status(400).json({ message: "Email already registered" });
    }

    const role = isAdminEmail(normalizedEmail) ? "admin" : "user";
    console.log("👤 Creating user with role:", role);

    let user;
    try {
      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password, // hashed by model hook
        phone: phone.trim(),
        dateOfBirth: dobDate,
        role,
      });
      console.log("✅ User created successfully with ID:", user._id);
    } catch (createError) {
      console.error("❌ Error creating user:", createError);
      
      // Handle validation errors
      if (createError.name === "ValidationError") {
        const validationErrors = Object.values(createError.errors).map(err => err.message);
        console.error("   Validation errors:", validationErrors);
        return res.status(400).json({ 
          message: "Validation failed",
          errors: validationErrors
        });
      }
      
      // Handle duplicate key error (email already exists)
      if (createError.code === 11000) {
        console.error("   Duplicate email detected");
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Handle database connection errors
      if (createError.message && (createError.message.includes("ENOTFOUND") || createError.message.includes("getaddrinfo"))) {
        return res.status(503).json({ 
          message: "Database connection error. Please check your MongoDB Atlas cluster status and internet connection.",
          error: "DATABASE_CONNECTION_ERROR"
        });
      }
      
      throw createError;
    }

    const token = signToken(user); // ✅ pass full user object

    console.log("✅ Registration successful for:", normalizedEmail);

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
    console.error("❌ Register Error:", err);
    console.error("   Error name:", err.name);
    console.error("   Error message:", err.message);
    console.error("   Error stack:", err.stack);
    
    // Provide more specific error messages
    if (err.message && (err.message.includes("ENOTFOUND") || err.message.includes("getaddrinfo"))) {
      return res.status(503).json({ 
        message: "Database connection error. Please check your MongoDB Atlas cluster status and internet connection.",
        error: "DATABASE_CONNECTION_ERROR"
      });
    }
    
    res.status(500).json({ 
      message: "Server error during registration",
      error: err.message || "Unknown error"
    });
  }
};

// -------------------- LOGIN --------------------
export const login = async (req, res) => {
  try {
    console.log("🔐 Login attempt received");
    console.log("Request body:", { email: req.body?.email ? "***" : "missing", password: req.body?.password ? "***" : "missing" });
    
    // Check if MongoDB is connected
    const mongoose = (await import("mongoose")).default;
    const connectionState = mongoose.connection.readyState;
    const stateNames = ["disconnected", "connected", "connecting", "disconnecting"];
    
    console.log("📊 MongoDB Connection State:", connectionState, `(${stateNames[connectionState] || "unknown"})`);
    
    if (connectionState !== 1) {
      console.error("❌ MongoDB not connected. Connection state:", connectionState, `(${stateNames[connectionState] || "unknown"})`);
      console.error("💡 This is why login is failing. Please check:");
      console.error("   1. MongoDB Atlas cluster is running (not paused)");
      console.error("   2. MONGO_URI in .env is correct");
      console.error("   3. Internet connection is working");
      console.error("   4. IP whitelist in MongoDB Atlas allows your IP");
      return res.status(503).json({ 
        message: "Database connection unavailable. Please check your MongoDB connection and try again.",
        error: "DATABASE_CONNECTION_ERROR",
        connectionState: connectionState,
        connectionStateText: stateNames[connectionState] || "unknown"
      });
    }
    
    console.log("✅ MongoDB is connected");

    const { email, password } = req.body;

    if (!email || !password) {
      console.log("⚠️  Missing email or password");
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = (email || "").trim().toLowerCase();
    console.log("🔍 Searching for user with email:", normalizedEmail);
    console.log("   Original email from request:", email);
    
    let user;
    try {
      // Try exact match first
      user = await User.findOne({ email: normalizedEmail });
      
      // If not found, try case-insensitive regex search (in case of any case issues)
      if (!user) {
        console.log("   ⚠️  Exact match not found, trying case-insensitive search...");
        user = await User.findOne({ 
          email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });
      }
      
      console.log("👤 User found:", user ? `Yes (ID: ${user._id}, Email: ${user.email})` : "No");
    } catch (dbError) {
      console.error("❌ Database query error during login:", dbError);
      if (dbError.message.includes("ENOTFOUND") || dbError.message.includes("getaddrinfo")) {
        return res.status(503).json({ 
          message: "Database connection error. Please check your internet connection and MongoDB Atlas cluster status.",
          error: "DATABASE_CONNECTION_ERROR"
        });
      }
      throw dbError;
    }
    
    if (!user) {
      console.log("❌ User not found with email:", normalizedEmail);
      console.log("💡 Suggestion: The email address may not be registered. Please register first or check your email.");
      return res.status(400).json({ 
        message: "Invalid email or password",
        hint: "Email not found. Please check your email address or register a new account."
      });
    }

    // Block deactivated users
    if (user.isActive === false) {
      console.log("❌ User account is deactivated:", normalizedEmail);
      return res.status(403).json({ message: "Account is deactivated. Contact support." });
    }

    // Check if user has a password (Google login users might not have one)
    if (!user.password) {
      console.log("❌ User has no password set (likely Google login user):", normalizedEmail);
      return res.status(400).json({ 
        message: "This account was created with Google login. Please use Google sign-in.",
        hint: "If you want to set a password, use 'Forgot Password' to reset it."
      });
    }

    console.log("🔐 Verifying password for user:", normalizedEmail);
    console.log("   Password field exists:", !!user.password);
    console.log("   Password length:", user.password?.length || 0);
    
    const isMatch = await user.matchPassword(password);
    
    // If password doesn't match, check if it's stored as plain text (legacy users)
    if (!isMatch && user.password && user.password.length < 60) {
      // Bcrypt hashes are always 60 characters. If shorter, it might be plain text
      console.log("⚠️  Password might be stored as plain text. Attempting direct comparison...");
      if (user.password === password) {
        console.log("✅ Plain text password matches. Hashing and updating...");
        // Hash the password and save
        user.password = password; // This will trigger the pre-save hook to hash it
        await user.save();
        console.log("✅ Password hashed and saved successfully");
      } else {
        console.log("❌ Password mismatch for user:", normalizedEmail);
        console.log("💡 Suggestion: The password is incorrect. Please try again or use 'Forgot Password' to reset.");
        return res.status(400).json({ 
          message: "Invalid email or password",
          hint: "Password is incorrect. Please check your password or use 'Forgot Password' to reset it."
        });
      }
    } else if (!isMatch) {
      console.log("❌ Password mismatch for user:", normalizedEmail);
      console.log("💡 Suggestion: The password is incorrect. Please try again or use 'Forgot Password' to reset.");
      return res.status(400).json({ 
        message: "Invalid email or password",
        hint: "Password is incorrect. Please check your password or use 'Forgot Password' to reset it."
      });
    }
    console.log("✅ Password verified successfully");

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
    
    // Provide more specific error messages
    if (err.message && (err.message.includes("ENOTFOUND") || err.message.includes("getaddrinfo"))) {
      return res.status(503).json({ 
        message: "Database connection error. Please check your MongoDB Atlas cluster status and internet connection.",
        error: "DATABASE_CONNECTION_ERROR"
      });
    }
    
    res.status(500).json({ message: "Server error", error: err.message });
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

// -------------------- FORGOT PASSWORD --------------------
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    // For security, don't reveal if email exists or not
    if (!user) {
      // Return success even if user not found (security best practice)
      return res.json({ 
        message: "If an account exists, a reset link has been sent to your email." 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password/${resetToken}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #EC4899;">🔒 Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>We received a request to reset your password for your SafeHer account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #EC4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; font-size: 12px; word-break: break-all;">${resetUrl}</p>
        <p style="color: #666; font-size: 12px;">This link will expire in 1 hour.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px;">© SafeHer - Your safety is our priority</p>
      </div>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "🔒 Reset Your SafeHer Password",
        html: emailHtml,
      });
      console.log(`✅ Password reset email sent to ${user.email}`);
    } catch (emailError) {
      console.error("❌ Failed to send reset email:", emailError);
      
      // If it's a rate limit error, provide helpful message
      if (emailError.message && emailError.message.includes("Too many emails")) {
        console.log("⚠️ Email rate limit reached. Please wait a few minutes or switch to a real email provider.");
      }
      // Still return success to user for security
    }

    res.json({ 
      message: "If an account exists, a reset link has been sent to your email." 
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- UPDATE PROFILE --------------------
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, dateOfBirth, gender, pregnancy_week, pregnancy_due_date } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    if (name !== undefined && name.trim()) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (dateOfBirth !== undefined) {
      user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    }
    if (gender !== undefined) {
      if (gender === "" || ["Male", "Female", "Other"].includes(gender)) {
        user.gender = gender || undefined;
      }
    }

    // Optional pregnancy onboarding fields
    if (pregnancy_week !== undefined) {
      const week = Number(pregnancy_week);
      if (!Number.isInteger(week) || week < 1 || week > 40) {
        return res.status(400).json({ message: "pregnancy_week must be an integer between 1 and 40" });
      }
      user.pregnancy_week = week;
    }

    if (pregnancy_due_date !== undefined) {
      if (!pregnancy_due_date) {
        user.pregnancy_due_date = undefined;
      } else {
        const dueDate = new Date(pregnancy_due_date);
        if (Number.isNaN(dueDate.getTime())) {
          return res.status(400).json({ message: "pregnancy_due_date must be a valid date" });
        }
        user.pregnancy_due_date = dueDate;
      }
    }

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(req.userId).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- CHANGE PASSWORD --------------------
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has a password (Google login users might not have one)
    if (!user.password) {
      return res.status(400).json({ message: "Password change not available for this account type" });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- RESET PASSWORD --------------------
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful. Please login with your new password." });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
