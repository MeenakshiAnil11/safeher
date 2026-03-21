import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      maxlength: 200,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String },
      },
    ],
    image: {
      type: String,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EcommerceCategory",
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String },
        isApproved: { type: Boolean, default: true }, // Auto-approve by default, admin can moderate
        isHidden: { type: Boolean, default: false }, // Hide from public view
        moderationReason: { type: String }, // Reason for hiding/rejecting
        moderatedAt: { type: Date },
        moderatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    tags: [String],
    features: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    specifications: {
      type: Map,
      of: String,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    weight: {
      type: Number,
      min: 0,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    // Health-specific fields
    healthBenefits: {
      type: [String],
      default: [],
    },
    usageInstructions: {
      type: String,
      default: "",
    },
    safetyInformation: {
      warnings: { type: [String], default: [] },
      precautions: { type: [String], default: [] },
      contraindications: { type: [String], default: [] },
      sideEffects: { type: [String], default: [] },
    },
    ingredients: {
      type: [String],
      default: [],
    },
    expiryDate: {
      type: Date,
    },
    manufacturer: {
      name: String,
      address: String,
      license: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better search performance
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isBestSeller: 1 });
productSchema.index({ "rating.average": -1 });
// Compound index for common query pattern: category + isActive
productSchema.index({ category: 1, isActive: 1 });
// Compound index for category + price sorting
productSchema.index({ category: 1, price: 1 });
// Compound index for category + rating
productSchema.index({ category: 1, "rating.average": -1 });

// Virtual for discount percentage
productSchema.virtual("discountPercentage").get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return this.discount || 0;
});

// Method to calculate average rating (only from approved, visible reviews)
productSchema.methods.updateRating = function () {
  const approvedReviews = this.reviews.filter(
    (review) => review.isApproved && !review.isHidden
  );
  
  if (approvedReviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
    return;
  }
  
  const sum = approvedReviews.reduce((acc, review) => acc + review.rating, 0);
  this.rating.average = parseFloat((sum / approvedReviews.length).toFixed(1));
  this.rating.count = approvedReviews.length;
};

const Product = mongoose.model("Product", productSchema);

export default Product;
