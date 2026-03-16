import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const DangerZoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    zoneType: {
      type: String,
      enum: ["circle", "polygon"],
      default: "circle",
    },
    center: pointSchema,
    radius: { type: Number, default: 500 }, // meters
    polygon: { type: [pointSchema], default: [] },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    source: {
      type: String,
      enum: ["admin", "community", "system"],
      default: "admin",
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("DangerZone", DangerZoneSchema);
