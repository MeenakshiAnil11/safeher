import mongoose from "mongoose";

const HelplineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  region: { type: String },
  category: {
    type: String,
    enum: ["police", "ambulance", "women", "ngo", "other"],
    default: "other",
  },
  notes: { type: String },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Helpline", HelplineSchema);
