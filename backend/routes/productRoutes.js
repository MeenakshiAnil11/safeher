import express from "express";
import { protect } from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";
import { uploadProductImages } from "../middleware/upload.js";
import {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getBestSellers,
  addReview,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/bestsellers", getBestSellers);
router.get("/search", searchProducts);
router.get("/:id", getProductById);

// Protected routes
router.post("/:id/reviews", protect, addReview);

// Admin routes (protected + admin only)
router.post("/", protect, adminAuth, uploadProductImages, createProduct);
router.put("/:id", protect, adminAuth, uploadProductImages, updateProduct);
router.delete("/:id", protect, adminAuth, deleteProduct);

export default router;
