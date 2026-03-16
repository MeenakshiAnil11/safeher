import exerciseRecommendationService from '../services/exerciseRecommendationService.js';
import ExerciseChatHistory from '../models/ExerciseChatHistory.js';

export const getExerciseRecommendation = async (req, res) => {
  try {
    const {
      today,
      period_start_dates,
      period_lengths,
      energy_level,
      sleep_hours,
      mood,
      cramps,
      fitness_level
    } = req.body;

    // Validate required fields
    if (!today || !period_start_dates || energy_level === undefined || cramps === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: today, period_start_dates, energy_level, cramps'
      });
    }

    // Prepare data for recommendation
    const recommendationData = {
      today,
      period_start_dates,
      period_lengths: period_lengths || [],
      energy_level: parseInt(energy_level),
      sleep_hours: parseFloat(sleep_hours) || 7.5,
      mood: mood || 'neutral',
      cramps: parseInt(cramps),
      fitness_level: fitness_level || 'beginner'
    };

    // Get exercise recommendation
    const recommendation = await exerciseRecommendationService.getExerciseRecommendation(recommendationData);

    res.json(recommendation);

  } catch (error) {
    console.error('Exercise recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exercise recommendation',
      error: error.message
    });
  }
};

export const detectPhase = async (req, res) => {
  try {
    const { today, period_start_dates, period_lengths } = req.body;

    if (!today || !period_start_dates) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: today, period_start_dates'
      });
    }

    const phaseData = {
      today,
      period_start_dates,
      period_lengths: period_lengths || []
    };

    const phaseInfo = await exerciseRecommendationService.detectPhase(phaseData);

    res.json(phaseInfo);

  } catch (error) {
    console.error('Phase detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to detect phase',
      error: error.message
    });
  }
};

export const submitExerciseFeedback = async (req, res) => {
  try {
    const {
      user_id,
      recommended_exercise,
      actual_exercise,
      rating,
      feedback_text,
      phase,
      symptoms
    } = req.body;

    const feedback = {
      user_id,
      recommended_exercise,
      actual_exercise,
      rating: parseInt(rating),
      feedback_text,
      phase,
      symptoms: symptoms || {}
    };

    const result = await exerciseRecommendationService.submitFeedback(feedback);

    res.json(result);

  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
};

export const getExerciseHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // In a real implementation, you would fetch from database
    // For now, return empty array
    res.json({
      success: true,
      history: []
    });

  } catch (error) {
    console.error('Get exercise history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exercise history',
      error: error.message
    });
  }
};

// GET /api/exercise/chat - Get chat history
export const getExerciseChatHistory = async (req, res) => {
  try {
    let chatHistory = await ExerciseChatHistory.findOne({ user: req.userId });
    
    if (!chatHistory) {
      return res.json({ messages: [] });
    }

    res.json({ messages: chatHistory.messages });
  } catch (error) {
    console.error('Get exercise chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat history',
      error: error.message
    });
  }
};

// POST /api/exercise/chat - Send message and get AI response
export const sendExerciseChatMessage = async (req, res) => {
  try {
    const { message, currentPhase } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
        response: 'Please provide a message to continue the conversation.'
      });
    }

    // Get or create chat history
    let chatHistory = await ExerciseChatHistory.findOne({ user: req.userId });
    if (!chatHistory) {
      chatHistory = new ExerciseChatHistory({
        user: req.userId,
        messages: [],
        currentPhase: currentPhase || 'unknown'
      });
    }

    // Update current phase if provided
    if (currentPhase) {
      chatHistory.currentPhase = currentPhase;
    }

    // Add user message
    chatHistory.messages.push({
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    });

    // Generate AI response based on message and current phase
    const aiResponse = generateExerciseAIResponse(message.trim(), chatHistory.currentPhase);
    
    // Add assistant response
    chatHistory.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });

    await chatHistory.save();

    res.json({
      success: true,
      response: aiResponse,
      messages: chatHistory.messages
    });

  } catch (error) {
    console.error('Send exercise chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      response: 'Sorry, I encountered an error processing your message. Please try again.',
      error: error.message
    });
  }
};

// AI Response Generator for Exercise Chat
const generateExerciseAIResponse = (userMessage, currentPhase = 'unknown') => {
  const lowerMessage = userMessage.toLowerCase();
  const phase = currentPhase.toLowerCase();

  // Phase-specific responses
  if (phase === 'menstrual' || phase === 'menstruation') {
    if (lowerMessage.includes('exercise') || lowerMessage.includes('workout') || lowerMessage.includes('work out')) {
      if (lowerMessage.includes('cramp') || lowerMessage.includes('pain')) {
        return "During your menstrual phase, gentle exercises can actually help ease cramps! I recommend light yoga, gentle stretching, or a slow walk. These activities can reduce pain and improve your mood. Avoid high-intensity workouts and listen to your body.";
      }
      return "Great question! During your menstrual phase, focus on gentle, restorative exercises. Light yoga, walking, stretching, and meditation are perfect. These help with cramps, fatigue, and mood. Save high-intensity workouts for later in your cycle when your energy is higher.";
    }
    if (lowerMessage.includes('tired') || lowerMessage.includes('fatigue') || lowerMessage.includes('energy')) {
      return "It's completely normal to feel tired during your menstrual phase. Your energy levels are naturally lower. Try gentle activities like restorative yoga or a short walk. Even 10-15 minutes can boost your mood without draining your energy.";
    }
  }

  if (phase === 'follicular') {
    if (lowerMessage.includes('exercise') || lowerMessage.includes('workout')) {
      return "Perfect timing! Your follicular phase is ideal for building strength and endurance. Your energy is increasing, so this is a great time for strength training, cardio, HIIT workouts, or trying new exercises. Your body is primed for building muscle and improving fitness.";
    }
    if (lowerMessage.includes('energy') || lowerMessage.includes('motivation')) {
      return "Your energy is naturally rising during the follicular phase! This is an excellent time to challenge yourself with more intense workouts. Consider strength training, running, or high-intensity interval training. Your body is ready for it!";
    }
  }

  if (phase === 'ovulation' || phase === 'fertile') {
    if (lowerMessage.includes('exercise') || lowerMessage.includes('workout')) {
      return "You're at your peak performance during ovulation! Your energy and strength are at their highest. This is the perfect time for your most challenging workouts - HIIT, heavy strength training, or intense cardio. You'll likely feel stronger and more capable than usual.";
    }
    if (lowerMessage.includes('energy') || lowerMessage.includes('peak')) {
      return "You're experiencing peak energy during ovulation! Take advantage of this by doing your most challenging workouts. Your body is primed for high performance, so push yourself a bit more than usual if you feel up to it.";
    }
  }

  if (phase === 'luteal') {
    if (lowerMessage.includes('exercise') || lowerMessage.includes('workout')) {
      if (lowerMessage.includes('pms') || lowerMessage.includes('mood') || lowerMessage.includes('bloat')) {
        return "During your luteal phase, exercise can help manage PMS symptoms! Moderate-intensity activities like yoga, pilates, steady-state cardio, or light strength training can reduce bloating, improve mood, and help with sleep. Avoid overexertion and listen to your body.";
      }
      return "During your luteal phase, moderate-intensity exercises work best. Try yoga, pilates, steady-state cardio, or moderate strength training. These can help manage PMS symptoms and maintain your fitness without overexerting yourself.";
    }
    if (lowerMessage.includes('pms') || lowerMessage.includes('symptom')) {
      return "Exercise during your luteal phase can actually help reduce PMS symptoms! Moderate activities like yoga, walking, or light cardio can ease bloating, improve mood, and help with sleep. Start with shorter sessions and increase if you feel good.";
    }
  }

  // General exercise-related responses
  if (lowerMessage.includes('what') && (lowerMessage.includes('exercise') || lowerMessage.includes('workout'))) {
    return `Based on your current ${phase} phase, I can recommend exercises tailored to where you are in your cycle. Would you like specific recommendations for your phase, or do you have questions about a particular type of exercise?`;
  }

  if (lowerMessage.includes('how') && (lowerMessage.includes('exercise') || lowerMessage.includes('workout'))) {
    return "I'd be happy to help! The best exercises for you depend on your current cycle phase. During your menstrual phase, focus on gentle activities. In your follicular and ovulation phases, you can handle more intensity. During your luteal phase, moderate exercises work best. What specific exercise would you like to know about?";
  }

  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
    return `For your ${phase} phase, I recommend exercises that match your current energy levels. Would you like me to suggest specific exercises, or do you have questions about adjusting your workout routine for your cycle?`;
  }

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `Hello! I'm your AI exercise coach. I see you're in your ${phase} phase. How can I help you with your exercise routine today? I can recommend exercises, answer questions about working out during your cycle, or help you plan your workouts.`;
  }

  if (lowerMessage.includes('help') || lowerMessage.includes('question')) {
    return "I'm here to help! I can answer questions about exercises for your current cycle phase, recommend workouts, explain how your cycle affects your fitness, or help you plan your exercise routine. What would you like to know?";
  }

  // Default response
  return `I understand you're asking about exercises during your ${phase} phase. Could you be more specific? I can help with exercise recommendations, workout planning, or questions about how your menstrual cycle affects your fitness. What would you like to know?`;
};
