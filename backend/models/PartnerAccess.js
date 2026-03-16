// backend/models/PartnerAccess.js
import mongoose from "mongoose";

const PartnerAccessSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  accessToken: { type: String, required: true, unique: true },
  partnerName: { type: String, required: true },
  partnerEmail: { type: String },
  permissions: {
    viewProgress: { type: Boolean, default: true },
    viewLogs: { type: Boolean, default: true },
    viewAppointments: { type: Boolean, default: true },
    viewMessages: { type: Boolean, default: true },
    receiveNotifications: { type: Boolean, default: true }
  },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date },
  lastAccessed: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

PartnerAccessSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("PartnerAccess", PartnerAccessSchema);
