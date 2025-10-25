import mongoose from "mongoose";

const VitalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recordedAt: { type: Date, required: true },
  weightKg: { type: Number },
  heightCm: { type: Number },
  systolic: { type: Number },
  diastolic: { type: Number },
  heartRateBpm: { type: Number },
  bmi: { type: Number },
  bloodSugar: { type: Number },
  bloodSugarNotes: { type: String, trim: true },
  ironLevel: { type: Number },
  ironLevelNotes: { type: String, trim: true },
  cholesterol: { type: Number },
  cholesterolNotes: { type: String, trim: true },
  notes: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Vital", VitalSchema);