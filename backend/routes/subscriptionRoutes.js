import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getSubscriptionStatus,
  subscribe,
  cancelSubscription,
  upgradePlan,
  getBillingHistory,
  applyCoupon,
  createSubscriptionOrder,
  verifySubscriptionPayment
} from "../controllers/subscriptionController.js";

const router = express.Router();

router.get("/status", protect, getSubscriptionStatus);
router.post("/subscribe", protect, subscribe);
router.post("/cancel", protect, cancelSubscription);
router.post("/upgrade", protect, upgradePlan);
router.get("/billing-history", protect, getBillingHistory);
router.post("/apply-coupon", protect, applyCoupon);
router.post("/create-order", protect, createSubscriptionOrder);
router.post("/verify-payment", protect, verifySubscriptionPayment);

export default router;
