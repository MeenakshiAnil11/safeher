// backend/routes/perimenopauseRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { 
  getPerimenopauseLogs, 
  createPerimenopauseLog, 
  getPerimenopauseInsights,
  getPerimenopauseOverview,
  getPerimenopauseInsight,
  regeneratePerimenopauseInsight
} from "../controllers/perimenopauseController.js";

const router = express.Router();

router.use(protect);

router.get("/overview", getPerimenopauseOverview);
router.get("/insight", getPerimenopauseInsight);
router.post("/regenerate", regeneratePerimenopauseInsight);
router.get("/logs", getPerimenopauseLogs);
router.post("/logs", createPerimenopauseLog);
router.get("/insights", getPerimenopauseInsights);

export default router;
