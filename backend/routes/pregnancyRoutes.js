// backend/routes/pregnancyRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { 
  getCurrentPregnancyWeek,
  getPregnancyLogs, 
  createPregnancyLog, 
  getPregnancyInsights,
  getBabyDevelopment,
  deletePregnancyLog
} from "../controllers/pregnancyController.js";
import {
  getTodayKickLog,
  addKickCount,
  getTodayMoodLog,
  upsertTodayMoodLog,
  getWeeklyChecklist,
  saveWeeklyChecklist,
  getTodayContractions,
  addContractionLog,
} from "../controllers/pregnancyTrackingController.js";

const router = express.Router();

router.use(protect);

router.get("/current-week", getCurrentPregnancyWeek);
router.get("/logs", getPregnancyLogs);
router.post("/logs", createPregnancyLog);
router.get("/insights", getPregnancyInsights);
router.get("/baby-development", getBabyDevelopment);
router.delete("/logs/:id", deletePregnancyLog);
router.get("/kick-logs/today", getTodayKickLog);
router.post("/kick-logs", addKickCount);
router.get("/mood-logs/today", getTodayMoodLog);
router.post("/mood-logs", upsertTodayMoodLog);
router.get("/weekly-checklist", getWeeklyChecklist);
router.put("/weekly-checklist", saveWeeklyChecklist);
router.get("/contractions/today", getTodayContractions);
router.post("/contractions", addContractionLog);

export default router;
