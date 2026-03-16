import svmMoodService from '../services/svmMoodService.js';

export const getMoodPrediction = async (req, res) => {
  try {
    const { 
      age, sleep_hours, work_stress, exercise_duration, 
      cycle_phase, weather, social_interaction, meditation_time 
    } = req.body;

    // Validate required fields
    if (!age || !sleep_hours || !work_stress || !exercise_duration) {
      return res.status(400).json({
        success: false,
        message: 'Age, sleep hours, work stress, and exercise duration are required'
      });
    }

    // Get prediction from ML service
    const prediction = await svmMoodService.predictMood({
      age: parseInt(age),
      sleep_hours: parseFloat(sleep_hours),
      work_stress: parseInt(work_stress),
      exercise_duration: parseInt(exercise_duration),
      cycle_phase: cycle_phase || 'follicular',
      weather: weather || 'sunny',
      social_interaction: parseInt(social_interaction) || 0,
      meditation_time: parseInt(meditation_time) || 0
    });

    res.json({
      success: true,
      prediction: prediction
    });

  } catch (error) {
    console.error('Mood prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get mood prediction',
      error: error.message
    });
  }
};

export const getMoodClassification = async (req, res) => {
  try {
    const { 
      age, sleep_hours, work_stress, exercise_duration, 
      cycle_phase, weather, social_interaction, meditation_time 
    } = req.body;

    // Get mood classification from ML service
    const classification = await svmMoodService.classifyMood({
      age: parseInt(age),
      sleep_hours: parseFloat(sleep_hours),
      work_stress: parseInt(work_stress),
      exercise_duration: parseInt(exercise_duration),
      cycle_phase: cycle_phase || 'follicular',
      weather: weather || 'sunny',
      social_interaction: parseInt(social_interaction) || 0,
      meditation_time: parseInt(meditation_time) || 0
    });

    res.json({
      success: true,
      classification: classification
    });

  } catch (error) {
    console.error('Mood classification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to classify mood',
      error: error.message
    });
  }
};

export const getMoodIntensity = async (req, res) => {
  try {
    const { 
      age, sleep_hours, work_stress, exercise_duration, 
      cycle_phase, weather, social_interaction, meditation_time 
    } = req.body;

    // Get mood intensity from ML service
    const intensity = await svmMoodService.predictMoodIntensity({
      age: parseInt(age),
      sleep_hours: parseFloat(sleep_hours),
      work_stress: parseInt(work_stress),
      exercise_duration: parseInt(exercise_duration),
      cycle_phase: cycle_phase || 'follicular',
      weather: weather || 'sunny',
      social_interaction: parseInt(social_interaction) || 0,
      meditation_time: parseInt(meditation_time) || 0
    });

    res.json({
      success: true,
      intensity: intensity
    });

  } catch (error) {
    console.error('Mood intensity prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to predict mood intensity',
      error: error.message
    });
  }
};

export const getMoodTrends = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's mood trends
    const trends = await svmMoodService.getMoodTrends(userId);
    
    res.json({
      success: true,
      trends: trends
    });

  } catch (error) {
    console.error('Get mood trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get mood trends',
      error: error.message
    });
  }
};