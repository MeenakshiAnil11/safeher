import express from "express";
import {
  getAllReviews,
  getReviewStats,
  approveReview,
  hideReview,
  deleteReview,
  getProductReviews,
} from "../controllers/reviewController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Admin routes - require authentication and admin role
router.get("/admin/all", protect, adminOnly, getAllReviews);
router.get("/admin/stats", protect, adminOnly, getReviewStats);
router.get("/admin/product/:productId", protect, adminOnly, getProductReviews);
router.put("/admin/:productId/:reviewIndex/approve", protect, adminOnly, approveReview);
router.put("/admin/:productId/:reviewIndex/hide", protect, adminOnly, hideReview);
router.delete("/admin/:productId/:reviewIndex", protect, adminOnly, deleteReview);

export default router;
