import mongoose from "mongoose";

const VaccinationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  date: { type: Date, required: true },
  lotNumber: { type: String, trim: true },
  provider: { type: String, trim: true },
  notes: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Vaccination", VaccinationSchema);
