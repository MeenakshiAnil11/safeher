import mongoose from "mongoose";

const healthMetricSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    steps: { type: Number, default: 0 },
    heartRate: { type: Number, default: 0 },
    spo2: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
    height: { type: Number, default: 0 }, // meters
    bmi: { type: Number, default: 0 },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

healthMetricSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model("HealthMetric", healthMetricSchema);
