import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // using bcryptjs consistently

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 8,
      validate: {
        validator: function (value) {
          if (!value) return true; // allow empty password for Google login users
          // Must contain uppercase, lowercase, number, and special character
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[{\]};:'",.<>/?\\|`~]).{8,}$/.test(
            value
          );
        },
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      },
    },
    phone: { type: String },
    dateOfBirth: { type: Date },
    googleId: { type: String }, // store Google profile ID for Google login

    // Email verification / login code
    emailVerified: { type: Boolean, default: false },
    loginVerificationCode: { type: String },
    loginVerificationExpires: { type: Date },

    // Password reset
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    // Role management (admin support)
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    isActive: { type: Boolean, default: true },

    // Notification & privacy settings
    settings: {
      notifications: {
        enablePeriodReminder: { type: Boolean, default: true },
        enableOvulationReminder: { type: Boolean, default: true },
        reminderDaysBeforePeriod: { type: Number, default: 2 },
        reminderDaysBeforeOvulation: { type: Number, default: 1 },
        email: { type: String, trim: true },
        phone: { type: String, trim: true },
      },
      privacy: {
        enablePinLock: { type: Boolean, default: false },
        pinHash: { type: String },
      },
      locale: { type: String, default: "en" },
    },
  },
  { timestamps: true }
);

// Hash password before save (only if password is provided/modified)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed one
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password || "");
};

// Virtual field to easily check if admin
userSchema.virtual("isAdmin").get(function () {
  return this.role === "admin" || this.role === "superadmin";
});

export default mongoose.model("User", userSchema);
