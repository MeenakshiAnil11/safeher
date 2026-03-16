import express from "express";
import { getDoctorProfile, updateDoctorProfile } from "../controllers/userTelehealthController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

// GET /api/doctor-profile
router.get("/", getDoctorProfile);

// PUT /api/doctor-profile
router.put("/", updateDoctorProfile);

export default router;
