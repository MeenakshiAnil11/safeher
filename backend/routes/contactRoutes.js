// backend/routes/contactRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { listContacts, createContact, updateContact, deleteContact, updateFCMToken } from "../controllers/contactController.js";

const router = express.Router();

router.use(protect);

router.get("/", listContacts);
router.post("/", createContact);
router.put("/:id", updateContact);
router.delete("/:id", deleteContact);
router.post("/:id/fcm-token", updateFCMToken); // Add FCM token route

export default router;