import ActivityLog from "../models/ActivityLog.js";
import { createActivityLog } from "../services/activityLogService.js";

export const getUserActivityTimeline = async (req, res) => {
  try {
    const requestedUserId = req.params.userId === "me" ? String(req.userId) : String(req.params.userId);
    const requesterUserId = String(req.userId);
    if (requestedUserId !== requesterUserId && req.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to view this activity timeline" });
    }

    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const events = await ActivityLog.find({ userId: requestedUserId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return res.json({ events });
  } catch (error) {
    console.error("getUserActivityTimeline error:", error);
    return res.status(500).json({ message: "Failed to fetch activity timeline" });
  }
};

export const createActivityEvent = async (req, res) => {
  try {
    const { eventType, description, timestamp, location } = req.body || {};
    if (!eventType || !description) {
      return res.status(400).json({ message: "eventType and description are required" });
    }

    const log = await createActivityLog({
      userId: req.userId,
      eventType,
      description,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      location,
    });

    return res.status(201).json({ log });
  } catch (error) {
    console.error("createActivityEvent error:", error);
    return res.status(500).json({ message: "Failed to create activity log" });
  }
};
