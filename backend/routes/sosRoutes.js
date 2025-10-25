// backend/routes/sosRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { getSOSLogs, createSOS } from "../controllers/sosController.js";

const router = express.Router();
router.use(protect);

router.get("/", getSOSLogs);
router.post("/", createSOS);

export default router;
