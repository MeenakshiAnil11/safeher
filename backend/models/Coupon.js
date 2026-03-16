import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minimumOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    maximumDiscount: {
      type: Number,
      default: null, // For percentage discounts, limit max discount amount
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicableTo: {
      type: String,
      enum: ["all", "category", "product"],
      default: "all",
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EcommerceCategory",
      },
    ],
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, expiryDate: 1 });

// Method to check if coupon is valid
couponSchema.methods.isValid = function (orderValue = 0) {
  // Check if active
  if (!this.isActive) {
    return { valid: false, message: "Coupon is not active" };
  }

  // Check if expired
  if (new Date() > this.expiryDate) {
    return { valid: false, message: "Coupon has expired" };
  }

  // Check if not started yet
  if (new Date() < this.startDate) {
    return { valid: false, message: "Coupon is not yet active" };
  }

  // Check usage limit
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, message: "Coupon usage limit reached" };
  }

  // Check minimum order value
  if (orderValue < this.minimumOrderValue) {
    return {
      valid: false,
      message: `Minimum order value of ₹${this.minimumOrderValue} required`,
    };
  }

  return { valid: true };
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function (orderValue) {
  if (this.discountType === "percentage") {
    const discount = (orderValue * this.discountValue) / 100;
    if (this.maximumDiscount) {
      return Math.min(discount, this.maximumDiscount);
    }
    return discount;
  } else {
    // Flat discount
    return Math.min(this.discountValue, orderValue);
  }
};

// Method to increment usage
couponSchema.methods.incrementUsage = async function () {
  this.usedCount += 1;
  await this.save();
};

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
