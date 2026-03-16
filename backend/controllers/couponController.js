import Coupon from "../models/Coupon.js";

// GET /api/coupons/admin/all - Get all coupons (Admin only)
export const getAllCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;

    const query = {};
    if (status === "active") {
      query.isActive = true;
      query.expiryDate = { $gte: new Date() };
    } else if (status === "inactive") {
      query.isActive = false;
    } else if (status === "expired") {
      query.expiryDate = { $lt: new Date() };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const coupons = await Coupon.find(query)
      .populate("categories", "name slug")
      .populate("products", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Coupon.countDocuments(query);

    res.json({
      coupons,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("getAllCoupons error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/coupons/admin/:id - Get single coupon (Admin only)
export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id)
      .populate("categories", "name slug")
      .populate("products", "name")
      .lean();

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json({ coupon });
  } catch (error) {
    console.error("getCouponById error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/coupons/admin - Create new coupon (Admin only)
export const createCoupon = async (req, res) => {
  try {
    const couponData = req.body;

    // Comprehensive validation
    const errors = [];

    // Validate code
    if (!couponData.code || !couponData.code.trim()) {
      errors.push("Coupon code is required");
    } else {
      const code = couponData.code.trim().toUpperCase();
      if (code.length < 3) {
        errors.push("Coupon code must be at least 3 characters");
      } else if (code.length > 20) {
        errors.push("Coupon code must not exceed 20 characters");
      } else if (!/^[A-Z0-9_-]+$/.test(code)) {
        errors.push("Coupon code can only contain letters, numbers, hyphens, and underscores");
      }
    }

    // Validate discount type
    if (!couponData.discountType) {
      errors.push("Discount type is required");
    } else if (!["percentage", "flat"].includes(couponData.discountType)) {
      errors.push("Discount type must be either 'percentage' or 'flat'");
    }

    // Validate discount value
    if (!couponData.discountValue) {
      errors.push("Discount value is required");
    } else {
      const discountValue = parseFloat(couponData.discountValue);
      if (isNaN(discountValue) || discountValue <= 0) {
        errors.push("Discount value must be a positive number");
      } else {
        if (couponData.discountType === "percentage") {
          if (discountValue > 100) {
            errors.push("Percentage discount cannot exceed 100%");
          }
        } else if (couponData.discountType === "flat") {
          if (discountValue > 100000) {
            errors.push("Flat discount cannot exceed ₹1,00,000");
          }
        }
      }
    }

    // Validate expiry date
    if (!couponData.expiryDate) {
      errors.push("Expiry date is required");
    } else {
      const expiryDate = new Date(couponData.expiryDate);
      if (isNaN(expiryDate.getTime())) {
        errors.push("Invalid expiry date format");
      } else if (expiryDate < new Date()) {
        errors.push("Expiry date must be in the future");
      }
    }

    // Validate start date if provided
    if (couponData.startDate) {
      const startDate = new Date(couponData.startDate);
      if (isNaN(startDate.getTime())) {
        errors.push("Invalid start date format");
      } else if (couponData.expiryDate && startDate > new Date(couponData.expiryDate)) {
        errors.push("Start date must be before expiry date");
      }
    }

    // Validate minimum order value
    if (couponData.minimumOrderValue !== undefined && couponData.minimumOrderValue !== null) {
      const minOrderValue = parseFloat(couponData.minimumOrderValue);
      if (isNaN(minOrderValue) || minOrderValue < 0) {
        errors.push("Minimum order value must be a non-negative number");
      }
    }

    // Validate maximum discount (for percentage coupons)
    if (couponData.maximumDiscount !== undefined && couponData.maximumDiscount !== null) {
      if (couponData.discountType !== "percentage") {
        errors.push("Maximum discount is only applicable for percentage discounts");
      } else {
        const maxDiscount = parseFloat(couponData.maximumDiscount);
        if (isNaN(maxDiscount) || maxDiscount <= 0) {
          errors.push("Maximum discount must be a positive number");
        }
      }
    }

    // Validate usage limit
    if (couponData.usageLimit !== undefined && couponData.usageLimit !== null) {
      const usageLimit = parseInt(couponData.usageLimit);
      if (isNaN(usageLimit) || usageLimit < 1) {
        errors.push("Usage limit must be a positive integer (minimum 1)");
      } else if (usageLimit > 1000000) {
        errors.push("Usage limit cannot exceed 1,000,000");
      }
    }

    // Validate applicableTo
    if (couponData.applicableTo && !["all", "category", "product"].includes(couponData.applicableTo)) {
      errors.push("Applicable to must be one of: all, category, product");
    }

    // Validate description length
    if (couponData.description && couponData.description.length > 500) {
      errors.push("Description must not exceed 500 characters");
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors 
      });
    }

    // Check if code already exists
    const code = couponData.code.trim().toUpperCase();
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    // Ensure isActive defaults to true if not provided (so coupons are usable by users)
    if (couponData.isActive === undefined) {
      couponData.isActive = true;
    }

    // Normalize code to uppercase
    couponData.code = couponData.code.toUpperCase().trim();

    const coupon = await Coupon.create(couponData);

    const populatedCoupon = await Coupon.findById(coupon._id)
      .populate("categories", "name slug")
      .populate("products", "name")
      .lean();

    res.status(201).json({
      message: "Coupon created successfully",
      coupon: populatedCoupon,
    });
  } catch (error) {
    console.error("createCoupon error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/coupons/admin/:id - Update coupon (Admin only)
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    // Comprehensive validation for updates
    const errors = [];

    // Validate code if being updated
    if (updateData.code !== undefined) {
      if (!updateData.code || !updateData.code.trim()) {
        errors.push("Coupon code cannot be empty");
      } else {
        const code = updateData.code.trim().toUpperCase();
        if (code.length < 3) {
          errors.push("Coupon code must be at least 3 characters");
        } else if (code.length > 20) {
          errors.push("Coupon code must not exceed 20 characters");
        } else if (!/^[A-Z0-9_-]+$/.test(code)) {
          errors.push("Coupon code can only contain letters, numbers, hyphens, and underscores");
        } else if (code !== coupon.code) {
          // Check uniqueness only if code is being changed
          const existingCoupon = await Coupon.findOne({ code });
          if (existingCoupon) {
            errors.push("Coupon code already exists");
          }
        }
      }
    }

    // Validate discount type if being updated
    if (updateData.discountType !== undefined && !["percentage", "flat"].includes(updateData.discountType)) {
      errors.push("Discount type must be either 'percentage' or 'flat'");
    }

    // Validate discount value if being updated
    if (updateData.discountValue !== undefined) {
      const discountValue = parseFloat(updateData.discountValue);
      if (isNaN(discountValue) || discountValue <= 0) {
        errors.push("Discount value must be a positive number");
      } else {
        const discountType = updateData.discountType || coupon.discountType;
        if (discountType === "percentage" && discountValue > 100) {
          errors.push("Percentage discount cannot exceed 100%");
        } else if (discountType === "flat" && discountValue > 100000) {
          errors.push("Flat discount cannot exceed ₹1,00,000");
        }
      }
    }

    // Validate expiry date if being updated
    if (updateData.expiryDate !== undefined) {
      const expiryDate = new Date(updateData.expiryDate);
      if (isNaN(expiryDate.getTime())) {
        errors.push("Invalid expiry date format");
      } else if (expiryDate < new Date()) {
        errors.push("Expiry date must be in the future");
      }
    }

    // Validate start date if being updated
    if (updateData.startDate !== undefined) {
      const startDate = new Date(updateData.startDate);
      if (isNaN(startDate.getTime())) {
        errors.push("Invalid start date format");
      } else {
        const expiryDate = updateData.expiryDate ? new Date(updateData.expiryDate) : coupon.expiryDate;
        if (startDate > expiryDate) {
          errors.push("Start date must be before expiry date");
        }
      }
    }

    // Validate minimum order value if being updated
    if (updateData.minimumOrderValue !== undefined && updateData.minimumOrderValue !== null) {
      const minOrderValue = parseFloat(updateData.minimumOrderValue);
      if (isNaN(minOrderValue) || minOrderValue < 0) {
        errors.push("Minimum order value must be a non-negative number");
      }
    }

    // Validate maximum discount if being updated
    if (updateData.maximumDiscount !== undefined && updateData.maximumDiscount !== null) {
      const discountType = updateData.discountType || coupon.discountType;
      if (discountType !== "percentage") {
        errors.push("Maximum discount is only applicable for percentage discounts");
      } else {
        const maxDiscount = parseFloat(updateData.maximumDiscount);
        if (isNaN(maxDiscount) || maxDiscount <= 0) {
          errors.push("Maximum discount must be a positive number");
        }
      }
    }

    // Validate usage limit if being updated
    if (updateData.usageLimit !== undefined && updateData.usageLimit !== null) {
      const usageLimit = parseInt(updateData.usageLimit);
      if (isNaN(usageLimit) || usageLimit < 1) {
        errors.push("Usage limit must be a positive integer (minimum 1)");
      } else if (usageLimit > 1000000) {
        errors.push("Usage limit cannot exceed 1,000,000");
      }
    }

    // Validate description length if being updated
    if (updateData.description !== undefined && updateData.description.length > 500) {
      errors.push("Description must not exceed 500 characters");
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors 
      });
    }

    // Normalize code if being updated
    if (updateData.code) {
      updateData.code = updateData.code.trim().toUpperCase();
    }

    Object.assign(coupon, updateData);
    await coupon.save();

    const populatedCoupon = await Coupon.findById(coupon._id)
      .populate("categories", "name slug")
      .populate("products", "name")
      .lean();

    res.json({
      message: "Coupon updated successfully",
      coupon: populatedCoupon,
    });
  } catch (error) {
    console.error("updateCoupon error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/coupons/admin/:id - Delete coupon (Admin only)
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("deleteCoupon error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/coupons/admin/:id/toggle - Toggle coupon active status (Admin only)
export const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json({
      message: `Coupon ${coupon.isActive ? "activated" : "deactivated"} successfully`,
      coupon,
    });
  } catch (error) {
    console.error("toggleCouponStatus error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========== PUBLIC ROUTES ==========

// POST /api/coupons/validate - Validate and apply coupon (Public)
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderValue = 0 } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    // Ensure coupon is active before validating (extra check for clarity)
    if (!coupon.isActive) {
      return res.status(400).json({ message: "This coupon is not currently active" });
    }

    // Validate coupon (this also checks isActive, but we check explicitly for clarity)
    const validation = coupon.isValid(orderValue);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    // Calculate discount
    const discount = coupon.calculateDiscount(orderValue);

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
      },
      discount: discount.toFixed(2),
    });
  } catch (error) {
    console.error("validateCoupon error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
