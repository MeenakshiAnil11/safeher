// backend/routes/partnerDashboardRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { 
  getPartnerDashboard,
  createPartnerAccess,
  updatePartnerAccess,
  deletePartnerAccess
} from "../controllers/partnerDashboardController.js";

const router = express.Router();

// Public route for partner dashboard access
router.get("/", getPartnerDashboard);

// Protected routes for managing partner access
router.use(protect);
router.post("/access", createPartnerAccess);
router.put("/access/:id", updatePartnerAccess);
router.delete("/access/:id", deletePartnerAccess);

export default router;
