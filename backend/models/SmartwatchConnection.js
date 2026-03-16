import mongoose from "mongoose";

const smartwatchConnectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    provider: {
      type: String,
      default: "google_fit",
      enum: ["google_fit"],
    },
    accessToken: { type: String, required: true },
    refreshToken: { type: String },
    tokenExpiryDate: { type: Date },
    scopes: [{ type: String }],
    connected: { type: Boolean, default: true },
    connectedAt: { type: Date, default: Date.now },
    lastSyncAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("SmartwatchConnection", smartwatchConnectionSchema);
