import mongoose from "mongoose";

const SafetyPlaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["police", "hospital", "cafe"],
      required: true,
      index: true,
    },
    address: { type: String, default: "" },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    phone: { type: String, default: "" },
    isSafeCafe: { type: Boolean, default: false },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

SafetyPlaceSchema.index({ "coordinates.lat": 1, "coordinates.lng": 1 });

export default mongoose.model("SafetyPlace", SafetyPlaceSchema);
