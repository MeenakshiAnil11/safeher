import mongoose from "mongoose";

const draftSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    isQuestion: {
      type: Boolean,
      default: false,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumPost",
      default: null, // If editing existing post
    },
  },
  { timestamps: true }
);

draftSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Draft", draftSchema);
