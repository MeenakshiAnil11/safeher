import mongoose from "mongoose";

const SafetyAuditReportSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "Community safety audit" },
    latitude: { type: Number, required: true, index: true },
    longitude: { type: Number, required: true, index: true },
    radiusMeters: { type: Number, default: 600 },
    // 0-100 where lower means less safe
    safetyRating: { type: Number, min: 0, max: 100, required: true, index: true },
    source: { type: String, default: "community" },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("SafetyAuditReport", SafetyAuditReportSchema);
