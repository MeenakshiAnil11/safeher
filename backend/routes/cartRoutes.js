import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
} from "../controllers/cartController.js";

const router = express.Router();

// All cart routes require authentication
router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.put("/update", protect, updateCartItem);
router.delete("/remove/:itemId", protect, removeFromCart);
router.delete("/clear", protect, clearCart);
router.post("/apply-coupon", protect, applyCoupon);
router.delete("/remove-coupon", protect, removeCoupon);

export default router;
