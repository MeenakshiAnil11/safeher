// backend/routes/weeklyMessageRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { 
  getCurrentWeek,
  getWeeklyMessage,
  createWeeklyMessage,
  getAllWeeklyMessages
} from "../controllers/weeklyMessageController.js";

const router = express.Router();

router.use(protect);

router.get("/current-week", getCurrentWeek);
router.get("/weekly-message", getWeeklyMessage);
router.get("/all", getAllWeeklyMessages);
router.post("/", createWeeklyMessage); // Admin only in production

export default router;
