// backend/routes/babyNameRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { 
  getBabyNames, 
  createBabyName,
  bookmarkName,
  getBookmarkedNames,
  deleteBookmarkedName,
  updateBookmarkedName
} from "../controllers/babyNameController.js";

const router = express.Router();

router.use(protect);

router.get("/", getBabyNames);
router.post("/", createBabyName); // Admin only in production
router.post("/bookmark", bookmarkName);
router.get("/bookmarked", getBookmarkedNames);
router.put("/bookmarked/:id", updateBookmarkedName);
router.delete("/bookmarked/:id", deleteBookmarkedName);

export default router;
