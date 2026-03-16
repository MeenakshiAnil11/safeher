import Subscription from "../models/Subscription.js";

const premiumOnly = async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ userId: req.userId });
    if (!sub || sub.status !== "active" || sub.planType === "free") {
      return res.status(403).json({
        success: false,
        message: "Premium subscription required",
        requiresSubscription: true
      });
    }
    if (sub.endDate && sub.endDate < new Date()) {
      sub.status = "expired";
      await sub.save();
      return res.status(403).json({
        success: false,
        message: "Subscription expired",
        requiresSubscription: true
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export default premiumOnly;
