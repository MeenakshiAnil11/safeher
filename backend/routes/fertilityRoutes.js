// backend/routes/fertilityRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { 
  getFertilityLogs, 
  createFertilityLog, 
  getFertilityInsights,
  getMLPrediction,
  getEnhancedInsights,
  getComprehensiveInsights
} from "../controllers/fertilityController.js";

const router = express.Router();

router.use(protect);

router.get("/logs", getFertilityLogs);
router.post("/logs", createFertilityLog);
router.get("/insights", getFertilityInsights);
router.get("/predict", getMLPrediction);
router.get("/enhanced-insights", getEnhancedInsights);
router.get("/comprehensive-insights", getComprehensiveInsights);

export default router;
