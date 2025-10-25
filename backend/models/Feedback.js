import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: String,
  category: { type: String, enum: ["Bug", "Suggestion", "Other"], default: "Other" },
  message: String,
  rating: Number,
  screenshotUrl: String,
  status: { type: String, enum: ["New", "Reviewed", "In Progress", "Resolved", "Escalated"], default: "New" },
  adminReply: String,
  updatedByUser: { type: Boolean, default: false },
  upvotes: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, timestamp: { type: Date, default: Date.now } }]
}, { timestamps: true });

export default mongoose.model("Feedback", FeedbackSchema);
