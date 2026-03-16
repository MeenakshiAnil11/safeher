// backend/routes/pregnancyChatRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { 
  getChatHistory,
  sendMessage,
  clearChatHistory
} from "../controllers/pregnancyChatController.js";

const router = express.Router();

router.use(protect);

router.get("/history", getChatHistory);
router.post("/", sendMessage);
router.delete("/history", clearChatHistory);

export default router;
