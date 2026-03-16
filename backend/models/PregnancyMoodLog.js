import mongoose from "mongoose";

const PregnancyMoodLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true, index: true },
    mood: {
      type: String,
      enum: ["happy", "neutral", "stressed", "tired"],
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "mood_logs",
  }
);

PregnancyMoodLogSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("PregnancyMoodLog", PregnancyMoodLogSchema);
