import express from "express";
import {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  validateCoupon,
} from "../controllers/couponController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Public route - validate coupon
router.post("/validate", validateCoupon);

// Admin routes - require authentication and admin role
router.get("/admin/all", protect, adminOnly, getAllCoupons);
router.get("/admin/:id", protect, adminOnly, getCouponById);
router.post("/admin", protect, adminOnly, createCoupon);
router.put("/admin/:id", protect, adminOnly, updateCoupon);
router.delete("/admin/:id", protect, adminOnly, deleteCoupon);
router.put("/admin/:id/toggle", protect, adminOnly, toggleCouponStatus);

export default router;
