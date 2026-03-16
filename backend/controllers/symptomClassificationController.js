import bayesianSymptomService from '../services/bayesianSymptomService.js';

export const getSymptomClassification = async (req, res) => {
  try {
    const { symptoms, mood, severity, notes } = req.body;

    // Validate required fields
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Symptoms are required'
      });
    }

    // Get classification from ML service
    const classification = await bayesianSymptomService.classifySymptoms({
      symptoms: symptoms,
      mood: mood || 'neutral',
      severity: parseInt(severity) || 3,
      notes: notes || ''
    });

    res.json({
      success: true,
      classification: classification
    });

  } catch (error) {
    console.error('Symptom classification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to classify symptoms',
      error: error.message
    });
  }
};

export const getUserSymptomHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's symptom history
    const history = await bayesianSymptomService.getUserSymptomHistory(userId);
    
    res.json({
      success: true,
      history: history
    });

  } catch (error) {
    console.error('Get user symptom history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user symptom history',
      error: error.message
    });
  }
};

export const getSymptomInsights = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's symptom insights
    const insights = await bayesianSymptomService.getSymptomInsights(userId);
    
    res.json({
      success: true,
      insights: insights
    });

  } catch (error) {
    console.error('Get symptom insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get symptom insights',
      error: error.message
    });
  }
};