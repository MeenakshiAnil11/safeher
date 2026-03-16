// backend/routes/appointmentRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { 
  getAppointments, 
  createAppointment, 
  updateAppointment, 
  deleteAppointment,
  getUpcomingAppointments
} from "../controllers/appointmentController.js";

const router = express.Router();

router.use(protect);

router.get("/", getAppointments);
router.post("/", createAppointment);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);
router.get("/upcoming", getUpcomingAppointments);

export default router;
