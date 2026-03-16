// backend/routes/wellnessRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { 
  getWellnessData,
  getAllWellnessTips
} from "../controllers/wellnessController.js";

const router = express.Router();

router.use(protect);

router.get("/:week", getWellnessData);
router.get("/all/tips", getAllWellnessTips);

export default router;
