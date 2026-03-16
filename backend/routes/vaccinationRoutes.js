// backend/routes/vaccinationRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { 
  getVaccinations, 
  createVaccination, 
  updateVaccination, 
  deleteVaccination,
  getUpcomingVaccinations
} from "../controllers/vaccinationController.js";

const router = express.Router();

router.use(protect);

router.get("/", getVaccinations);
router.post("/", createVaccination);
router.put("/:id", updateVaccination);
router.delete("/:id", deleteVaccination);
router.get("/upcoming", getUpcomingVaccinations);

export default router;
