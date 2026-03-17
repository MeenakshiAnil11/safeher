import mongoose from "mongoose";

const UserLocationLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    coords: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    accuracy: { type: Number },
    speed: { type: Number },
    heading: { type: Number },
    source: {
      type: String,
      enum: ["manual", "tracking", "sos"],
      default: "tracking",
    },
    riskScore: { type: Number, min: 0, max: 100, default: 0 },
    riskLevel: {
      type: String,
      enum: ["Safe", "Moderate", "High Risk"],
      default: "Safe",
    },
    riskRecommendation: { type: String, default: "" },
    riskFactors: {
      nightTime: { type: Boolean, default: false },
      farFromSafeZone: { type: Boolean, default: false },
      lowCommunitySafety: { type: Boolean, default: false },
      poorGps: { type: Boolean, default: false },
    },
    recordedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("UserLocationLog", UserLocationLogSchema);
