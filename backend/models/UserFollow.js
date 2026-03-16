import mongoose from "mongoose";

const userFollowSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String, // If following a category instead of user
      default: null,
    },
  },
  { timestamps: true }
);

// Ensure unique follower-following pairs
userFollowSchema.index({ follower: 1, following: 1 }, { unique: true });
userFollowSchema.index({ follower: 1 });
userFollowSchema.index({ following: 1 });

export default mongoose.model("UserFollow", userFollowSchema);
