import Alert from "../models/Alert.js";

export const getUserAlerts = async (req, res) => {
  try {
    const requestedUserId = req.params.userId === "me" ? String(req.userId) : String(req.params.userId);
    const requesterId = String(req.userId);
    const requesterRole = req.role;

    if (requestedUserId !== requesterId && requesterRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized to view alerts for this user" });
    }

    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const alerts = await Alert.find({ userId: requestedUserId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    res.json({ alerts });
  } catch (error) {
    console.error("getUserAlerts error:", error);
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
};
