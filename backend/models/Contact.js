import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    number: { type: String, required: true }, // phone number
    relationship: { type: String, default: "" },
    email: { type: String, default: "" },
    fcmToken: { type: String, default: "" }, // Firebase Cloud Messaging token
    notes: { type: String, default: "" },
    priority: {
      type: String,
      enum: ["primary", "secondary", "emergency"],
      default: "secondary",
      index: true,
    },
    notificationChannels: {
      sms: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
    otpVerification: {
      enabled: { type: Boolean, default: false },
      isVerified: { type: Boolean, default: false },
      otpCode: { type: String, default: "" },
      otpExpiresAt: { type: Date, default: null },
      verifiedAt: { type: Date, default: null },
    },
    sosAcknowledgement: {
      status: {
        type: String,
        enum: ["pending", "acknowledged"],
        default: "pending",
      },
      acknowledgedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Contact", ContactSchema);