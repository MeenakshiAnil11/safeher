import mongoose from "mongoose";

const ExternalDirectorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Government Resources", "NGO Directory"
  type: { type: String, enum: ["Government", "NGO", "International", "Private"], required: true },
  description: { type: String },
  url: { type: String, required: true },
  region: { type: String }, // e.g., "India", "Global"
  order: { type: Number, default: 0 }, // For sorting
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field on save
ExternalDirectorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("ExternalDirectory", ExternalDirectorySchema);