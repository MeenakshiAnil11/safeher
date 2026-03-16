// backend/models/PregnancyResource.js
import mongoose from "mongoose";

const PregnancyResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["article", "video", "faq"],
    required: true
  },
  trimester: { 
    type: String, 
    enum: ["first", "second", "third"],
    required: true
  },
  isPaid: { type: Boolean, default: false },
  thumbnail: { type: String },
  snippet: { type: String, required: true },
  content: { type: String }, // For articles, this is the full text. For videos, this is the URL
  readTime: { type: String }, // For articles
  duration: { type: String }, // For videos
  questions: [{ // For FAQs
    q: { type: String, required: true },
    a: { type: String, required: true }
  }],
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

PregnancyResourceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("PregnancyResource", PregnancyResourceSchema);
