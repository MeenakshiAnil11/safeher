// backend/routes/helplineRoutes.js
import express from "express";
import Helpline from "../models/Helpline.js";
import Contact from "../models/Contact.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public: active helplines for users
router.get("/", async (req, res) => {
  try {
    const helplines = await Helpline.find({ active: true }).sort({ region: 1, name: 1 }).lean();
    res.json({ helplines });
  } catch (e) {
    res.status(500).json({ message: "Failed to load helplines" });
  }
});

// User-specific close contacts (CRUD) — protected
router.get("/contacts", protect, async (req, res) => {
  const contacts = await Contact.find({ user: req.userId }).sort({ createdAt: -1 }).lean();
  res.json({ contacts });
});

router.post("/contacts", protect, async (req, res) => {
  const { name, number, relationship = "", notes = "" } = req.body || {};
  if (!name || !number) return res.status(400).json({ message: "Name and number required" });
  const contact = await Contact.create({ user: req.userId, name, number, relationship, notes });
  res.status(201).json({ contact });
});

router.delete("/contacts/:id", protect, async (req, res) => {
  const c = await Contact.findOne({ _id: req.params.id, user: req.userId });
  if (!c) return res.status(404).json({ message: "Not found" });
  await c.deleteOne();
  res.json({ message: "Deleted" });
});

export default router;