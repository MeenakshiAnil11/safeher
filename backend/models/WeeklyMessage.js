// backend/models/WeeklyMessage.js
import mongoose from "mongoose";

const WeeklyMessageSchema = new mongoose.Schema({
  week: { type: Number, required: true, min: 1, max: 40 },
  trimester: { 
    type: String, 
    enum: ["first", "second", "third"],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  emoji: { type: String, required: true },
  tip: { type: String, required: true },
  color: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

WeeklyMessageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("WeeklyMessage", WeeklyMessageSchema);
