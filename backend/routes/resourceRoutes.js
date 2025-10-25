// backend/routes/resourceRoutes.js
import express from "express";
import multer from "multer";
import Resource from "../models/Resource.js";
import Event from "../models/Event.js";
import { protect } from "../middleware/auth.js";

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Public: list only approved resources for users
router.get("/", async (req, res) => {
  try {
    const resources = await Resource.find({ approved: true })
      .select("title description url category region approved createdAt")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ resources });
  } catch (e) {
    res.status(500).json({ message: "Failed to load resources" });
  }
});

// Public: list published events for users
router.get("/events", async (req, res) => {
  try {
    const events = await Event.find({ published: true })
      .select("title description date time location url type bannerImage published createdAt")
      .sort({ date: 1 })
      .lean();
    res.json({ events });
  } catch (e) {
    res.status(500).json({ message: "Failed to load events" });
  }
});

// User: submit a resource (goes to approval queue)
router.post("/submit", protect, upload.single('pdfFile'), async (req, res) => {
  const { title, description = "", url = "", category = "", region = "" } = req.body || {};
  if (!title) return res.status(400).json({ message: "Title is required" });
  let finalUrl = url;
  if (req.file) {
    finalUrl = `/uploads/${req.file.filename}`; // Assuming static serve
  }
  const r = await Resource.create({ title, description, url: finalUrl, category, region, approved: false, submittedBy: req.userId });
  res.status(201).json({ message: "Submitted for approval", resource: r });
});

export default router;