import knnHealthRiskService from '../services/knnHealthRiskService.js';

export const getHealthRiskPrediction = async (req, res) => {
  try {
    const { age, bmi, systolic, diastolic, heart_rate, blood_sugar, cholesterol, iron_level } = req.body;

    // Validate required fields
    if (!age || !bmi || !systolic || !diastolic || !heart_rate || !blood_sugar || !cholesterol || !iron_level) {
      return res.status(400).json({
        success: false,
        message: 'All health metrics are required'
      });
    }

    // Get prediction from ML service
    const prediction = await knnHealthRiskService.getHealthRiskPrediction({
      age: parseInt(age),
      bmi: parseFloat(bmi),
      systolic: parseInt(systolic),
      diastolic: parseInt(diastolic),
      heart_rate: parseInt(heart_rate),
      blood_sugar: parseFloat(blood_sugar),
      cholesterol: parseFloat(cholesterol),
      iron_level: parseFloat(iron_level)
    });

    res.json({
      success: true,
      prediction: prediction
    });

  } catch (error) {
    console.error('Health risk prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get health risk prediction',
      error: error.message
    });
  }
};

export const getUserHealthRisk = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's latest health risk assessment
    const healthRisk = await knnHealthRiskService.getUserHealthRisk(userId);
    
    res.json({
      success: true,
      healthRisk: healthRisk
    });

  } catch (error) {
    console.error('Get user health risk error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user health risk',
      error: error.message
    });
  }
};

export const getHealthRiskTrends = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's health risk trends over time
    const trends = await knnHealthRiskService.getHealthRiskTrends(userId);
    
    res.json({
      success: true,
      trends: trends
    });

  } catch (error) {
    console.error('Get health risk trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get health risk trends',
      error: error.message
    });
  }
};