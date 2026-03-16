import express from "express";
import { protect } from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";
import { uploadProductImages } from "../middleware/upload.js";
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  upvotePost,
  downvotePost,
  bookmarkPost,
  getMyPosts,
  getBookmarkedPosts,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  upvoteComment,
  verifyComment,
  pinPost,
  lockPost,
  reportContent,
  getReports,
  resolveReport,
  searchPosts,
  getCategories,
  getTrendingPosts,
  getForumStats,
  getAllPostsAdmin,
  getAllCommentsAdmin,
  bulkDeletePosts,
  bulkDeleteComments,
  getUserForumActivity,
} from "../controllers/forumController.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import {
  addPostReaction,
  removePostReaction,
  getPostReactions,
} from "../controllers/reactionController.js";
import {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getUserStatus,
} from "../controllers/followBlockController.js";
import {
  getDrafts,
  getDraftById,
  saveDraft,
  deleteDraft,
} from "../controllers/draftController.js";

const router = express.Router();

// Public routes
router.get("/posts", getPosts);
router.get("/categories", getCategories);
router.get("/trending", getTrendingPosts);
router.get("/search", searchPosts);
router.get("/posts/:postId/comments", getComments);

// Protected routes (require authentication)
// IMPORTANT: These specific routes must come before /posts/:id to avoid route conflicts
router.get("/posts/my-posts", protect, getMyPosts);
router.get("/posts/bookmarked", protect, getBookmarkedPosts);
router.get("/posts/:id", getPostById);
router.post("/posts", protect, uploadProductImages, createPost);
router.put("/posts/:id", protect, uploadProductImages, updatePost);
router.delete("/posts/:id", protect, deletePost);
router.post("/posts/:id/upvote", protect, upvotePost);
router.post("/posts/:id/downvote", protect, downvotePost);
router.post("/posts/:id/bookmark", protect, bookmarkPost);

// Comments (protected)
router.post("/posts/:postId/comments", protect, createComment);
router.put("/comments/:id", protect, updateComment);
router.delete("/comments/:id", protect, deleteComment);
router.post("/comments/:id/upvote", protect, upvoteComment);
router.post("/comments/:id/verify", protect, verifyComment);

// Reports (protected)
router.post("/report", protect, reportContent);

// Admin routes (require admin authentication)
router.post("/posts/:id/pin", protect, adminAuth, pinPost);
router.post("/posts/:id/lock", protect, adminAuth, lockPost);
router.get("/reports", protect, adminAuth, getReports);
router.put("/reports/:id/resolve", protect, adminAuth, resolveReport);

// Admin management routes
router.get("/admin/stats", protect, adminAuth, getForumStats);
router.get("/admin/posts", protect, adminAuth, getAllPostsAdmin);
router.get("/admin/comments", protect, adminAuth, getAllCommentsAdmin);
router.post("/admin/posts/bulk-delete", protect, adminAuth, bulkDeletePosts);
router.post("/admin/comments/bulk-delete", protect, adminAuth, bulkDeleteComments);
router.get("/admin/users/:userId/activity", protect, adminAuth, getUserForumActivity);

// Notifications (protected)
router.get("/notifications", protect, getNotifications);
router.put("/notifications/:id/read", protect, markAsRead);
router.put("/notifications/read-all", protect, markAllAsRead);
router.delete("/notifications/:id", protect, deleteNotification);

// Reactions (protected)
router.post("/posts/:id/reactions", protect, addPostReaction);
router.delete("/posts/:id/reactions", protect, removePostReaction);
router.get("/posts/:id/reactions", getPostReactions);

// Follow/Block (protected)
router.post("/follow/:userId", protect, followUser);
router.delete("/follow/:userId", protect, unfollowUser);
router.get("/following", protect, getFollowing);
router.get("/followers", protect, getFollowers);
router.post("/block/:userId", protect, blockUser);
router.delete("/block/:userId", protect, unblockUser);
router.get("/blocked", protect, getBlockedUsers);
router.get("/users/:userId/status", protect, getUserStatus);

// Drafts (protected)
router.get("/drafts", protect, getDrafts);
router.get("/drafts/:id", protect, getDraftById);
router.post("/drafts", protect, saveDraft);
router.delete("/drafts/:id", protect, deleteDraft);

export default router;
