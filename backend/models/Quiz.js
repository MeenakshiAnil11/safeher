import mongoose from "mongoose";

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ["Quiz", "Assessment", "Survey"], default: "Quiz" },
  url: { type: String }, // Link to quiz engine or external quiz
  category: { type: String }, // e.g., "Mental Health", "Safety", etc.
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field on save
QuizSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Quiz", QuizSchema);