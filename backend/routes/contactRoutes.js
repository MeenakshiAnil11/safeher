// backend/routes/contactRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import {
  listContacts,
  createContact,
  updateContact,
  deleteContact,
  updateFCMToken,
  sendContactOTP,
  verifyContactOTP,
  acknowledgeSOSByContact,
} from "../controllers/contactController.js";

const router = express.Router();

router.use(protect);

router.get("/", listContacts);
router.post("/", createContact);
router.put("/:id", updateContact);
router.delete("/:id", deleteContact);
router.post("/:id/fcm-token", updateFCMToken); // Add FCM token route
router.post("/:id/send-otp", sendContactOTP);
router.post("/:id/verify-otp", verifyContactOTP);
router.post("/:id/acknowledge-sos", acknowledgeSOSByContact);

export default router;