import Vital from "../models/Vital.js";
import Symptom from "../models/Symptom.js";
import Vaccination from "../models/Vaccination.js";
import Record from "../models/Record.js";
import MoodLog from "../models/MoodLog.js";
import ChatHistory from "../models/ChatHistory.js";
import Exercise from "../models/Exercise.js";
import Sleep from "../models/Sleep.js";
import Nutrition from "../models/Nutrition.js";

// GET /api/health/vitals
export const listVitals = async (req, res) => {
  try {
    const items = await Vital.find({ user: req.userId }).sort({ recordedAt: -1, createdAt: -1 }).limit(200).lean();
    res.json({ items });
  } catch (err) {
    console.error("listVitals error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/health/vitals
export const createVital = async (req, res) => {
  try {
    const { recordedAt, weightKg, heightCm, systolic, diastolic, heartRateBpm, bmi, bloodSugar, bloodSugarNotes, ironLevel, ironLevelNotes, cholesterol, cholesterolNotes, notes } = req.body;
    if (!recordedAt) return res.status(400).json({ message: "recordedAt required" });

    const v = new Vital({
      user: req.userId,
      recordedAt: new Date(recordedAt),
      weightKg,
      heightCm,
      systolic,
      diastolic,
      heartRateBpm,
      bmi,
      bloodSugar,
      bloodSugarNotes,
      ironLevel,
      ironLevelNotes,
      cholesterol,
      cholesterolNotes,
      notes,
    });
    await v.save();
    res.status(201).json({ message: "Vital saved", item: v });
  } catch (err) {
    console.error("createVital error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/health/vitals/:id
export const updateVital = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.recordedAt) updates.recordedAt = new Date(updates.recordedAt);
    const item = await Vital.findOneAndUpdate({ _id: id, user: req.userId }, updates, { new: true });
    if (!item) return res.status(404).json({ message: "Vital not found" });
    res.json({ message: "Vital updated", item });
  } catch (err) {
    console.error("updateVital error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/health/vitals/:id
export const deleteVital = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Vital.findOneAndDelete({ _id: id, user: req.userId });
    if (!result) return res.status(404).json({ message: "Vital not found" });
    res.json({ message: "Vital deleted" });
  } catch (err) {
    console.error("deleteVital error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// SYMPTOMS CRUD

// GET /api/health/symptoms
export const listSymptoms = async (req, res) => {
  try {
    const items = await Symptom.find({ user: req.userId }).sort({ date: -1, createdAt: -1 }).limit(200).lean();
    res.json({ items });
  } catch (err) {
    console.error("listSymptoms error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/health/symptoms
export const createSymptom = async (req, res) => {
  try {
    const { date, tags, severity, notes } = req.body;
    if (!date || !severity) return res.status(400).json({ message: "date and severity required" });

    const s = new Symptom({
      user: req.userId,
      date: new Date(date),
      tags: Array.isArray(tags) ? tags : (tags || "").split(",").map(t => t.trim()).filter(Boolean),
      severity: Number(severity),
      notes,
    });
    await s.save();
    res.status(201).json({ message: "Symptom saved", item: s });
  } catch (err) {
    console.error("createSymptom error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/health/symptoms/:id
export const updateSymptom = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.date) updates.date = new Date(updates.date);
    if (updates.tags) updates.tags = Array.isArray(updates.tags) ? updates.tags : (updates.tags || "").split(",").map(t => t.trim()).filter(Boolean);
    if (updates.severity) updates.severity = Number(updates.severity);

    const item = await Symptom.findOneAndUpdate({ _id: id, user: req.userId }, updates, { new: true });
    if (!item) return res.status(404).json({ message: "Symptom not found" });
    res.json({ message: "Symptom updated", item });
  } catch (err) {
    console.error("updateSymptom error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/health/symptoms/:id
export const deleteSymptom = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Symptom.findOneAndDelete({ _id: id, user: req.userId });
    if (!result) return res.status(404).json({ message: "Symptom not found" });
    res.json({ message: "Symptom deleted" });
  } catch (err) {
    console.error("deleteSymptom error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// VACCINATIONS CRUD

// GET /api/health/vaccinations
export const listVaccinations = async (req, res) => {
  try {
    const items = await Vaccination.find({ user: req.userId }).sort({ date: -1, createdAt: -1 }).limit(200).lean();
    res.json({ items });
  } catch (err) {
    console.error("listVaccinations error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/health/vaccinations
export const createVaccination = async (req, res) => {
  try {
    const { name, date, lotNumber, provider, notes } = req.body;
    if (!name || !date) return res.status(400).json({ message: "name and date required" });

    const v = new Vaccination({
      user: req.userId,
      name,
      date: new Date(date),
      lotNumber,
      provider,
      notes,
    });
    await v.save();
    res.status(201).json({ message: "Vaccination saved", item: v });
  } catch (err) {
    console.error("createVaccination error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/health/vaccinations/:id
export const updateVaccination = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.date) updates.date = new Date(updates.date);

    const item = await Vaccination.findOneAndUpdate({ _id: id, user: req.userId }, updates, { new: true });
    if (!item) return res.status(404).json({ message: "Vaccination not found" });
    res.json({ message: "Vaccination updated", item });
  } catch (err) {
    console.error("updateVaccination error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/health/vaccinations/:id
export const deleteVaccination = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Vaccination.findOneAndDelete({ _id: id, user: req.userId });
    if (!result) return res.status(404).json({ message: "Vaccination not found" });
    res.json({ message: "Vaccination deleted" });
  } catch (err) {
    console.error("deleteVaccination error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// RECORDS CRUD

// GET /api/health/records
export const listRecords = async (req, res) => {
  try {
    const items = await Record.find({ user: req.userId }).sort({ takenAt: -1, createdAt: -1 }).limit(200).lean();
    res.json({ items });
  } catch (err) {
    console.error("listRecords error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/health/records
export const createRecord = async (req, res) => {
  try {
    const { title, category, fileUrl, takenAt, notes } = req.body;
    if (!title || !fileUrl) return res.status(400).json({ message: "title and fileUrl required" });

    const r = new Record({
      user: req.userId,
      title,
      category,
      fileUrl,
      takenAt: takenAt ? new Date(takenAt) : undefined,
      notes,
    });
    await r.save();
    res.status(201).json({ message: "Record saved", item: r });
  } catch (err) {
    console.error("createRecord error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/health/records/:id
export const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.takenAt) updates.takenAt = new Date(updates.takenAt);

    const item = await Record.findOneAndUpdate({ _id: id, user: req.userId }, updates, { new: true });
    if (!item) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Record updated", item });
  } catch (err) {
    console.error("updateRecord error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/health/records/:id
export const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Record.findOneAndDelete({ _id: id, user: req.userId });
    if (!result) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Record deleted" });
  } catch (err) {
    console.error("deleteRecord error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// MOOD LOGS CRUD

// GET /api/health/moodlogs
export const listMoodLogs = async (req, res) => {
  try {
    const items = await MoodLog.find({ user: req.userId }).sort({ date: -1, createdAt: -1 }).limit(200).lean();
    res.json({ items });
  } catch (err) {
    console.error("listMoodLogs error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/health/moodlogs
export const createMoodLog = async (req, res) => {
  try {
    const { date, mood, symptoms, notes } = req.body;
    if (!date || !mood) return res.status(400).json({ message: "date and mood required" });

    const m = new MoodLog({
      user: req.userId,
      date: new Date(date),
      mood,
      symptoms: Array.isArray(symptoms) ? symptoms : (symptoms || "").split(",").map(s => s.trim()).filter(Boolean),
      notes,
    });
    await m.save();
    res.status(201).json({ message: "Mood log saved", item: m });
  } catch (err) {
    console.error("createMoodLog error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/health/moodlogs/:id
export const updateMoodLog = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.date) updates.date = new Date(updates.date);
    if (updates.symptoms) updates.symptoms = Array.isArray(updates.symptoms) ? updates.symptoms : (updates.symptoms || "").split(",").map(s => s.trim()).filter(Boolean);

    const item = await MoodLog.findOneAndUpdate({ _id: id, user: req.userId }, updates, { new: true });
    if (!item) return res.status(404).json({ message: "Mood log not found" });
    res.json({ message: "Mood log updated", item });
  } catch (err) {
    console.error("updateMoodLog error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/health/moodlogs/:id
export const deleteMoodLog = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await MoodLog.findOneAndDelete({ _id: id, user: req.userId });
    if (!result) return res.status(404).json({ message: "Mood log not found" });
    res.json({ message: "Mood log deleted" });
  } catch (err) {
    console.error("deleteMoodLog error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// CHAT CRUD

// GET /api/health/chat
export const listChatHistory = async (req, res) => {
  try {
    const chatHistory = await ChatHistory.findOne({ user: req.userId }).lean();
    res.json({ messages: chatHistory ? chatHistory.messages : [] });
  } catch (err) {
    console.error("listChatHistory error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/health/chat
export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "message required" });

    let chatHistory = await ChatHistory.findOne({ user: req.userId });
    if (!chatHistory) {
      chatHistory = new ChatHistory({ user: req.userId, messages: [] });
    }

    // Add user message
    chatHistory.messages.push({ role: 'user', content: message, timestamp: new Date() });

    // Generate AI response (placeholder)
    const aiResponse = generateAIResponse(message);
    chatHistory.messages.push({ role: 'assistant', content: aiResponse, timestamp: new Date() });

    await chatHistory.save();
    res.status(201).json({ message: "Message sent", response: aiResponse });
  } catch (err) {
    console.error("sendMessage error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Simple AI response generator
const generateAIResponse = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase();
  if (lowerMessage.includes('sad') || lowerMessage.includes('depressed')) {
    return "I'm sorry you're feeling sad. It's okay to have tough days. Have you tried talking to a friend or doing something you enjoy?";
  } else if (lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
    return "Anxiety can be challenging. Try deep breathing exercises or mindfulness. Remember, you're not alone in this.";
  } else if (lowerMessage.includes('happy') || lowerMessage.includes('good')) {
    return "That's great to hear! Keep nurturing those positive feelings.";
  } else {
    return "Thank you for sharing. I'm here to listen and support you with your mood and symptoms. How else can I help?";
  }
};

// EXERCISE CRUD

// GET /api/health/exercises
export const listExercises = async (req, res) => {
  try {
    const items = await Exercise.find({ user: req.userId }).sort({ date: -1, createdAt: -1 }).limit(200).lean();
    res.json({ items });
  } catch (err) {
    console.error("listExercises error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/health/exercises
export const createExercise = async (req, res) => {
  try {
    const { type, duration, intensity, caloriesBurned, notes, date } = req.body;
    if (!type || !duration || !intensity) return res.status(400).json({ message: "type, duration, and intensity required" });

    const e = new Exercise({
      user: req.userId,
      type,
      duration: Number(duration),
      intensity,
      caloriesBurned: caloriesBurned ? Number(caloriesBurned) : undefined,
      notes,
      date: date ? new Date(date) : new Date(),
    });
    await e.save();
    res.status(201).json({ message: "Exercise saved", item: e });
  } catch (err) {
    console.error("createExercise error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/health/exercises/:id
export const updateExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.duration) updates.duration = Number(updates.duration);
    if (updates.caloriesBurned) updates.caloriesBurned = Number(updates.caloriesBurned);
    if (updates.date) updates.date = new Date(updates.date);

    const item = await Exercise.findOneAndUpdate({ _id: id, user: req.userId }, updates, { new: true });
    if (!item) return res.status(404).json({ message: "Exercise not found" });
    res.json({ message: "Exercise updated", item });
  } catch (err) {
    console.error("updateExercise error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/health/exercises/:id
export const deleteExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Exercise.findOneAndDelete({ _id: id, user: req.userId });
    if (!result) return res.status(404).json({ message: "Exercise not found" });
    res.json({ message: "Exercise deleted" });
  } catch (err) {
    console.error("deleteExercise error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// SLEEP CRUD

// GET /api/health/sleep
export const listSleep = async (req, res) => {
  try {
    const items = await Sleep.find({ user: req.userId }).sort({ date: -1, createdAt: -1 }).limit(200).lean();
    res.json({ items });
  } catch (err) {
    console.error("listSleep error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/health/sleep
export const createSleep = async (req, res) => {
  try {
    const { sleepHours, quality, bedtime, wakeTime, notes, date } = req.body;
    if (!sleepHours || !quality) return res.status(400).json({ message: "sleepHours and quality required" });

    const s = new Sleep({
      user: req.userId,
      sleepHours: Number(sleepHours),
      quality,
      bedtime,
      wakeTime,
      notes,
      date: date ? new Date(date) : new Date(),
    });
    await s.save();
    res.status(201).json({ message: "Sleep log saved", item: s });
  } catch (err) {
    console.error("createSleep error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/health/sleep/:id
export const updateSleep = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.sleepHours) updates.sleepHours = Number(updates.sleepHours);
    if (updates.date) updates.date = new Date(updates.date);

    const item = await Sleep.findOneAndUpdate({ _id: id, user: req.userId }, updates, { new: true });
    if (!item) return res.status(404).json({ message: "Sleep log not found" });
    res.json({ message: "Sleep log updated", item });
  } catch (err) {
    console.error("updateSleep error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/health/sleep/:id
export const deleteSleep = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Sleep.findOneAndDelete({ _id: id, user: req.userId });
    if (!result) return res.status(404).json({ message: "Sleep log not found" });
    res.json({ message: "Sleep log deleted" });
  } catch (err) {
    console.error("deleteSleep error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// NUTRITION CRUD

// GET /api/health/nutrition
export const listNutrition = async (req, res) => {
  try {
    const items = await Nutrition.find({ user: req.userId }).sort({ date: -1, createdAt: -1 }).limit(200).lean();
    res.json({ items });
  } catch (err) {
    console.error("listNutrition error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/health/nutrition
export const createNutrition = async (req, res) => {
  try {
    const { meal, calories, protein, carbs, fat, hydration, supplements, notes, date } = req.body;
    if (!meal || !calories) return res.status(400).json({ message: "meal and calories required" });

    const n = new Nutrition({
      user: req.userId,
      meal,
      calories: Number(calories),
      protein: protein ? Number(protein) : undefined,
      carbs: carbs ? Number(carbs) : undefined,
      fat: fat ? Number(fat) : undefined,
      hydration,
      supplements,
      notes,
      date: date ? new Date(date) : new Date(),
    });
    await n.save();
    res.status(201).json({ message: "Nutrition log saved", item: n });
  } catch (err) {
    console.error("createNutrition error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/health/nutrition/:id
export const updateNutrition = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.calories) updates.calories = Number(updates.calories);
    if (updates.protein) updates.protein = Number(updates.protein);
    if (updates.carbs) updates.carbs = Number(updates.carbs);
    if (updates.fat) updates.fat = Number(updates.fat);
    if (updates.date) updates.date = new Date(updates.date);

    const item = await Nutrition.findOneAndUpdate({ _id: id, user: req.userId }, updates, { new: true });
    if (!item) return res.status(404).json({ message: "Nutrition log not found" });
    res.json({ message: "Nutrition log updated", item });
  } catch (err) {
    console.error("updateNutrition error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/health/nutrition/:id
export const deleteNutrition = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Nutrition.findOneAndDelete({ _id: id, user: req.userId });
    if (!result) return res.status(404).json({ message: "Nutrition log not found" });
    res.json({ message: "Nutrition log deleted" });
  } catch (err) {
    console.error("deleteNutrition error", err);
    res.status(500).json({ message: "Server error" });
  }
};
