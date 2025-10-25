import mongoose from "mongoose";

const SOSLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  coords: {
    lat: { type: Number },
    lng: { type: Number },
  },
  address: { type: String },
  message: { type: String },
  status: { type: String, enum: ["open", "handled", "closed"], default: "open" },
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("SOSLog", SOSLogSchema);
