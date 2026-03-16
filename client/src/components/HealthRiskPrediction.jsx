import React, { useState } from 'react';
import './HealthRiskPrediction.css';

const HealthRiskPrediction = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    age: '',
    bmi: '',
    systolic: '',
    diastolic: '',
    heart_rate: '',
    blood_sugar: '',
    cholesterol: '',
    iron_level: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/health-risk/prediction', {
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

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low Risk': return '#4CAF50';
      case 'Moderate Risk': return '#FFC107';
      case 'High Risk': return '#FF9800';
      case 'Critical Risk': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className="health-risk-prediction">
      <h2><span style={{ marginRight: 6 }}>🔍</span> AI Health Risk Assessment</h2>
      <p>Enter your vitals for personalized risk analysis</p>
      
      <form onSubmit={handleSubmit} className="prediction-form">
        <div className="hrp-row-3">
          <div className="form-group">
            <label>Age</label>
            <input type="number" name="age" value={formData.age} onChange={handleInputChange} placeholder="28" required />
          </div>
          <div className="form-group">
            <label>BMI</label>
            <input type="number" name="bmi" value={formData.bmi} onChange={handleInputChange} step="0.1" placeholder="22.4" required />
          </div>
          <div className="form-group">
            <label>Blood Pressure</label>
            <input
              type="text"
              placeholder="120/80"
              value={formData.systolic && formData.diastolic ? `${formData.systolic}/${formData.diastolic}` : formData.systolic ? `${formData.systolic}/` : ''}
              onChange={e => {
                const val = e.target.value;
                const parts = val.split('/');
                setFormData({
                  ...formData,
                  systolic: parts[0] ? parts[0].replace(/[^0-9]/g, '') : '',
                  diastolic: parts[1] !== undefined ? parts[1].replace(/[^0-9]/g, '') : ''
                });
              }}
            />
          </div>
        </div>
        <div className="hrp-row-4">
          <div className="form-group">
            <label>Heart Rate (bpm)</label>
            <input type="number" name="heart_rate" value={formData.heart_rate} onChange={handleInputChange} placeholder="72" required />
          </div>
          <div className="form-group">
            <label>Blood Sugar (mg/dL)</label>
            <input type="number" name="blood_sugar" value={formData.blood_sugar} onChange={handleInputChange} placeholder="95" required />
          </div>
          <div className="form-group">
            <label>Cholesterol (mg/dL)</label>
            <input type="number" name="cholesterol" value={formData.cholesterol} onChange={handleInputChange} placeholder="180" required />
          </div>
          <div className="form-group">
            <label>Iron (g/dL)</label>
            <input type="number" name="iron_level" value={formData.iron_level} onChange={handleInputChange} step="0.1" placeholder="13.5" required />
          </div>
        </div>
        <button type="submit" disabled={loading} className="predict-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v3l2 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          {loading ? 'Analyzing...' : 'Analyze Health Risk'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {prediction && (
        <div className="prediction-result">
          <h3>📊 Health Risk Assessment Result</h3>
          <div 
            className="risk-card"
            style={{ borderColor: getRiskColor(prediction.health_risk) }}
          >
            <div className="risk-level">
              {prediction.health_risk}
            </div>
            <div className="confidence">
              Confidence: {prediction.confidence}%
            </div>
            <div className="model-info">
              Model: {prediction.model_used}
            </div>
          </div>

          <div className="risk-probabilities">
            <h4>Risk Probabilities:</h4>
            {Object.entries(prediction.risk_probabilities).map(([risk, prob]) => (
              <div key={risk} className="probability-bar">
                <span className="risk-name">{risk}</span>
                <div className="bar-container">
                  <div 
                    className="bar"
                    style={{ 
                      width: `${prob}%`,
                      backgroundColor: getRiskColor(risk)
                    }}
                  ></div>
                  <span className="percentage">{prob}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthRiskPrediction;
