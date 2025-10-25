import express from "express";
import multer from "multer";
import Feedback from "../models/Feedback.js";
import { protect, adminOnly } from "../middleware/auth.js";
import firebaseAdmin from "../services/firebaseAdmin.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// --- USER: Submit feedback ---
router.post("/", protect, upload.single("screenshot"), async (req, res) => {
  try {
    const { subject, category, message, rating } = req.body;
    const screenshotUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const feedback = await Feedback.create({
      userId: req.userId,
      subject,
      category,
      message,
      rating,
      screenshotUrl
    });

    // Always return a single object
    res.status(201).json({ feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- USER: Update feedback ---
router.put("/:id", protect, async (req, res) => {
  try {
    const feedback = await Feedback.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId, status: { $nin: ["Resolved", "Escalated"] } },
      { ...req.body, updatedByUser: true },
      { new: true }
    );

    if (!feedback) {
      return res.status(403).json({ error: "Feedback not found or not editable" });
    }

    res.json({ feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- USER: Delete feedback ---
router.delete("/:id", protect, async (req, res) => {
  try {
    const feedback = await Feedback.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
      status: { $nin: ["Resolved", "Escalated"] }
    });

    if (!feedback) {
      return res.status(403).json({ error: "Feedback not found or not deletable" });
    }

    res.json({ message: "Feedback deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- USER: Get own feedback ---
router.get("/my", protect, async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let filter = { userId: req.userId };

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } }
      ];
    }

    const feedbacks = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "name email");

    // Always return array
    res.json({ feedbacks: Array.isArray(feedbacks) ? feedbacks : [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN: Get all feedback ---
router.get("/", [protect, adminOnly], async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { "userId.name": { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } }
      ];
    }

    const feedbacks = await Feedback.find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({ feedbacks: Array.isArray(feedbacks) ? feedbacks : [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN: Reply to feedback ---
router.put("/:id/reply", [protect, adminOnly], async (req, res) => {
  try {
    const { adminReply, status } = req.body;
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { adminReply, status },
      { new: true }
    ).populate("userId");

    res.json({ feedback });

    // Send FCM notification if user has token
    if (feedback?.userId?.fcmToken) {
      const message = {
        notification: {
          title: "Feedback Reply",
          body: `Admin replied to your feedback. Status: ${status}. Reply: ${
            adminReply ? adminReply.substring(0, 100) + "..." : "No reply"
          }`
        },
        token: feedback.userId.fcmToken
      };
      await firebaseAdmin.messaging().send(message);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- USER: Upvote feedback ---
router.post("/:id/upvote", protect, async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      _id: req.params.id,
      upvotes: { $not: { $elemMatch: { userId: req.userId } } }
    });

    if (!feedback) {
      return res.status(400).json({ error: "Feedback not found or already upvoted" });
    }

    const updated = await Feedback.findByIdAndUpdate(
      req.params.id,
      { $push: { upvotes: { userId: req.userId } } },
      { new: true }
    );

    res.json({ upvotesCount: updated.upvotes.length, feedbackId: updated._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
