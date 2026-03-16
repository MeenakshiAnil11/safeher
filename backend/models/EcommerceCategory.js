import mongoose from "mongoose";

const ecommerceCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
    },
    image: {
      url: { type: String },
      alt: { type: String },
    },
    icon: {
      type: String, // emoji or icon class name
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EcommerceCategory",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    meta: {
      title: String,
      description: String,
      keywords: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
ecommerceCategorySchema.index({ slug: 1 });
ecommerceCategorySchema.index({ parentCategory: 1 });
ecommerceCategorySchema.index({ displayOrder: 1 });

// Virtual for subcategories
ecommerceCategorySchema.virtual("subcategories", {
  ref: "EcommerceCategory",
  localField: "_id",
  foreignField: "parentCategory",
});

const EcommerceCategory = mongoose.model("EcommerceCategory", ecommerceCategorySchema);

export default EcommerceCategory;
