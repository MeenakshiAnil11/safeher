import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  requestReturnRefund,
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
  updatePaymentStatus,
  decideReturnRefund,
  generateInvoice,
} from "../controllers/orderController.js";

const router = express.Router();

// User routes - require authentication
router.post("/", protect, createOrder);
router.get("/", protect, getOrders);
// Invoice route must come before /:id route to avoid route conflicts
router.get("/:id/invoice", protect, generateInvoice);
router.get("/:id", protect, getOrderById);
router.put("/:id/cancel", protect, cancelOrder);
router.put("/:id/return-request", protect, requestReturnRefund);

// Admin routes - require authentication and admin role
router.get("/admin/all", protect, adminOnly, getAllOrders);
router.get("/admin/:id", protect, adminOnly, getOrderByIdAdmin);
router.put("/admin/:id/status", protect, adminOnly, updateOrderStatus);
router.put("/admin/:id/payment-status", protect, adminOnly, updatePaymentStatus);
router.put("/admin/:id/return-decision", protect, adminOnly, decideReturnRefund);

export default router;
