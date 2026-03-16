import express from 'express';
import { getHealthRiskPrediction, getUserHealthRisk, getHealthRiskTrends } from '../controllers/healthRiskController.js';

const router = express.Router();

// Health Risk Assessment Routes
router.post('/prediction', getHealthRiskPrediction);
router.get('/user/:userId', getUserHealthRisk);
router.get('/trends/:userId', getHealthRiskTrends);

export default router;