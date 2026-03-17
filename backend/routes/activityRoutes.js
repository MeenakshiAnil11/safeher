import express from "express";
import { protect } from "../middleware/auth.js";
import { createActivityEvent, getUserActivityTimeline } from "../controllers/activityController.js";

const router = express.Router();

router.use(protect);
router.post("/log", createActivityEvent);
router.get("/:userId", getUserActivityTimeline);

export default router;
