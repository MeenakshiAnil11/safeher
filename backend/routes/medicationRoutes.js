// backend/routes/medicationRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { 
  getMedications, 
  createMedication, 
  updateMedication, 
  deleteMedication,
  getActiveMedications
} from "../controllers/medicationController.js";

const router = express.Router();

router.use(protect);

router.get("/", getMedications);
router.post("/", createMedication);
router.put("/:id", updateMedication);
router.delete("/:id", deleteMedication);
router.get("/active", getActiveMedications);

export default router;
