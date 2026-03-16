import express from 'express';
import { getPregnancyHealthPrediction, getUserPregnancyRisk, getPregnancyComplications, getPregnancyTrends } from '../controllers/pregnancyHealthController.js';

const router = express.Router();

// Pregnancy Health Prediction Routes
router.post('/prediction', getPregnancyHealthPrediction);
router.get('/user/:userId/risk', getUserPregnancyRisk);
router.get('/user/:userId/complications', getPregnancyComplications);
router.get('/user/:userId/trends', getPregnancyTrends);

export default router;