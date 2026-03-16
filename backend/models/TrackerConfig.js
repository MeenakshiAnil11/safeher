import mongoose from "mongoose";

const trackerConfigSchema = new mongoose.Schema(
  {
    moduleKey: {
      type: String,
      required: true,
      enum: ["period", "conceive", "pregnancy", "perimenopause"],
      index: true,
    },
    sectionKey: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    week: {
      type: Number,
      min: 1,
      max: 40,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

trackerConfigSchema.index({ moduleKey: 1, sectionKey: 1, week: 1, createdAt: -1 });

const TrackerConfig = mongoose.model("TrackerConfig", trackerConfigSchema);

export default TrackerConfig;
