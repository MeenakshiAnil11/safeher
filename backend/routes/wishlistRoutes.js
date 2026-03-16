import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../controllers/wishlistController.js";

const router = express.Router();

router.get("/", protect, getWishlist);
router.post("/toggle/:productId", protect, toggleWishlist);
router.delete("/:productId", protect, removeFromWishlist);
router.delete("/", protect, clearWishlist);

export default router;
