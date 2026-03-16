// backend/routes/paymentRoutes.js
import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  createRazorpayOrder,
  initiateUpiPayment,
  verifyRazorpayPayment,
  getAllPayments,
  getPaymentStats,
  getFailedPayments,
  markPaymentResolved,
  getRazorpayPaymentDetails,
} from "../controllers/paymentController.js";

const router = express.Router();

// Public/User routes
router.post("/create-order", protect, createRazorpayOrder);
router.post("/test-order", protect, createRazorpayOrder);
router.post("/upi/initiate", protect, initiateUpiPayment);
router.post("/verify-payment", protect, verifyRazorpayPayment);

// Admin routes - require authentication and admin role
router.get("/admin/all", protect, adminOnly, getAllPayments);
router.get("/admin/stats", protect, adminOnly, getPaymentStats);
router.get("/admin/failed", protect, adminOnly, getFailedPayments);
router.put("/admin/:orderId/mark-resolved", protect, adminOnly, markPaymentResolved);
router.get("/admin/razorpay/:paymentId", protect, adminOnly, getRazorpayPaymentDetails);

export default router;

