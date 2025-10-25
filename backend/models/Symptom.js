import mongoose from "mongoose";

const SymptomSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  tags: [{ type: String }],
  severity: { type: Number, min: 1, max: 5, required: true },
  notes: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Symptom", SymptomSchema);
