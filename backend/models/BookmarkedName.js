// backend/models/BookmarkedName.js
import mongoose from "mongoose";

const BookmarkedNameSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  gender: { 
    type: String, 
    enum: ["boy", "girl", "unisex"],
    required: true
  },
  meaning: { type: String, required: true },
  origin: { type: String, required: true },
  pronunciation: { type: String },
  notes: { type: String }, // User can add personal notes
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

BookmarkedNameSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("BookmarkedName", BookmarkedNameSchema);
