import express from "express";
import { body } from "express-validator";
import {
  logPeriod,
  getHistory,
  getPrediction,
  getInsights,
  getCurrentPhase,
  updatePeriod,
  deletePeriod,
  exportCsv,
} from "../controllers/periodController.js";
import { protect, adminOnly } from "../middleware/auth.js"; // ✅ FIXED import

const router = express.Router();

// Log a new period (protected)
router.post(
  "/log",
  protect,
  [
    body("startDate").notEmpty().withMessage("startDate required"),
    body("endDate").notEmpty().withMessage("endDate required"),
  ],
  logPeriod
);

// Get history (protected)
router.get("/history", protect, getHistory);

// Predictions (protected)
router.get("/prediction", protect, getPrediction);

// Insights (protected)
router.get("/insights", protect, getInsights);

// Current phase (protected)
router.get("/current-phase", protect, getCurrentPhase);

// Update a period (protected)
router.put("/:id", protect, updatePeriod);

// Delete a period (only admin can delete other users’ periods)
router.delete("/:id", protect, adminOnly, deletePeriod);

// Export data (protected)
router.get("/export.csv", protect, exportCsv);

export default router;
