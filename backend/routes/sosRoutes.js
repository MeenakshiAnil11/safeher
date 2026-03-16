// backend/routes/sosRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { getSOSLogs, createSOS, shareLocation, sendSOS } from "../controllers/sosController.js";

const router = express.Router();
router.use(protect);

router.get("/", getSOSLogs);
router.post("/", createSOS);
router.post("/send", sendSOS); // New endpoint for SOS with location
router.post("/share-location", shareLocation);

export default router;
