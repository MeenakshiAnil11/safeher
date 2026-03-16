// backend/routes/pregnancyResourceRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { 
  getPregnancyResources,
  createPregnancyResource,
  getPregnancyResourceById,
  updatePregnancyResource,
  deletePregnancyResource,
  getResourceStats
} from "../controllers/pregnancyResourceController.js";

const router = express.Router();

router.use(protect);

router.get("/", getPregnancyResources);
router.get("/stats", getResourceStats);
router.get("/:id", getPregnancyResourceById);
router.post("/", createPregnancyResource); // Admin only in production
router.put("/:id", updatePregnancyResource); // Admin only in production
router.delete("/:id", deletePregnancyResource); // Admin only in production

export default router;
