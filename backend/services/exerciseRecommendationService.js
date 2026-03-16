import axios from 'axios';

const EXERCISE_API_URL = 'http://localhost:5006';

class ExerciseRecommendationService {
  async getExerciseRecommendation(data) {
    try {
      const response = await axios.post(`${EXERCISE_API_URL}/recommend_exercise`, data);
      return response.data;
    } catch (error) {
      console.error('Exercise API error:', error.message);
      // Fallback to rule-based recommendation
      return this.getFallbackRecommendation(data);
    }
  }

  async detectPhase(data) {
    try {
      const response = await axios.post(`${EXERCISE_API_URL}/detect_phase`, data);
      return response.data;
    } catch (error) {
      console.error('Phase detection API error:', error.message);
      return this.getFallbackPhaseDetection(data);
    }
  }

  async submitFeedback(feedback) {
    try {
      const response = await axios.post(`${EXERCISE_API_URL}/feedback`, feedback);
      return response.data;
    } catch (error) {
      console.error('Feedback API error:', error.message);
      return { success: false, error: error.message };
    }
  }

  getFallbackRecommendation(data) {
    // Simple rule-based fallback
    const phase = data.phase || 'unknown';
    const energyLevel = data.energy_level || 5;
    const cramps = data.cramps || 0;
    const fitnessLevel = data.fitness_level || 'beginner';

    let recommendedExercise, explanation;

    if (phase === 'menstruation') {
      if (cramps >= 6 || energyLevel <= 3) {
        recommendedExercise = 'rest';
        explanation = 'High cramps and low energy - rest is recommended during menstruation';
      } else if (cramps >= 4) {
        recommendedExercise = 'light_yoga';
        explanation = 'Gentle yoga can help with cramps and low energy';
      } else {
        recommendedExercise = 'walking';
        explanation = 'Light walking can help with energy during menstruation';
      }
    } else if (phase === 'follicular') {
      if (energyLevel >= 7) {
        recommendedExercise = 'cardio';
        explanation = 'High energy in follicular phase - cardio is ideal';
      } else if (energyLevel >= 5) {
        recommendedExercise = 'strength';
        explanation = 'Good energy for strength training';
      } else {
        recommendedExercise = 'walking';
        explanation = 'Moderate energy - walking is a good choice';
      }
    } else if (phase === 'ovulation') {
      if (energyLevel >= 8) {
        recommendedExercise = 'cardio';
        explanation = 'Peak energy during ovulation - cardio is optimal';
      } else if (energyLevel >= 6) {
        recommendedExercise = 'strength';
        explanation = 'High energy - strength training recommended';
      } else {
        recommendedExercise = 'walking';
        explanation = 'Moderate energy - walking is suitable';
      }
    } else if (phase === 'luteal') {
      if (cramps >= 5 || energyLevel <= 4) {
        recommendedExercise = 'meditation';
        explanation = 'Low energy and cramps - meditation is calming';
      } else if (energyLevel >= 6) {
        recommendedExercise = 'walking';
        explanation = 'Moderate energy - walking is gentle and effective';
      } else {
        recommendedExercise = 'stretching';
        explanation = 'Low energy - stretching is gentle and beneficial';
      }
    } else {
      recommendedExercise = 'walking';
      explanation = 'Default recommendation - walking is always safe';
    }

    return {
      success: true,
      phase: phase,
      day_in_cycle: data.day_in_cycle || 1,
      recommended_exercise: recommendedExercise,
      confidence: 0.8,
      explanation: explanation,
      safety_notes: this.getSafetyNotes(recommendedExercise, phase, cramps),
      exercise_probabilities: { [recommendedExercise]: 0.8 },
      model_used: 'Rule-based Fallback',
      phase_info: {
        phase: phase,
        day_in_cycle: data.day_in_cycle || 1,
        avg_cycle_length: 28,
        avg_period_length: 5
      }
    };
  }

  getFallbackPhaseDetection(data) {
    // Simple phase detection fallback
    const today = new Date(data.today || new Date().toISOString().split('T')[0]);
    const startDates = data.period_start_dates || [];
    
    if (startDates.length === 0) {
      return {
        success: true,
        phase_info: {
          phase: 'unknown',
          day_in_cycle: 0,
          avg_cycle_length: 28,
          avg_period_length: 5,
          next_period_start: new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          days_until_period: 28
        }
      };
    }

    // Simple calculation
    const lastStart = new Date(startDates[startDates.length - 1]);
    const daysSinceLastPeriod = Math.floor((today - lastStart) / (1000 * 60 * 60 * 24));
    const dayInCycle = (daysSinceLastPeriod % 28) + 1;

    let phase;
    if (dayInCycle <= 5) {
      phase = 'menstruation';
    } else if (dayInCycle <= 13) {
      phase = 'follicular';
    } else if (dayInCycle <= 16) {
      phase = 'ovulation';
    } else {
      phase = 'luteal';
    }

    return {
      success: true,
      phase_info: {
        phase: phase,
        day_in_cycle: dayInCycle,
        avg_cycle_length: 28,
        avg_period_length: 5,
        next_period_start: new Date(lastStart.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        days_until_period: 28 - dayInCycle
      }
    };
  }

  getSafetyNotes(exerciseType, phase, cramps) {
    const safetyNotes = {
      'rest': [
        "Listen to your body and rest when needed",
        "Gentle stretching can still be beneficial"
      ],
      'light_yoga': [
        "Avoid intense poses during heavy bleeding",
        "Stop if you feel dizzy or nauseous",
        "Focus on gentle, restorative poses"
      ],
      'stretching': [
        "Hold stretches for 30-60 seconds",
        "Don't force any positions",
        "Stop if you feel sharp pain"
      ],
      'walking': [
        "Start with a comfortable pace",
        "Stay hydrated",
        "Stop if you feel lightheaded"
      ],
      'cardio': [
        "Warm up properly before starting",
        "Monitor your heart rate",
        "Stop if you feel chest pain or difficulty breathing"
      ],
      'strength': [
        "Use proper form to prevent injury",
        "Start with lighter weights",
        "Don't hold your breath during lifts"
      ],
      'meditation': [
        "Find a quiet, comfortable space",
        "Focus on your breathing",
        "Don't judge your thoughts, just observe them"
      ]
    };

    let notes = safetyNotes[exerciseType] || ["Listen to your body and stop if you feel pain"];

    // Add phase-specific notes
    if (phase === 'menstruation' && cramps >= 5) {
      notes.push("Consider using heat therapy for cramps");
      notes.push("Avoid high-impact activities during heavy bleeding");
    }

    return notes;
  }
}

export default new ExerciseRecommendationService();
