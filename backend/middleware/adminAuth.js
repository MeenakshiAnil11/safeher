import User from "../models/User.js";

const adminAuth = async (req, res, next) => {
  try {
    const userId = req.userId; // set by your existing JWT auth middleware
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findById(userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Account deactivated" });
    }

    req.admin = user; // store admin user for later
    next();
  } catch (err) {
    console.error("adminAuth error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export default adminAuth;
