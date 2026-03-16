import mongoose from "mongoose";

const userBlockSchema = new mongoose.Schema(
  {
    blocker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blocked: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: ["harassment", "spam", "inappropriate", "other"],
      default: "other",
    },
  },
  { timestamps: true }
);

// Ensure unique blocker-blocked pairs
userBlockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });
userBlockSchema.index({ blocker: 1 });
userBlockSchema.index({ blocked: 1 });

export default mongoose.model("UserBlock", userBlockSchema);
