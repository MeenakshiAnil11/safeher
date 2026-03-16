import mongoose from "mongoose";

const UserLocationLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    coords: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    accuracy: { type: Number },
    speed: { type: Number },
    heading: { type: Number },
    source: {
      type: String,
      enum: ["manual", "tracking", "sos"],
      default: "tracking",
    },
    recordedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("UserLocationLog", UserLocationLogSchema);
