import express from "express";
import { protect } from "../middleware/auth.js";
import { getUserAlerts } from "../controllers/alertController.js";

const router = express.Router();

router.use(protect);
router.get("/user/:userId", getUserAlerts);

export default router;
