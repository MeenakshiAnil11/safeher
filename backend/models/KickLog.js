import mongoose from "mongoose";

const KickLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true, index: true },
    count: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    collection: "kick_logs",
  }
);

KickLogSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("KickLog", KickLogSchema);
