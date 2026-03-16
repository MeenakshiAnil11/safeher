import express from "express";
import {
  getCategories,
  getCategoryBySlug,
  getAllCategoriesAdmin,
  getCategoryByIdAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getCategories);
router.get("/:slug", getCategoryBySlug);

// Admin routes - require authentication and admin role
router.get("/admin/all", protect, adminOnly, getAllCategoriesAdmin);
router.get("/admin/:id", protect, adminOnly, getCategoryByIdAdmin);
router.post("/admin", protect, adminOnly, createCategory);
router.put("/admin/:id", protect, adminOnly, updateCategory);
router.delete("/admin/:id", protect, adminOnly, deleteCategory);

export default router;
