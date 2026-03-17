import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ["info", "warning", "danger"],
      default: "info",
      index: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    resolved: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

AlertSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model("Alert", AlertSchema);
