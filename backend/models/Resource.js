import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  url: { type: String },
  category: { type: String },
  region: { type: String },
  type: { type: String, enum: ["Article", "Guide", "Video", "PDF", "Checklist", "External Link"], default: "Article" },
  lang: [{ type: String }], // Array of languages like ["en", "hi"]
  tags: [{ type: String }], // Array of tags
  source: {
    name: { type: String },
    url: { type: String }
  },
  approved: { type: Boolean, default: false },
  verified: { type: Boolean, default: false }, // Separate from approved for admin verification
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  filePath: { type: String }, // For uploaded files
  downloadCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field on save
ResourceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Resource", ResourceSchema);
