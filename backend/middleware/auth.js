// backend/middleware/auth.js
import jwt from "jsonwebtoken";

// -------------------- PROTECT ROUTE --------------------
import User from "../models/User.js";

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;   // ✅ user ID from token
    req.role = decoded.role;   // ✅ role from token

    // Fetch user from DB and attach to req.user
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// -------------------- ADMIN ONLY --------------------
const adminOnly = (req, res, next) => {
  if (req.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized: Admin access only" });
  }
  next();
};

export { protect, adminOnly };
