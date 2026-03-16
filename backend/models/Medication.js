// backend/models/Medication.js
import mongoose from "mongoose";

const MedicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  dosage: { type: String },
  frequency: { 
    type: String, 
    enum: ["daily", "twice_daily", "three_times", "weekly", "as_needed"],
    default: "daily"
  },
  times: [{ type: String }], // Array of times like ["08:00", "20:00"]
  startDate: { type: Date, required: true },
  endDate: { type: Date }, // Optional end date
  notes: { type: String },
  reminder: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

MedicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Medication", MedicationSchema);
