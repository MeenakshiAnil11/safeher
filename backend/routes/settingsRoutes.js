import express from "express";
import { protect } from "../middleware/auth.js";
import { getSettings, updateSettings } from "../controllers/settingsController.js";

const router = express.Router();

// @route   GET /api/settings
// @desc    Get user settings
// @access  Private
router.get("/", protect, getSettings);

// @route   PUT /api/settings
// @desc    Update user settings
// @access  Private
router.put("/", protect, updateSettings);

export default router;
