import axios from 'axios';

const KNN_API_URL = 'http://localhost:5002';

class KNNHealthRiskService {
  async getHealthRiskPrediction(data) {
    try {
      const response = await axios.post(`${KNN_API_URL}/predict`, data);
      return response.data;
    } catch (error) {
      console.error('KNN API error:', error.message);
      // Fallback to rule-based prediction
      return this.getFallbackPrediction(data);
    }
  }

  async getUserHealthRisk(userId) {
    try {
      const response = await axios.get(`${KNN_API_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('KNN API error:', error.message);
      return null;
    }
  }

  async getHealthRiskTrends(userId) {
    try {
      const response = await axios.get(`${KNN_API_URL}/trends/${userId}`);
      return response.data;
    } catch (error) {
      console.error('KNN API error:', error.message);
      return [];
    }
  }

  getFallbackPrediction(data) {
    // Simple rule-based fallback
    let riskScore = 0;
    
    // Age factor
    if (data.age > 65) riskScore += 3;
    else if (data.age > 50) riskScore += 2;
    else if (data.age > 35) riskScore += 1;
    
    // BMI factor
    if (data.bmi > 30) riskScore += 3;
    else if (data.bmi > 25) riskScore += 2;
    else if (data.bmi < 18.5) riskScore += 1;
    
    // Blood pressure factor
    if (data.systolic > 140 || data.diastolic > 90) riskScore += 3;
    else if (data.systolic > 130 || data.diastolic > 80) riskScore += 2;
    
    // Heart rate factor
    if (data.heart_rate > 100) riskScore += 2;
    else if (data.heart_rate < 60) riskScore += 1;
    
    // Blood sugar factor
    if (data.blood_sugar > 126) riskScore += 3;
    else if (data.blood_sugar > 100) riskScore += 1;
    
    // Cholesterol factor
    if (data.cholesterol > 240) riskScore += 2;
    else if (data.cholesterol > 200) riskScore += 1;
    
    // Iron level factor
    if (data.iron_level < 12) riskScore += 2;
    else if (data.iron_level < 15) riskScore += 1;
    
    // Determine risk level
    let healthRisk, confidence;
    if (riskScore >= 12) {
      healthRisk = 'Critical Risk';
      confidence = Math.min(95, 70 + riskScore);
    } else if (riskScore >= 8) {
      healthRisk = 'High Risk';
      confidence = Math.min(90, 65 + riskScore);
    } else if (riskScore >= 4) {
      healthRisk = 'Moderate Risk';
      confidence = Math.min(85, 60 + riskScore);
    } else {
      healthRisk = 'Low Risk';
      confidence = Math.min(80, 55 + riskScore);
    }
    
    return {
      health_risk: healthRisk,
      confidence: Math.round(confidence),
      model_used: 'Rule-based Fallback',
      risk_probabilities: {
        'Low Risk': Math.max(0, 100 - riskScore * 8),
        'Moderate Risk': Math.max(0, riskScore * 4),
        'High Risk': Math.max(0, riskScore * 2),
        'Critical Risk': Math.max(0, riskScore * 1)
      }
    };
  }
}

export default new KNNHealthRiskService();