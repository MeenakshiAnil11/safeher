import mongoose from "mongoose";

const MoodLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  mood: { type: String, required: true }, // e.g., "Happy", "Sad", "Neutral", "Anxious"
  symptoms: { type: [String], default: [] }, // array of symptom strings
  notes: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("MoodLog", MoodLogSchema);
