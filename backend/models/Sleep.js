import mongoose from "mongoose";

const SleepSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sleepHours: { type: Number, required: true },
  quality: { type: String, required: true, enum: ['Poor', 'Fair', 'Good', 'Excellent'] },
  bedtime: { type: String }, // HH:MM format
  wakeTime: { type: String }, // HH:MM format
  notes: { type: String },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt on save
SleepSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Sleep", SleepSchema);
