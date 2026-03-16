import express from "express";
import TelehealthNotification from "../models/TelehealthNotification.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// Get notifications for current user
router.get("/", async (req, res) => {
  try {
    const { limit = 50, unreadOnly } = req.query;
    const query = { user: req.user.id };
    if (unreadOnly === "true") query.isRead = false;

    const notifications = await TelehealthNotification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    const unreadCount = await TelehealthNotification.countDocuments({
      user: req.user.id,
      isRead: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark one as read
router.put("/:id/read", async (req, res) => {
  try {
    const notification = await TelehealthNotification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Not found" });
    res.json({ notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all as read
router.put("/read-all", async (req, res) => {
  try {
    await TelehealthNotification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ message: "All marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete one
router.delete("/:id", async (req, res) => {
  try {
    await TelehealthNotification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
