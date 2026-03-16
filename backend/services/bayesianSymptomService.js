import axios from 'axios';

const BAYESIAN_API_URL = 'http://localhost:5003';

class BayesianSymptomService {
  async classifySymptoms(data) {
    try {
      const response = await axios.post(`${BAYESIAN_API_URL}/classify`, data);
      return response.data;
    } catch (error) {
      console.error('Bayesian API error:', error.message);
      // Fallback to rule-based classification
      return this.getFallbackClassification(data);
    }
  }

  async getUserSymptomHistory(userId) {
    try {
      const response = await axios.get(`${BAYESIAN_API_URL}/user/${userId}/history`);
      return response.data;
    } catch (error) {
      console.error('Bayesian API error:', error.message);
      return [];
    }
  }

  async getSymptomInsights(userId) {
    try {
      const response = await axios.get(`${BAYESIAN_API_URL}/user/${userId}/insights`);
      return response.data;
    } catch (error) {
      console.error('Bayesian API error:', error.message);
      return [];
    }
  }

  getFallbackClassification(data) {
    // Simple rule-based fallback
    const symptoms = data.symptoms || [];
    const mood = data.mood || 'neutral';
    const severity = data.severity || 3;
    
    // Basic symptom categorization
    const categories = {
      'Digestive': ['nausea', 'vomiting', 'diarrhea', 'constipation', 'stomach pain', 'bloating'],
      'Neurological': ['headache', 'dizziness', 'fatigue', 'confusion', 'memory issues'],
      'Cardiovascular': ['chest pain', 'palpitations', 'shortness of breath', 'rapid heartbeat'],
      'Reproductive': ['cramps', 'irregular bleeding', 'pelvic pain', 'breast tenderness'],
      'Musculoskeletal': ['back pain', 'joint pain', 'muscle aches', 'stiffness'],
      'Mental Health': ['anxiety', 'depression', 'mood swings', 'irritability', 'stress']
    };
    
    let predictedCategory = 'General';
    let maxMatches = 0;
    
    for (const [category, keywords] of Object.entries(categories)) {
      const matches = symptoms.filter(symptom => 
        keywords.some(keyword => symptom.toLowerCase().includes(keyword))
      ).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        predictedCategory = category;
      }
    }
    
    // Adjust confidence based on severity and mood
    let confidence = 60 + (severity * 5);
    if (mood === 'anxious' || mood === 'stressed') confidence += 10;
    if (mood === 'depressed' || mood === 'sad') confidence += 5;
    
    confidence = Math.min(95, confidence);
    
    return {
      category: predictedCategory,
      confidence: Math.round(confidence),
      model_used: 'Rule-based Fallback',
      category_probabilities: {
        'Digestive': predictedCategory === 'Digestive' ? confidence : Math.max(0, confidence - 30),
        'Neurological': predictedCategory === 'Neurological' ? confidence : Math.max(0, confidence - 30),
        'Cardiovascular': predictedCategory === 'Cardiovascular' ? confidence : Math.max(0, confidence - 30),
        'Reproductive': predictedCategory === 'Reproductive' ? confidence : Math.max(0, confidence - 30),
        'Musculoskeletal': predictedCategory === 'Musculoskeletal' ? confidence : Math.max(0, confidence - 30),
        'Mental Health': predictedCategory === 'Mental Health' ? confidence : Math.max(0, confidence - 30),
        'General': predictedCategory === 'General' ? confidence : Math.max(0, confidence - 40)
      },
      recommendations: this.getRecommendations(predictedCategory, severity)
    };
  }

  getRecommendations(category, severity) {
    const recommendations = {
      'Digestive': [
        'Stay hydrated',
        'Eat small, frequent meals',
        'Avoid spicy or fatty foods',
        'Consider probiotics'
      ],
      'Neurological': [
        'Get adequate sleep',
        'Manage stress levels',
        'Stay hydrated',
        'Consider consulting a neurologist if symptoms persist'
      ],
      'Cardiovascular': [
        'Monitor blood pressure',
        'Avoid excessive caffeine',
        'Practice deep breathing exercises',
        'Seek immediate medical attention for chest pain'
      ],
      'Reproductive': [
        'Track symptoms with your cycle',
        'Use heat therapy for cramps',
        'Maintain regular exercise',
        'Consider hormonal evaluation if symptoms are severe'
      ],
      'Musculoskeletal': [
        'Apply heat or cold therapy',
        'Gentle stretching exercises',
        'Maintain good posture',
        'Consider physical therapy for persistent pain'
      ],
      'Mental Health': [
        'Practice mindfulness or meditation',
        'Maintain regular sleep schedule',
        'Stay connected with support system',
        'Consider professional counseling'
      ],
      'General': [
        'Maintain regular health checkups',
        'Stay hydrated',
        'Get adequate sleep',
        'Manage stress levels'
      ]
    };
    
    return recommendations[category] || recommendations['General'];
  }
}

export default new BayesianSymptomService();