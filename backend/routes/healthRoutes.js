import express from "express";
import { protect } from "../middleware/auth.js";
import {
  listVitals, createVital, updateVital, deleteVital,
  listSymptoms, createSymptom, updateSymptom, deleteSymptom,
  listVaccinations, createVaccination, updateVaccination, deleteVaccination,
  listRecords, createRecord, updateRecord, deleteRecord,
  listMoodLogs, createMoodLog, updateMoodLog, deleteMoodLog,
  listChatHistory, sendMessage,
  listExercises, createExercise, updateExercise, deleteExercise,
  listSleep, createSleep, updateSleep, deleteSleep,
  listNutrition, createNutrition, updateNutrition, deleteNutrition
} from "../controllers/healthController.js";

const router = express.Router();

// Vitals
router.get("/vitals", protect, listVitals);
router.post("/vitals", protect, createVital);
router.put("/vitals/:id", protect, updateVital);
router.delete("/vitals/:id", protect, deleteVital);

// Symptoms
router.get("/symptoms", protect, listSymptoms);
router.post("/symptoms", protect, createSymptom);
router.put("/symptoms/:id", protect, updateSymptom);
router.delete("/symptoms/:id", protect, deleteSymptom);

// Vaccinations
router.get("/vaccinations", protect, listVaccinations);
router.post("/vaccinations", protect, createVaccination);
router.put("/vaccinations/:id", protect, updateVaccination);
router.delete("/vaccinations/:id", protect, deleteVaccination);

// Records
router.get("/records", protect, listRecords);
router.post("/records", protect, createRecord);
router.put("/records/:id", protect, updateRecord);
router.delete("/records/:id", protect, deleteRecord);

// Mood Logs
router.get("/moodlogs", protect, listMoodLogs);
router.post("/moodlogs", protect, createMoodLog);
router.put("/moodlogs/:id", protect, updateMoodLog);
router.delete("/moodlogs/:id", protect, deleteMoodLog);

// Chat
router.get("/chat", protect, listChatHistory);
router.post("/chat", protect, sendMessage);

// Exercises
router.get("/exercises", protect, listExercises);
router.post("/exercises", protect, createExercise);
router.put("/exercises/:id", protect, updateExercise);
router.delete("/exercises/:id", protect, deleteExercise);

// Sleep
router.get("/sleep", protect, listSleep);
router.post("/sleep", protect, createSleep);
router.put("/sleep/:id", protect, updateSleep);
router.delete("/sleep/:id", protect, deleteSleep);

// Nutrition
router.get("/nutrition", protect, listNutrition);
router.post("/nutrition", protect, createNutrition);
router.put("/nutrition/:id", protect, updateNutrition);
router.delete("/nutrition/:id", protect, deleteNutrition);

export default router;
