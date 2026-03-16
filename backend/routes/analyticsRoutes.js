import express from "express";
import {
  getSalesByCategory,
  getMonthlyRevenue,
  getBestSellingProducts,
  getLowPerformingProducts,
  getRevenueTrend,
  getOrderTrend,
  getAnalyticsSummary,
  getCustomerActivity,
} from "../controllers/analyticsController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// All analytics routes require authentication and admin role
router.get("/admin/sales-by-category", protect, adminOnly, getSalesByCategory);
router.get("/admin/monthly-revenue", protect, adminOnly, getMonthlyRevenue);
router.get("/admin/best-selling", protect, adminOnly, getBestSellingProducts);
router.get("/admin/low-performing", protect, adminOnly, getLowPerformingProducts);
router.get("/admin/revenue-trend", protect, adminOnly, getRevenueTrend);
router.get("/admin/order-trend", protect, adminOnly, getOrderTrend);
router.get("/admin/summary", protect, adminOnly, getAnalyticsSummary);
router.get("/admin/customer-activity", protect, adminOnly, getCustomerActivity);

export default router;
