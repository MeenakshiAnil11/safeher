import mongoose from "mongoose";

const PeriodSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  duration: { type: Number, default: 0 }, // in days
  intensity: { type: String, enum: ["light", "medium", "heavy"], default: "medium" },
  notes: { type: String, trim: true },
  mood: { type: String, trim: true },
  symptoms: { type: [String], default: [] },
  // Optional health vitals placeholders
  basalBodyTemperatureC: { type: Number },
  restingHeartRateBpm: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

// compute duration before save
PeriodSchema.pre("save", function (next) {
  const msDay = 24 * 60 * 60 * 1000;
  const dur = Math.round((this.endDate - this.startDate) / msDay) + 1;
  this.duration = dur > 0 ? dur : 1;
  next();
});

export default mongoose.model("Period", PeriodSchema);
