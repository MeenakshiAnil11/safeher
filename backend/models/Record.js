import mongoose from "mongoose";

const RecordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ["prescription", "lab", "imaging", "discharge", "other"],
    default: "other"
  },
  fileUrl: { type: String, required: true },
  takenAt: { type: Date },
  notes: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Record", RecordSchema);
