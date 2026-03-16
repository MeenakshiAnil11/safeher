// backend/models/Vaccination.js
import mongoose from "mongoose";

const VaccinationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  date: { type: Date, required: true },
  nextDue: { type: Date }, // Next vaccination due date
  doctor: { type: String },
  notes: { type: String },
  reminder: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

VaccinationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Vaccination", VaccinationSchema);