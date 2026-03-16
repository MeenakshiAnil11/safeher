import axios from 'axios';

const DECISION_TREE_API_URL = 'http://localhost:5004';

class DecisionTreePregnancyService {
  async getPregnancyHealthPrediction(data) {
    try {
      const response = await axios.post(`${DECISION_TREE_API_URL}/predict`, data);
      return response.data;
    } catch (error) {
      console.error('Decision Tree API error:', error.message);
      // Fallback to rule-based prediction
      return this.getFallbackPrediction(data);
    }
  }

  async getUserPregnancyRisk(userId) {
    try {
      const response = await axios.get(`${DECISION_TREE_API_URL}/user/${userId}/risk`);
      return response.data;
    } catch (error) {
      console.error('Decision Tree API error:', error.message);
      return null;
    }
  }

  async getPregnancyComplications(userId) {
    try {
      const response = await axios.get(`${DECISION_TREE_API_URL}/user/${userId}/complications`);
      return response.data;
    } catch (error) {
      console.error('Decision Tree API error:', error.message);
      return [];
    }
  }

  async getPregnancyTrends(userId) {
    try {
      const response = await axios.get(`${DECISION_TREE_API_URL}/user/${userId}/trends`);
      return response.data;
    } catch (error) {
      console.error('Decision Tree API error:', error.message);
      return [];
    }
  }

  getFallbackPrediction(data) {
    // Simple rule-based fallback for pregnancy health
    let riskScore = 0;
    let complications = [];
    
    // Week factor
    if (data.week > 40) riskScore += 2;
    else if (data.week > 35) riskScore += 1;
    
    // Weight factor
    if (data.weight > 100) riskScore += 2;
    else if (data.weight < 50) riskScore += 1;
    
    // Blood pressure factor
    if (data.blood_pressure_systolic > 140 || data.blood_pressure_diastolic > 90) {
      riskScore += 3;
      complications.push('Hypertension');
    }
    
    // Blood sugar factor
    if (data.blood_sugar > 140) {
      riskScore += 3;
      complications.push('Gestational Diabetes');
    }
    
    // Energy and mood factors
    if (data.energy < 3) riskScore += 1;
    if (data.mood === 'depressed' || data.mood === 'anxious') riskScore += 1;
    
    // Sleep factor
    if (data.sleep_hours < 6) riskScore += 1;
    
    // Nutrition factor
    if (data.nutrition_score < 3) riskScore += 2;
    
    // Exercise factor
    if (data.exercise_minutes < 15) riskScore += 1;
    
    // Determine health status
    let healthStatus, confidence;
    if (riskScore >= 8) {
      healthStatus = 'High Risk';
      confidence = Math.min(95, 70 + riskScore);
    } else if (riskScore >= 5) {
      healthStatus = 'Moderate Risk';
      confidence = Math.min(90, 65 + riskScore);
    } else if (riskScore >= 2) {
      healthStatus = 'Low Risk';
      confidence = Math.min(85, 60 + riskScore);
    } else {
      healthStatus = 'Excellent';
      confidence = Math.min(80, 55 + riskScore);
    }
    
    return {
      health_status: healthStatus,
      confidence: Math.round(confidence),
      model_used: 'Rule-based Fallback',
      complications: complications,
      recommendations: this.getRecommendations(healthStatus, complications),
      risk_probabilities: {
        'Excellent': Math.max(0, 100 - riskScore * 12),
        'Low Risk': Math.max(0, riskScore * 6),
        'Moderate Risk': Math.max(0, riskScore * 4),
        'High Risk': Math.max(0, riskScore * 2)
      }
    };
  }

  getRecommendations(healthStatus, complications) {
    const baseRecommendations = [
      'Attend all prenatal appointments',
      'Take prenatal vitamins',
      'Maintain a balanced diet',
      'Stay hydrated',
      'Get adequate rest'
    ];
    
    const riskRecommendations = {
      'High Risk': [
        'Consult with high-risk pregnancy specialist',
        'Monitor blood pressure regularly',
        'Consider bed rest if recommended',
        'Report any concerning symptoms immediately'
      ],
      'Moderate Risk': [
        'Increase monitoring frequency',
        'Consider additional tests',
        'Modify activity level as needed',
        'Focus on stress management'
      ],
      'Low Risk': [
        'Continue regular prenatal care',
        'Maintain healthy lifestyle',
        'Stay active with doctor approval',
        'Monitor symptoms'
      ],
      'Excellent': [
        'Continue current healthy habits',
        'Maintain regular exercise',
        'Keep up with prenatal appointments',
        'Enjoy your pregnancy!'
      ]
    };
    
    const complicationRecommendations = {
      'Hypertension': [
        'Monitor blood pressure daily',
        'Reduce sodium intake',
        'Consider medication if prescribed',
        'Report severe headaches or vision changes'
      ],
      'Gestational Diabetes': [
        'Monitor blood sugar levels',
        'Follow diabetic diet',
        'Exercise regularly',
        'Consider insulin if needed'
      ]
    };
    
    let recommendations = [...baseRecommendations];
    
    if (riskRecommendations[healthStatus]) {
      recommendations = [...recommendations, ...riskRecommendations[healthStatus]];
    }
    
    complications.forEach(complication => {
      if (complicationRecommendations[complication]) {
        recommendations = [...recommendations, ...complicationRecommendations[complication]];
      }
    });
    
    return recommendations;
  }
}

export default new DecisionTreePregnancyService();