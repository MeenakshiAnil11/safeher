import decisionTreePregnancyService from '../services/decisionTreePregnancyService.js';

export const getPregnancyHealthPrediction = async (req, res) => {
  try {
    const { 
      week, trimester, weight, symptoms, blood_pressure_systolic, 
      blood_pressure_diastolic, blood_sugar, mood, energy, 
      sleep_hours, nutrition_score, exercise_minutes 
    } = req.body;

    // Validate required fields
    if (!week || !trimester || !weight) {
      return res.status(400).json({
        success: false,
        message: 'Week, trimester, and weight are required'
      });
    }

    // Get prediction from ML service
    const prediction = await decisionTreePregnancyService.getPregnancyHealthPrediction({
      week: parseInt(week),
      trimester: parseInt(trimester),
      weight: parseFloat(weight),
      symptoms: symptoms || [],
      blood_pressure_systolic: parseInt(blood_pressure_systolic) || 120,
      blood_pressure_diastolic: parseInt(blood_pressure_diastolic) || 80,
      blood_sugar: parseFloat(blood_sugar) || 90,
      mood: mood || 'neutral',
      energy: parseInt(energy) || 5,
      sleep_hours: parseFloat(sleep_hours) || 8,
      nutrition_score: parseInt(nutrition_score) || 5,
      exercise_minutes: parseInt(exercise_minutes) || 30
    });

    res.json({
      success: true,
      prediction: prediction
    });

  } catch (error) {
    console.error('Pregnancy health prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pregnancy health prediction',
      error: error.message
    });
  }
};

export const getUserPregnancyRisk = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's pregnancy risk assessment
    const risk = await decisionTreePregnancyService.getUserPregnancyRisk(userId);
    
    res.json({
      success: true,
      risk: risk
    });

  } catch (error) {
    console.error('Get user pregnancy risk error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user pregnancy risk',
      error: error.message
    });
  }
};

export const getPregnancyComplications = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's pregnancy complications prediction
    const complications = await decisionTreePregnancyService.getPregnancyComplications(userId);
    
    res.json({
      success: true,
      complications: complications
    });

  } catch (error) {
    console.error('Get pregnancy complications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pregnancy complications',
      error: error.message
    });
  }
};

export const getPregnancyTrends = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's pregnancy trends
    const trends = await decisionTreePregnancyService.getPregnancyTrends(userId);
    
    res.json({
      success: true,
      trends: trends
    });

  } catch (error) {
    console.error('Get pregnancy trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pregnancy trends',
      error: error.message
    });
  }
};