import React, { useState, useEffect } from 'react';
import './ExerciseRecommendation.css';

const ExerciseRecommendation = () => {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phaseInfo, setPhaseInfo] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    today: new Date().toISOString().split('T')[0],
    period_start_dates: [],
    period_lengths: [],
    energy_level: 5,
    sleep_hours: 7.5,
    mood: 'neutral',
    cramps: 0,
    fitness_level: 'beginner'
  });

  const [periodStartDate, setPeriodStartDate] = useState('');
  const [periodLength, setPeriodLength] = useState(5);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addPeriodStart = () => {
    if (periodStartDate) {
      const newDates = [...formData.period_start_dates, periodStartDate];
      const newLengths = [...formData.period_lengths, parseInt(periodLength)];
      
      setFormData({
        ...formData,
        period_start_dates: newDates,
        period_lengths: newLengths
      });
      
      setPeriodStartDate('');
      setPeriodLength(5);
    }
  };

  const removePeriodStart = (index) => {
    const newDates = formData.period_start_dates.filter((_, i) => i !== index);
    const newLengths = formData.period_lengths.filter((_, i) => i !== index);
    
    setFormData({
      ...formData,
      period_start_dates: newDates,
      period_lengths: newLengths
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFeedbackSubmitted(false);

    try {
      const response = await fetch('/api/exercise/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setRecommendation(data);
        setPhaseInfo(data.phase_info);
      } else {
        setError(data.message || 'Recommendation failed');
      }
    } catch (err) {
      setError('Failed to get recommendation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (rating, actualExercise) => {
    try {
      const response = await fetch('/api/exercise/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          user_id: localStorage.getItem('userId'),
          recommended_exercise: recommendation.recommended_exercise,
          actual_exercise: actualExercise,
          rating: rating,
          phase: recommendation.phase,
          symptoms: {
            energy_level: formData.energy_level,
            cramps: formData.cramps,
            mood: formData.mood
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setFeedbackSubmitted(true);
      }
    } catch (err) {
      console.error('Feedback submission failed:', err);
    }
  };

  const getExerciseIcon = (exerciseType) => {
    const icons = {
      'rest': '😴',
      'light_yoga': '🧘‍♀️',
      'stretching': '🤸‍♀️',
      'walking': '🚶‍♀️',
      'cardio': '🏃‍♀️',
      'strength': '💪',
      'meditation': '🧘‍♀️'
    };
    return icons[exerciseType] || '🏃‍♀️';
  };

  const getPhaseColor = (phase) => {
    const colors = {
      'menstruation': '#e91e63',
      'follicular': '#4caf50',
      'ovulation': '#ff9800',
      'luteal': '#9c27b0',
      'unknown': '#9e9e9e'
    };
    return colors[phase] || '#9e9e9e';
  };

  return (
    <div className="exercise-recommendation">
      <h2>🏃‍♀️ Exercise Recommendation</h2>
      <p>Get personalized exercise recommendations based on your menstrual cycle and current symptoms.</p>

      <form onSubmit={handleSubmit} className="recommendation-form">
        <div className="form-section">
          <h3>📅 Period Tracking</h3>
          
          <div className="period-input-group">
            <div className="input-group">
              <label>Add Period Start Date</label>
              <input
                type="date"
                value={periodStartDate}
                onChange={(e) => setPeriodStartDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="input-group">
              <label>Period Length (days)</label>
              <input
                type="number"
                value={periodLength}
                onChange={(e) => setPeriodLength(e.target.value)}
                min="1"
                max="10"
              />
            </div>
            
            <button type="button" onClick={addPeriodStart} className="add-btn">
              Add Period
            </button>
          </div>

          {formData.period_start_dates.length > 0 && (
            <div className="period-list">
              <h4>Your Period History:</h4>
              {formData.period_start_dates.map((date, index) => (
                <div key={index} className="period-item">
                  <span>{date} ({formData.period_lengths[index]} days)</span>
                  <button 
                    type="button" 
                    onClick={() => removePeriodStart(index)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>💪 Current Symptoms</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Energy Level (1-10)</label>
              <input
                type="range"
                name="energy_level"
                value={formData.energy_level}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="slider"
              />
              <span className="slider-value">{formData.energy_level}</span>
            </div>

            <div className="form-group">
              <label>Cramps Level (0-10)</label>
              <input
                type="range"
                name="cramps"
                value={formData.cramps}
                onChange={handleInputChange}
                min="0"
                max="10"
                className="slider"
              />
              <span className="slider-value">{formData.cramps}</span>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Sleep Hours</label>
              <input
                type="number"
                name="sleep_hours"
                value={formData.sleep_hours}
                onChange={handleInputChange}
                min="3"
                max="15"
                step="0.5"
              />
            </div>

            <div className="form-group">
              <label>Mood</label>
              <select
                name="mood"
                value={formData.mood}
                onChange={handleInputChange}
              >
                <option value="happy">Happy</option>
                <option value="tired">Tired</option>
                <option value="irritable">Irritable</option>
                <option value="anxious">Anxious</option>
                <option value="calm">Calm</option>
                <option value="energetic">Energetic</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>

            <div className="form-group">
              <label>Fitness Level</label>
              <select
                name="fitness_level"
                value={formData.fitness_level}
                onChange={handleInputChange}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="recommend-btn">
          {loading ? 'Analyzing...' : 'Get Exercise Recommendation'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {phaseInfo && (
        <div className="phase-info">
          <h3>📊 Cycle Information</h3>
          <div 
            className="phase-card"
            style={{ borderColor: getPhaseColor(phaseInfo.phase) }}
          >
            <div className="phase-name">
              {phaseInfo.phase.charAt(0).toUpperCase() + phaseInfo.phase.slice(1)} Phase
            </div>
            <div className="phase-details">
              Day {phaseInfo.day_in_cycle} of cycle
            </div>
            {phaseInfo.days_until_period > 0 && (
              <div className="next-period">
                {phaseInfo.days_until_period} days until next period
              </div>
            )}
          </div>
        </div>
      )}

      {recommendation && (
        <div className="recommendation-result">
          <h3>🎯 Exercise Recommendation</h3>
          
          <div className="exercise-card">
            <div className="exercise-icon">
              {getExerciseIcon(recommendation.recommended_exercise)}
            </div>
            <div className="exercise-details">
              <div className="exercise-name">
                {recommendation.recommended_exercise.replace('_', ' ').toUpperCase()}
              </div>
              <div className="confidence">
                Confidence: {Math.round(recommendation.confidence * 100)}%
              </div>
              <div className="model-used">
                Model: {recommendation.model_used}
              </div>
            </div>
          </div>

          <div className="explanation">
            <h4>💡 Why this recommendation?</h4>
            <p>{recommendation.explanation}</p>
          </div>

          {recommendation.safety_notes && recommendation.safety_notes.length > 0 && (
            <div className="safety-notes">
              <h4>⚠️ Safety Notes</h4>
              <ul>
                {recommendation.safety_notes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {recommendation.exercise_probabilities && (
            <div className="exercise-probabilities">
              <h4>📊 All Exercise Probabilities</h4>
              {Object.entries(recommendation.exercise_probabilities)
                .sort(([,a], [,b]) => b - a)
                .map(([exercise, probability]) => (
                  <div key={exercise} className="probability-bar">
                    <span className="exercise-name">
                      {getExerciseIcon(exercise)} {exercise.replace('_', ' ')}
                    </span>
                    <div className="bar-container">
                      <div 
                        className="bar"
                        style={{ width: `${probability * 100}%` }}
                      ></div>
                      <span className="percentage">
                        {Math.round(probability * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {!feedbackSubmitted && (
            <div className="feedback-section">
              <h4>📝 How was this recommendation?</h4>
              <div className="feedback-buttons">
                <button 
                  onClick={() => submitFeedback(5, recommendation.recommended_exercise)}
                  className="feedback-btn good"
                >
                  👍 Helpful
                </button>
                <button 
                  onClick={() => submitFeedback(3, recommendation.recommended_exercise)}
                  className="feedback-btn neutral"
                >
                  😐 Okay
                </button>
                <button 
                  onClick={() => submitFeedback(1, recommendation.recommended_exercise)}
                  className="feedback-btn bad"
                >
                  👎 Not helpful
                </button>
              </div>
            </div>
          )}

          {feedbackSubmitted && (
            <div className="feedback-thanks">
              ✅ Thank you for your feedback! It helps us improve recommendations.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExerciseRecommendation;
