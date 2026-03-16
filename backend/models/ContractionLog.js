import mongoose from "mongoose";

const ContractionLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true, index: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, required: true },
    durationSeconds: { type: Number, required: true, min: 0 },
    intervalSeconds: { type: Number, default: null, min: 0 },
  },
  {
    timestamps: true,
    collection: "contraction_logs",
  }
);

ContractionLogSchema.index({ user: 1, date: -1, startedAt: -1 });

export default mongoose.model("ContractionLog", ContractionLogSchema);
