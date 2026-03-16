import Product from "../models/Product.js";

// GET /api/reviews/admin/all - Get all reviews across all products (Admin only)
export const getAllReviews = async (req, res) => {
  try {
    const { status, rating, productId, page = 1, limit = 50 } = req.query;

    // Build query to find products with reviews
    const productQuery = {};
    if (productId) {
      productQuery._id = productId;
    }

    const products = await Product.find(productQuery)
      .populate("reviews.userId", "name email")
      .populate("reviews.moderatedBy", "name")
      .select("name images rating reviews")
      .lean();

    // Flatten reviews with product info
    let allReviews = [];
    products.forEach((product) => {
      product.reviews.forEach((review) => {
        allReviews.push({
          ...review,
          product: {
            _id: product._id,
            name: product.name,
            images: product.images,
            rating: product.rating,
          },
        });
      });
    });

    // Filter by status
    if (status === "approved") {
      allReviews = allReviews.filter((r) => r.isApproved && !r.isHidden);
    } else if (status === "pending") {
      allReviews = allReviews.filter((r) => !r.isApproved && !r.isHidden);
    } else if (status === "hidden") {
      allReviews = allReviews.filter((r) => r.isHidden);
    } else if (status === "rejected") {
      allReviews = allReviews.filter((r) => !r.isApproved);
    }

    // Filter by rating
    if (rating) {
      allReviews = allReviews.filter((r) => r.rating === Number(rating));
    }

    // Sort by date (newest first)
    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const total = allReviews.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginatedReviews = allReviews.slice(skip, skip + Number(limit));

    res.json({
      reviews: paginatedReviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("getAllReviews error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/reviews/admin/stats - Get review statistics (Admin only)
export const getReviewStats = async (req, res) => {
  try {
    const products = await Product.find()
      .select("name rating reviews")
      .lean();

    let totalReviews = 0;
    let approvedReviews = 0;
    let pendingReviews = 0;
    let hiddenReviews = 0;
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const productRatings = [];

    products.forEach((product) => {
      const approved = product.reviews.filter((r) => r.isApproved && !r.isHidden);
      const pending = product.reviews.filter((r) => !r.isApproved && !r.isHidden);
      const hidden = product.reviews.filter((r) => r.isHidden);

      totalReviews += product.reviews.length;
      approvedReviews += approved.length;
      pendingReviews += pending.length;
      hiddenReviews += hidden.length;

      // Rating distribution
      approved.forEach((review) => {
        ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1;
      });

      // Product ratings summary
      if (approved.length > 0) {
        productRatings.push({
          productId: product._id,
          productName: product.name,
          averageRating: product.rating?.average || 0,
          reviewCount: approved.length,
          totalReviews: product.reviews.length,
        });
      }
    });

    // Sort products by review count
    productRatings.sort((a, b) => b.reviewCount - a.reviewCount);

    res.json({
      stats: {
        totalReviews,
        approvedReviews,
        pendingReviews,
        hiddenReviews,
        averageRating:
          approvedReviews > 0
            ? (
                (ratingDistribution[5] * 5 +
                  ratingDistribution[4] * 4 +
                  ratingDistribution[3] * 3 +
                  ratingDistribution[2] * 2 +
                  ratingDistribution[1] * 1) /
                approvedReviews
              ).toFixed(2)
            : 0,
      },
      ratingDistribution,
      topProducts: productRatings.slice(0, 10), // Top 10 products by review count
    });
  } catch (error) {
    console.error("getReviewStats error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/reviews/admin/:productId/:reviewIndex/approve - Approve review (Admin only)
export const approveReview = async (req, res) => {
  try {
    const { productId, reviewIndex } = req.params;
    const userId = req.userId;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = product.reviews[reviewIndex];
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.isApproved = true;
    review.isHidden = false;
    review.moderationReason = undefined;
    review.moderatedAt = new Date();
    review.moderatedBy = userId;

    // Update product rating
    product.updateRating();
    await product.save();

    const updatedProduct = await Product.findById(productId)
      .populate("reviews.userId", "name email")
      .select("reviews rating")
      .lean();

    res.json({
      message: "Review approved successfully",
      review: updatedProduct.reviews[reviewIndex],
    });
  } catch (error) {
    console.error("approveReview error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/reviews/admin/:productId/:reviewIndex/hide - Hide review (Admin only)
export const hideReview = async (req, res) => {
  try {
    const { productId, reviewIndex } = req.params;
    const { reason } = req.body;
    const userId = req.userId;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = product.reviews[reviewIndex];
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.isHidden = true;
    review.moderationReason = reason || "Hidden by admin";
    review.moderatedAt = new Date();
    review.moderatedBy = userId;

    // Update product rating
    product.updateRating();
    await product.save();

    const updatedProduct = await Product.findById(productId)
      .populate("reviews.userId", "name email")
      .select("reviews rating")
      .lean();

    res.json({
      message: "Review hidden successfully",
      review: updatedProduct.reviews[reviewIndex],
    });
  } catch (error) {
    console.error("hideReview error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/reviews/admin/:productId/:reviewIndex - Delete review (Admin only)
export const deleteReview = async (req, res) => {
  try {
    const { productId, reviewIndex } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!product.reviews[reviewIndex]) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Remove review
    product.reviews.splice(reviewIndex, 1);

    // Update product rating
    product.updateRating();
    await product.save();

    res.json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("deleteReview error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/reviews/admin/product/:productId - Get all reviews for a specific product (Admin only)
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .populate("reviews.userId", "name email")
      .populate("reviews.moderatedBy", "name")
      .select("name reviews rating")
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      product: {
        _id: product._id,
        name: product.name,
        rating: product.rating,
      },
      reviews: product.reviews,
    });
  } catch (error) {
    console.error("getProductReviews error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
