import mongoose from "mongoose";

const forumPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "period-cycle-health",
        "pregnancy-conception",
        "perimenopause-menopause",
        "mental-health-wellness",
        "general-health-questions",
        "product-reviews-recommendations",
        "anonymous-support",
      ],
      default: "general-health-questions",
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
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    verifiedAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    editedAt: {
      type: Date,
    },
    editCount: {
      type: Number,
      default: 0,
    },
    reactions: {
      type: Map,
      of: Number, // reaction emoji -> count
      default: {},
    },
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    isSensitive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for search
forumPostSchema.index({ title: "text", content: "text", tags: "text" });
forumPostSchema.index({ category: 1, createdAt: -1 });
forumPostSchema.index({ author: 1 });
forumPostSchema.index({ isPinned: -1, createdAt: -1 });

export default mongoose.model("ForumPost", forumPostSchema);
