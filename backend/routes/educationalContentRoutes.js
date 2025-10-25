import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getTips,
  createTip,
  updateTip,
  deleteTip,
  trackTopicView,
  trackTopicClick,
  trackSearchQuery,
  trackLinkClick,
  getAnalytics,
  getPendingApprovals,
  approveTopic,
  rejectTopic,
  submitUserContent
} from "../controllers/educationalContentController.js";

const router = express.Router();

// -------------------- PUBLIC ROUTES --------------------
// Submit user content for approval (authenticated users)
router.post("/topics/submit", protect, submitUserContent);

// Track analytics (no auth required)
router.post("/topics/:id/track-view", trackTopicView);
router.post("/topics/:id/track-click", trackTopicClick);
router.post("/topics/:id/track-link-click", trackLinkClick);
router.post("/topics/track-search", trackSearchQuery);

// Public read access for approved content
router.get("/topics", getTopics);
router.get("/topics/:id", getTopic);
router.get("/tips", getTips);

// -------------------- ADMIN PROTECTED ROUTES --------------------
router.use(protect, adminOnly);

// -------------------- TOPIC ROUTES --------------------
router.post("/topics", createTopic);
router.put("/topics/:id", updateTopic);
router.delete("/topics/:id", deleteTopic);

// -------------------- TIP ROUTES --------------------
router.post("/tips", createTip);
router.put("/tips/:id", updateTip);
router.delete("/tips/:id", deleteTip);

// -------------------- ANALYTICS ROUTES --------------------
router.get("/analytics", getAnalytics);

// -------------------- CONTENT APPROVAL & MODERATION --------------------
router.get("/approvals/pending", getPendingApprovals);
router.post("/approvals/:id/approve", approveTopic);
router.post("/approvals/:id/reject", rejectTopic);

// -------------------- CATEGORY ROUTES --------------------
router.get("/categories", getCategories);
router.get("/categories/:id", getCategory);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

export default router;
