import mongoose from "mongoose";

const ExerciseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional for admin-created exercises
  name: { type: String }, // for admin-managed exercises
  phase: { type: String }, // e.g., menstrual phase
  category: { type: String },
  difficulty: { type: String },
  approved: { type: Boolean, default: false },
  videoLink: { type: String }, // YouTube video link
  type: { type: String, enum: ['Yoga', 'Running', 'Walking', 'Strength Training', 'Cycling', 'Others'] },
  duration: { type: Number }, // minutes
  intensity: { type: String, enum: ['Low', 'Medium', 'High'] },
  caloriesBurned: { type: Number },
  notes: { type: String },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt on save
ExerciseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Exercise", ExerciseSchema);
