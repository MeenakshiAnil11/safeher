import express from 'express';
import { getMoodPrediction, getMoodClassification, getMoodIntensity, getMoodTrends } from '../controllers/moodPredictionController.js';

const router = express.Router();

// Mood Prediction Routes
router.post('/mood', getMoodPrediction);
router.post('/classification', getMoodClassification);
router.post('/intensity', getMoodIntensity);
router.get('/user/:userId/trends', getMoodTrends);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Mood prediction routes are working!' });
});

console.log('🔧 Mood Prediction Routes Registered:');
console.log('  - POST /mood');
console.log('  - POST /classification');
console.log('  - POST /intensity');
console.log('  - GET /user/:userId/trends');
console.log('  - GET /test');

export default router;