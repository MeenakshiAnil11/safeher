import mongoose from "mongoose";

const postReactionSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumPost",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reaction: {
      type: String,
      enum: ["👍", "❤️", "😂", "😮", "😢", "🙏"],
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure one reaction per user per post (user can change reaction)
postReactionSchema.index({ post: 1, user: 1 }, { unique: true });
postReactionSchema.index({ post: 1, reaction: 1 });

export default mongoose.model("PostReaction", postReactionSchema);
