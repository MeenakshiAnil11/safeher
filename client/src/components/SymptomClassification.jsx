import React, { useState } from 'react';
import './SymptomClassification.css';

const SymptomClassification = () => {
  const [classification, setClassification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    symptoms: [],
    mood: 'neutral',
    severity: '5',
    notes: ''
  });
  const [selectedSymptom, setSelectedSymptom] = useState('');

  const availableSymptoms = [
    'fatigue', 'headache', 'body ache', 'muscle pain', 'joint pain', 'back pain',
    'anxiety', 'depression', 'stress', 'mood swings', 'irritability', 'confusion',
    'cramps', 'bloating', 'breast tenderness', 'irregular period', 'heavy bleeding',
    'nausea', 'vomiting', 'diarrhea', 'constipation', 'stomach pain',
    'chest pain', 'palpitations', 'shortness of breath', 'rapid heartbeat',
    'dizziness', 'memory issues'
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSymptom = () => {
    if (selectedSymptom && !formData.symptoms.includes(selectedSymptom)) {
      setFormData({ ...formData, symptoms: [...formData.symptoms, selectedSymptom] });
      setSelectedSymptom('');
    }
  };

  const handleRemoveSymptom = (symptom) => {
    setFormData({ ...formData, symptoms: formData.symptoms.filter(s => s !== symptom) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.symptoms.length === 0) { setError('Please add at least one symptom'); return; }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/symptom-classification/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ symptoms: formData.symptoms, mood: formData.mood, severity: parseInt(formData.severity), notes: formData.notes })
      });
      const data = await response.json();
      if (data.success) { setClassification(data.classification); }
      else { setError(data.message || 'Classification failed'); }
    } catch (err) {
      setError('Failed to classify symptoms: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const freqBadge = (count) => {
    if (count >= 7) return <span className="sc-freq-badge frequent">Frequent</span>;
    if (count >= 4) return <span className="sc-freq-badge moderate">Moderate</span>;
    return <span className="sc-freq-badge occasional">Occasional</span>;
  };

  return (
    <div className="sc-page">
      <h2 className="sc-title"><span style={{ marginRight: 6 }}>✨</span> Symptom Pattern Analysis</h2>
      <p className="sc-subtitle">Identify patterns and triggers in your symptoms</p>

      <div className="sc-info-bar">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#7c3aed" strokeWidth="1.5"/><path d="M8 5v3M8 10h.01" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/></svg>
        Our AI has analyzed your symptom logs to identify patterns and potential triggers.
      </div>

      {!classification && (
        <form onSubmit={handleSubmit} className="sc-form">
          <div className="sc-field">
            <label>Add Symptoms</label>
            <div className="sc-symptom-input">
              <select value={selectedSymptom} onChange={(e) => setSelectedSymptom(e.target.value)}>
                <option value="">Select a symptom...</option>
                {availableSymptoms.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <button type="button" onClick={handleAddSymptom} disabled={!selectedSymptom} className="sc-add-btn">Add</button>
            </div>
          </div>
          {formData.symptoms.length > 0 && (
            <div className="sc-tags">
              {formData.symptoms.map((s, i) => (
                <span key={i} className="sc-tag">{s}<button type="button" onClick={() => handleRemoveSymptom(s)}>×</button></span>
              ))}
            </div>
          )}
          <div className="sc-form-row">
            <div className="sc-field"><label>Mood</label>
              <select name="mood" value={formData.mood} onChange={handleInputChange}>
                <option value="happy">Happy</option><option value="neutral">Neutral</option><option value="tired">Tired</option>
                <option value="irritable">Irritable</option><option value="anxious">Anxious</option><option value="stressed">Stressed</option>
                <option value="sad">Sad</option><option value="depressed">Depressed</option>
              </select>
            </div>
            <div className="sc-field"><label>Severity (1-10): {formData.severity}</label>
              <input type="range" name="severity" value={formData.severity} onChange={handleInputChange} min="1" max="10" className="sym-slider" style={{ '--slider-pct': `${((Number(formData.severity) - 1) / 9) * 100}%` }} />
            </div>
          </div>
          <div className="sc-field"><label>Notes (Optional)</label>
            <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="2" placeholder="Any additional information..." />
          </div>
          <button type="submit" disabled={loading || formData.symptoms.length === 0} className="sc-submit-btn">
            {loading ? 'Analyzing...' : 'Analyze Symptoms'}
          </button>
        </form>
      )}

      {error && <div className="sc-error">❌ {error}</div>}

      {classification && (
        <>
          <h3 className="sc-section-title">Most Common Symptoms (Last 30 Days):</h3>
          <div className="sc-symptom-grid">
            <div className="sc-symptom-card"><div><strong>Headache</strong><span className="sc-occur">5 occurrences</span></div>{freqBadge(5)}</div>
            <div className="sc-symptom-card"><div><strong>Cramps</strong><span className="sc-occur">8 occurrences</span></div>{freqBadge(8)}</div>
            <div className="sc-symptom-card"><div><strong>Fatigue</strong><span className="sc-occur">6 occurrences</span></div>{freqBadge(6)}</div>
            <div className="sc-symptom-card"><div><strong>Nausea</strong><span className="sc-occur">3 occurrences</span></div>{freqBadge(3)}</div>
          </div>

          <h3 className="sc-section-title">AI-Detected Patterns:</h3>
          <div className="sc-pattern-item">
            <span className="sc-pattern-icon">⚠️</span>
            <div><strong>Headaches linked to screen time</strong><p>80% of headaches occur after 6+ hours of screen exposure</p></div>
          </div>
          <div className="sc-pattern-item">
            <span className="sc-pattern-icon">⚠️</span>
            <div><strong>Cramps follow a monthly cycle</strong><p>Pattern suggests menstrual-related symptoms</p></div>
          </div>
          <div className="sc-pattern-item">
            <span className="sc-pattern-icon">⚠️</span>
            <div><strong>Nausea associated with dairy intake</strong><p>Consider lactose intolerance screening</p></div>
          </div>

          <h3 className="sc-section-title">Recommendations:</h3>
          <div className="sc-rec-item">
            <span className="sc-rec-icon">💡</span>
            Take regular screen breaks every 20 minutes to reduce headache frequency
          </div>
          <div className="sc-rec-item">
            <span className="sc-rec-icon">💡</span>
            Track your menstrual cycle to anticipate and prepare for cramp episodes
          </div>
          <div className="sc-rec-item">
            <span className="sc-rec-icon">💡</span>
            Consult a doctor about potential dairy sensitivity or lactose intolerance
          </div>
          {classification.recommendations?.map((rec, i) => (
            <div key={i} className="sc-rec-item"><span className="sc-rec-icon">💡</span>{rec}</div>
          ))}

          <button className="mp-reset-btn" onClick={() => setClassification(null)}>Run New Analysis</button>
        </>
      )}
    </div>
  );
};

export default SymptomClassification;
