import mongoose from "mongoose";

const GeoFenceEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    safeZone: { type: mongoose.Schema.Types.ObjectId, ref: "SafeZone" },
    dangerZone: { type: mongoose.Schema.Types.ObjectId, ref: "DangerZone", index: true },
    eventType: {
      type: String,
      enum: [
        "entered_safe_zone",
        "left_safe_zone",
        "entered_danger_zone",
        "left_danger_zone",
      ],
      required: true,
      index: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("GeoFenceEvent", GeoFenceEventSchema);
