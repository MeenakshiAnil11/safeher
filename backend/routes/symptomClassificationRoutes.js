import express from 'express';
import { getSymptomClassification, getUserSymptomHistory, getSymptomInsights } from '../controllers/symptomClassificationController.js';

const router = express.Router();

// Symptom Classification Routes
router.post('/classify', getSymptomClassification);
router.get('/user/:userId/history', getUserSymptomHistory);
router.get('/user/:userId/insights', getSymptomInsights);

export default router;