import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  getExerciseRecommendation, 
  detectPhase, 
  submitExerciseFeedback, 
  getExerciseHistory,
  getExerciseChatHistory,
  sendExerciseChatMessage
} from '../controllers/exerciseRecommendationController.js';

const router = express.Router();

// Exercise Recommendation Routes
router.post('/recommend', protect, getExerciseRecommendation);
router.post('/detect-phase', protect, detectPhase);
router.post('/feedback', protect, submitExerciseFeedback);
router.get('/history/:userId', protect, getExerciseHistory);

// Exercise Chat Routes
router.get('/chat', protect, getExerciseChatHistory);
router.post('/chat', protect, sendExerciseChatMessage);

export default router;
