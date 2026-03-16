import axios from 'axios';

const SVM_API_URL = 'http://localhost:5005';

class SVMMoodService {
  async predictMood(data) {
    try {
      const response = await axios.post(`${SVM_API_URL}/predict/mood`, data);
      return response.data;
    } catch (error) {
      console.error('SVM API error:', error.message);
      // Fallback to rule-based prediction
      return this.getFallbackMoodPrediction(data);
    }
  }

  async classifyMood(data) {
    try {
      const response = await axios.post(`${SVM_API_URL}/classify`, data);
      return response.data;
    } catch (error) {
      console.error('SVM API error:', error.message);
      return this.getFallbackMoodClassification(data);
    }
  }

  async predictMoodIntensity(data) {
    try {
      const response = await axios.post(`${SVM_API_URL}/predict/intensity`, data);
      return response.data;
    } catch (error) {
      console.error('SVM API error:', error.message);
      return this.getFallbackMoodIntensity(data);
    }
  }

  async getMoodTrends(userId) {
    try {
      const response = await axios.get(`${SVM_API_URL}/user/${userId}/trends`);
      return response.data;
    } catch (error) {
      console.error('SVM API error:', error.message);
      return [];
    }
  }

  getFallbackMoodPrediction(data) {
    // Simple rule-based fallback for mood prediction
    let moodScore = 5; // neutral baseline
    
    // Sleep factor
    if (data.sleep_hours >= 8) moodScore += 2;
    else if (data.sleep_hours >= 6) moodScore += 1;
    else if (data.sleep_hours < 5) moodScore -= 2;
    
    // Work stress factor
    if (data.work_stress <= 3) moodScore += 2;
    else if (data.work_stress <= 5) moodScore += 1;
    else if (data.work_stress >= 8) moodScore -= 2;
    
    // Exercise factor
    if (data.exercise_duration >= 45) moodScore += 2;
    else if (data.exercise_duration >= 30) moodScore += 1;
    else if (data.exercise_duration < 15) moodScore -= 1;
    
    // Cycle phase factor
    const cycleFactors = {
      'menstrual': -1,
      'follicular': 1,
      'ovulation': 2,
      'luteal': 0
    };
    moodScore += cycleFactors[data.cycle_phase] || 0;
    
    // Weather factor
    const weatherFactors = {
      'sunny': 2,
      'cloudy': 0,
      'rainy': -1,
      'stormy': -2,
      'snowy': 0
    };
    moodScore += weatherFactors[data.weather] || 0;
    
    // Social interaction factor
    if (data.social_interaction >= 4) moodScore += 2;
    else if (data.social_interaction >= 2) moodScore += 1;
    else if (data.social_interaction === 0) moodScore -= 1;
    
    // Meditation factor
    if (data.meditation_time >= 20) moodScore += 2;
    else if (data.meditation_time >= 10) moodScore += 1;
    
    // Determine mood
    let mood, confidence;
    if (moodScore >= 8) {
      mood = 'Happy';
      confidence = Math.min(95, 70 + moodScore * 2);
    } else if (moodScore >= 6) {
      mood = 'Excited';
      confidence = Math.min(90, 65 + moodScore * 2);
    } else if (moodScore >= 4) {
      mood = 'Calm';
      confidence = Math.min(85, 60 + moodScore * 2);
    } else if (moodScore >= 2) {
      mood = 'Neutral';
      confidence = Math.min(80, 55 + moodScore * 2);
    } else if (moodScore >= 0) {
      mood = 'Sad';
      confidence = Math.min(75, 50 + moodScore * 2);
    } else if (moodScore >= -2) {
      mood = 'Anxious';
      confidence = Math.min(70, 45 + Math.abs(moodScore) * 2);
    } else {
      mood = 'Stressed';
      confidence = Math.min(65, 40 + Math.abs(moodScore) * 2);
    }
    
    // Generate mood probabilities
    const moodProbabilities = {
      'Happy': mood === 'Happy' ? confidence : Math.max(0, confidence - 30),
      'Excited': mood === 'Excited' ? confidence : Math.max(0, confidence - 30),
      'Calm': mood === 'Calm' ? confidence : Math.max(0, confidence - 30),
      'Neutral': mood === 'Neutral' ? confidence : Math.max(0, confidence - 30),
      'Sad': mood === 'Sad' ? confidence : Math.max(0, confidence - 30),
      'Anxious': mood === 'Anxious' ? confidence : Math.max(0, confidence - 30),
      'Stressed': mood === 'Stressed' ? confidence : Math.max(0, confidence - 30),
      'Depressed': mood === 'Depressed' ? confidence : Math.max(0, confidence - 40),
      'Energetic': mood === 'Energetic' ? confidence : Math.max(0, confidence - 40),
      'Tired': mood === 'Tired' ? confidence : Math.max(0, confidence - 40),
      'Irritable': mood === 'Irritable' ? confidence : Math.max(0, confidence - 40),
      'Frustrated': mood === 'Frustrated' ? confidence : Math.max(0, confidence - 40)
    };
    
    return {
      mood: mood,
      confidence: Math.round(confidence),
      model_used: 'Rule-based Fallback',
      mood_probabilities: moodProbabilities,
      recommendations: this.getMoodRecommendations(mood, data)
    };
  }

  getFallbackMoodClassification(data) {
    const prediction = this.getFallbackMoodPrediction(data);
    return {
      classification: prediction.mood,
      confidence: prediction.confidence,
      model_used: 'Rule-based Fallback',
      category_probabilities: prediction.mood_probabilities
    };
  }

  getFallbackMoodIntensity(data) {
    const prediction = this.getFallbackMoodPrediction(data);
    
    // Map mood to intensity (1-10 scale)
    const moodIntensity = {
      'Happy': 8,
      'Excited': 9,
      'Calm': 6,
      'Neutral': 5,
      'Sad': 3,
      'Anxious': 4,
      'Stressed': 7,
      'Depressed': 2,
      'Energetic': 9,
      'Tired': 2,
      'Irritable': 6,
      'Frustrated': 7
    };
    
    const intensity = moodIntensity[prediction.mood] || 5;
    
    return {
      intensity: intensity,
      confidence: prediction.confidence,
      model_used: 'Rule-based Fallback',
      intensity_probabilities: {
        '1': intensity === 1 ? prediction.confidence : Math.max(0, prediction.confidence - 40),
        '2': intensity === 2 ? prediction.confidence : Math.max(0, prediction.confidence - 40),
        '3': intensity === 3 ? prediction.confidence : Math.max(0, prediction.confidence - 40),
        '4': intensity === 4 ? prediction.confidence : Math.max(0, prediction.confidence - 40),
        '5': intensity === 5 ? prediction.confidence : Math.max(0, prediction.confidence - 40),
        '6': intensity === 6 ? prediction.confidence : Math.max(0, prediction.confidence - 40),
        '7': intensity === 7 ? prediction.confidence : Math.max(0, prediction.confidence - 40),
        '8': intensity === 8 ? prediction.confidence : Math.max(0, prediction.confidence - 40),
        '9': intensity === 9 ? prediction.confidence : Math.max(0, prediction.confidence - 40),
        '10': intensity === 10 ? prediction.confidence : Math.max(0, prediction.confidence - 40)
      }
    };
  }

  getMoodRecommendations(mood, data) {
    const recommendations = {
      'Happy': [
        'Continue your current positive habits',
        'Share your good mood with others',
        'Consider journaling about what makes you happy'
      ],
      'Excited': [
        'Channel your energy into productive activities',
        'Plan something fun to look forward to',
        'Be mindful not to overexert yourself'
      ],
      'Calm': [
        'Maintain your peaceful state',
        'Practice mindfulness or meditation',
        'Enjoy this moment of tranquility'
      ],
      'Neutral': [
        'Consider what might boost your mood',
        'Engage in activities you enjoy',
        'Connect with friends or family'
      ],
      'Sad': [
        'Be gentle with yourself',
        'Reach out to supportive people',
        'Consider professional help if sadness persists'
      ],
      'Anxious': [
        'Practice deep breathing exercises',
        'Try progressive muscle relaxation',
        'Consider mindfulness techniques'
      ],
      'Stressed': [
        'Take breaks throughout the day',
        'Prioritize self-care activities',
        'Consider stress management techniques'
      ],
      'Depressed': [
        'Seek professional help',
        'Maintain social connections',
        'Consider therapy or counseling'
      ],
      'Energetic': [
        'Use your energy for physical activity',
        'Tackle challenging tasks',
        'Be mindful of rest needs'
      ],
      'Tired': [
        'Prioritize rest and sleep',
        'Check your sleep hygiene',
        'Consider if you need more downtime'
      ],
      'Irritable': [
        'Take time to cool down',
        'Identify what\'s causing irritation',
        'Practice patience techniques'
      ],
      'Frustrated': [
        'Step back from the situation',
        'Break tasks into smaller steps',
        'Ask for help if needed'
      ]
    };
    
    return recommendations[mood] || [
      'Pay attention to your emotional needs',
      'Consider what factors influence your mood',
      'Practice self-compassion'
    ];
  }
}

export default new SVMMoodService();