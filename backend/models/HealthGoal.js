import mongoose from "mongoose";

const HealthGoalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { 
    type: String, 
    required: true,
    enum: ["weight", "blood_pressure", "exercise", "sleep", "nutrition", "steps", "meditation"]
  },
  title: { type: String, required: true },
  description: { type: String },
  targetValue: { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  unit: { type: String, default: "" }, // kg, minutes, hours, etc.
  deadline: { type: Date },
  status: { 
    type: String, 
    enum: ["active", "completed", "paused"],
    default: "active"
  },
  progress: { type: Number, default: 0, min: 0, max: 100 }, // percentage
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

HealthGoalSchema.pre('save', function(next) {
  // Calculate progress percentage
  if (this.targetValue && this.targetValue > 0) {
    this.progress = Math.min(100, Math.max(0, (this.currentValue / this.targetValue) * 100));
  }
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("HealthGoal", HealthGoalSchema);

