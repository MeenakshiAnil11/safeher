// backend/models/BabyName.js
import mongoose from "mongoose";

const BabyNameSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  gender: { 
    type: String, 
    enum: ["boy", "girl", "unisex"],
    required: true
  },
  meaning: { type: String, required: true },
  origin: { type: String, required: true },
  pronunciation: { type: String },
  popularity: { type: Number, min: 1, max: 5, default: 3 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("BabyName", BabyNameSchema);
