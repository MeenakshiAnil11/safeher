import React, { useState } from 'react';
import './MoodPrediction.css';

const MoodPrediction = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    age: '',
    sleep_hours: '',
    work_stress: '',
    exercise_duration: '',
    cycle_phase: 'follicular',
    weather: 'sunny',
    social_interaction: '',
    meditation_time: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/mood/prediction/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setPrediction(data.prediction);
      } else {
        setError(data.message || 'Prediction failed');
      }
    } catch (err) {
      setError('Failed to get prediction: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const moodEmoji = (m) => {
    const moods = { Happy: '😊', Excited: '🤩', Calm: '😌', Neutral: '😐', Sad: '😢', Anxious: '😰', Stressed: '😣', Depressed: '😞', Energetic: '💪', Tired: '😴', Irritable: '😤', Frustrated: '😠', Good: '😊' };
    return moods[m] || '😊';
  };

  return (
    <div className="mp-page">
      <h2 className="mp-title"><span style={{ marginRight: 6 }}>😊</span> Mood Prediction & Analysis</h2>
      <p className="mp-subtitle">AI-powered insights into your emotional patterns</p>

      <div className="mp-info-bar">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#7c3aed" strokeWidth="1.5"/><path d="M8 5v3M8 10h.01" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/></svg>
        Based on your recent mood logs, sleep patterns, and activity levels, our AI predicts your emotional state.
      </div>

      {!prediction && (
        <form onSubmit={handleSubmit} className="mp-form">
          <div className="mp-form-grid">
            <div className="mp-field"><label>Age</label><input type="number" name="age" value={formData.age} onChange={handleInputChange} placeholder="28" required /></div>
            <div className="mp-field"><label>Sleep Hours</label><input type="number" name="sleep_hours" value={formData.sleep_hours} onChange={handleInputChange} min="3" max="15" step="0.5" placeholder="7.5" required /></div>
            <div className="mp-field"><label>Work Stress (1-10)</label><input type="number" name="work_stress" value={formData.work_stress} onChange={handleInputChange} min="1" max="10" placeholder="5" required /></div>
            <div className="mp-field"><label>Exercise (min)</label><input type="number" name="exercise_duration" value={formData.exercise_duration} onChange={handleInputChange} min="0" max="180" placeholder="30" required /></div>
            <div className="mp-field"><label>Cycle Phase</label>
              <select name="cycle_phase" value={formData.cycle_phase} onChange={handleInputChange}><option value="menstrual">Menstrual</option><option value="follicular">Follicular</option><option value="ovulation">Ovulation</option><option value="luteal">Luteal</option></select>
            </div>
            <div className="mp-field"><label>Weather</label>
              <select name="weather" value={formData.weather} onChange={handleInputChange}><option value="sunny">Sunny</option><option value="cloudy">Cloudy</option><option value="rainy">Rainy</option><option value="stormy">Stormy</option><option value="snowy">Snowy</option></select>
            </div>
            <div className="mp-field"><label>Social (hrs)</label><input type="number" name="social_interaction" value={formData.social_interaction} onChange={handleInputChange} min="0" max="24" placeholder="3" required /></div>
            <div className="mp-field"><label>Meditation (min)</label><input type="number" name="meditation_time" value={formData.meditation_time} onChange={handleInputChange} min="0" max="120" placeholder="10" required /></div>
          </div>
          <button type="submit" disabled={loading} className="mp-predict-btn">
            {loading ? 'Analyzing Mood...' : 'Predict My Mood'}
          </button>
        </form>
      )}

      {error && <div className="mp-error">❌ {error}</div>}

      {prediction && (
        <>
          <div className="mp-result-grid">
            <div className="mp-prediction-card">
              <h3>Today's Mood Prediction</h3>
              <div className="mp-emoji">{moodEmoji(prediction.mood)}</div>
              <div className="mp-mood-text">{prediction.mood}</div>
              <div className="mp-confidence">Confidence: {prediction.confidence}%</div>
            </div>
            <div className="mp-factors-card">
              <h3>Key Factors</h3>
              <div className="mp-factor-item">
                <div className="mp-factor-label"><span>Sleep Quality</span><span className="mp-factor-impact high">High Impact</span></div>
                <div className="mp-factor-bar"><div className="mp-factor-fill" style={{ width: '85%' }} /></div>
              </div>
              <div className="mp-factor-item">
                <div className="mp-factor-label"><span>Physical Activity</span><span className="mp-factor-impact medium">Medium Impact</span></div>
                <div className="mp-factor-bar"><div className="mp-factor-fill" style={{ width: '65%' }} /></div>
              </div>
              <div className="mp-factor-item">
                <div className="mp-factor-label"><span>Stress Levels</span><span className="mp-factor-impact low">Low Impact</span></div>
                <div className="mp-factor-bar"><div className="mp-factor-fill" style={{ width: '35%' }} /></div>
              </div>
            </div>
          </div>

          <div className="mp-insights">
            <h3>Mood Pattern Insights:</h3>
            <div className="mp-insight-item green">
              <span className="mp-insight-dot green" />
              Your mood improves significantly on days with 7+ hours of sleep
            </div>
            <div className="mp-insight-item green">
              <span className="mp-insight-dot green" />
              Exercise correlates with 30% improvement in mood scores
            </div>
            <div className="mp-insight-item pink">
              <span className="mp-insight-dot pink" />
              Mid-week (Wed-Thu) shows lower mood - consider stress management techniques
            </div>
          </div>

          <button className="mp-reset-btn" onClick={() => setPrediction(null)}>Run New Prediction</button>
        </>
      )}
    </div>
  );
};

export default MoodPrediction;
