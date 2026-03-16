/**
 * ML Prediction Service for Ovulation Prediction
 * Calls the Python Flask API for ML-based predictions
 */

import axios from 'axios';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5001';

/**
 * Check if ML service is available
 */
export const checkMLService = async () => {
  try {
    const response = await axios.get(`${ML_API_URL}/health`, { timeout: 2000 });
    return response.data.status === 'ok' && response.data.model_loaded;
  } catch (error) {
    console.log('ML service not available:', error.message);
    return false;
  }
};

/**
 * Predict fertility status for a single day
 * 
 * @param {Object} fertilityData - Fertility tracking data
 * @param {number} fertilityData.cycle_day - Day of menstrual cycle
 * @param {number} fertilityData.bbt - Basal body temperature
 * @param {string} fertilityData.cervical_mucus - Cervical mucus type
 * @param {string} fertilityData.ovulation_test - Ovulation test result
 * @param {boolean} fertilityData.intercourse - Whether intercourse occurred
 * @param {number} fertilityData.energy - Energy level (1-10)
 * @param {number} fertilityData.stress - Stress level (1-10)
 * @param {number} fertilityData.sleep_hours - Sleep hours
 * @returns {Object} Prediction result with fertile status and probability
 */
export const predictFertility = async (fertilityData) => {
  try {
    const response = await axios.post(
      `${ML_API_URL}/predict`,
      {
        cycle_day: fertilityData.cycle_day || fertilityData.cycleDay || 14,
        bbt: fertilityData.bbt || 36.5,
        cervical_mucus: fertilityData.cervical_mucus || fertilityData.cervicalMucus || 'dry',
        ovulation_test: fertilityData.ovulation_test || fertilityData.ovulationTest || 'negative',
        intercourse: fertilityData.intercourse || false,
        energy: fertilityData.energy || 5,
        stress: fertilityData.stress || 5,
        sleep_hours: fertilityData.sleep_hours || fertilityData.sleepHours || 7.5
      },
      { timeout: 5000 }
    );

    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    console.error('ML prediction error:', error.message);
    return {
      success: false,
      error: error.message,
      fallback: true // Use rule-based fallback
    };
  }
};

/**
 * Predict fertility status for multiple days
 * 
 * @param {Array} fertilityRecords - Array of fertility tracking data
 * @returns {Array} Array of prediction results
 */
export const predictFertilityBatch = async (fertilityRecords) => {
  try {
    const response = await axios.post(
      `${ML_API_URL}/predict_batch`,
      {
        records: fertilityRecords.map(record => ({
          cycle_day: record.cycle_day || record.cycleDay || 14,
          bbt: record.bbt || 36.5,
          cervical_mucus: record.cervical_mucus || record.cervicalMucus || 'dry',
          ovulation_test: record.ovulation_test || record.ovulationTest || 'negative',
          intercourse: record.intercourse || false,
          energy: record.energy || 5,
          stress: record.stress || 5,
          sleep_hours: record.sleep_hours || record.sleepHours || 7.5
        }))
      },
      { timeout: 10000 }
    );

    return {
      success: true,
      results: response.data.results
    };
  } catch (error) {
    console.error('ML batch prediction error:', error.message);
    return {
      success: false,
      error: error.message,
      fallback: true
    };
  }
};

/**
 * Get fertility window prediction using ML
 * 
 * @param {Array} recentLogs - Recent fertility logs (last 7-30 days)
 * @returns {Object} Fertility window prediction
 */
export const predictFertilityWindow = async (recentLogs) => {
  if (!recentLogs || recentLogs.length === 0) {
    return {
      success: false,
      message: 'No fertility data available'
    };
  }

  // Try ML prediction first
  const mlAvailable = await checkMLService();
  
  if (mlAvailable) {
    try {
      const predictions = await predictFertilityBatch(recentLogs);
      
      if (predictions.success) {
        // Find fertile window based on predictions
        const fertileDays = [];
        predictions.results.forEach((prediction, index) => {
          if (prediction.fertile && prediction.confidence > 50) {
            fertileDays.push({
              date: recentLogs[index].date,
              cycle_day: recentLogs[index].cycle_day || recentLogs[index].cycleDay,
              probability: prediction.fertile_probability,
              confidence: prediction.confidence
            });
          }
        });

        return {
          success: true,
          ml_prediction: true,
          fertile_days: fertileDays,
          avg_fertile_probability: fertileDays.length > 0 
            ? fertileDays.reduce((sum, day) => sum + day.probability, 0) / fertileDays.length 
            : 0
        };
      }
    } catch (error) {
      console.error('ML prediction failed:', error.message);
    }
  }

  // Fallback to rule-based prediction
  return {
    success: true,
    ml_prediction: false,
    message: 'Using rule-based prediction',
    fallback: true
  };
};

export default {
  checkMLService,
  predictFertility,
  predictFertilityBatch,
  predictFertilityWindow
};

