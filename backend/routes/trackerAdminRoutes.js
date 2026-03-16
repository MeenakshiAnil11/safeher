import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  listTrackerItems,
  createTrackerItem,
  updateTrackerItem,
  deleteTrackerItem,
} from "../controllers/trackerAdminController.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/:moduleKey/:sectionKey", listTrackerItems);
router.post("/:moduleKey/:sectionKey", createTrackerItem);
router.put("/:moduleKey/:sectionKey/:id", updateTrackerItem);
router.delete("/:moduleKey/:sectionKey/:id", deleteTrackerItem);

export default router;
