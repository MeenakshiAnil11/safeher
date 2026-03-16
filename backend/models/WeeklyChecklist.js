import mongoose from "mongoose";

const ChecklistItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const WeeklyChecklistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    week: { type: Number, required: true, min: 1, max: 40, index: true },
    items: { type: [ChecklistItemSchema], default: [] },
  },
  {
    timestamps: true,
    collection: "weekly_checklists",
  }
);

WeeklyChecklistSchema.index({ user: 1, week: 1 }, { unique: true });

export default mongoose.model("WeeklyChecklist", WeeklyChecklistSchema);
