import React, { useState } from "react";

const commonSymptoms = [
  "Cramps", "Headache", "Nausea", "Fatigue", "Bloating", "Back Pain",
  "Breast Tenderness", "Mood Swings", "Insomnia", "Acne", "Food Cravings",
  "Spotting", "Heavy Bleeding", "Light Bleeding"
];

export default function LogCycle() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [intensity, setIntensity] = useState("medium");
  const [mood, setMood] = useState("");
  const [notes, setNotes] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [basalBodyTemperatureC, setBbt] = useState("");
  const [restingHeartRateBpm, setRhr] = useState("");
  const [loading, setLoading] = useState(false);
  const [customSymptom, setCustomSymptom] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const allSymptoms = [...symptoms];
      if (customSymptom.trim()) {
        allSymptoms.push(customSymptom.trim());
      }
      const token = localStorage.getItem("token");
      const res = await fetch("/api/periods/log", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          startDate,
          endDate,
          intensity,
          mood,
          notes,
          symptoms: allSymptoms,
          basalBodyTemperatureC: basalBodyTemperatureC ? Number(basalBodyTemperatureC) : undefined,
          restingHeartRateBpm: restingHeartRateBpm ? Number(restingHeartRateBpm) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error");
      alert("Cycle logged successfully");
      setStartDate(""); setEndDate("");
      setIntensity("medium"); setMood(""); setNotes(""); setSymptoms([]);
      setBbt(""); setRhr(""); setCustomSymptom("");
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSymptomChange = (symptom, checked) => {
    if (checked) {
      setSymptoms([...symptoms, symptom]);
    } else {
      setSymptoms(symptoms.filter(s => s !== symptom));
    }
  };

  return (
    <div className="log-cycle-container">
      <div className="form-intro">
        <p>Track your menstrual cycle to better understand your body's patterns and health.</p>
      </div>
      
      <form className="pt-form" onSubmit={handleSubmit}>
        <div className="pt-two-col">
          <div className="pt-form-group">
            <label>Start Date *</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              required 
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="pt-form-group">
            <label>End Date *</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              required 
              min={startDate}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="pt-form-group">
          <label>Flow Intensity</label>
          <select value={intensity} onChange={(e) => setIntensity(e.target.value)}>
            <option value="light">💧 Light Flow</option>
            <option value="medium">💧💧 Medium Flow</option>
            <option value="heavy">💧💧💧 Heavy Flow</option>
          </select>
        </div>

        <div className="pt-form-group">
          <label>Overall Mood</label>
          <input 
            type="text" 
            placeholder="e.g., calm, stressed, energetic, moody" 
            value={mood} 
            onChange={(e) => setMood(e.target.value)} 
          />
        </div>

        <div className="pt-form-group">
          <label>Symptoms Experienced</label>
          <div className="symptoms-grid">
            {commonSymptoms.map(symptom => (
              <label key={symptom} className="symptom-checkbox">
                <input
                  type="checkbox"
                  checked={symptoms.includes(symptom)}
                  onChange={(e) => handleSymptomChange(symptom, e.target.checked)}
                />
                {symptom}
              </label>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add custom symptom (optional)"
            value={customSymptom}
            onChange={(e) => setCustomSymptom(e.target.value)}
            style={{ marginTop: '12px' }}
          />
        </div>

        <div className="pt-form-group">
          <label>Additional Notes</label>
          <textarea 
            rows="4" 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder="Add any observations, activities, or other details about your cycle..."
          />
        </div>

        <div className="pt-two-col">
          <div className="pt-form-group">
            <label>Basal Body Temperature (°C)</label>
            <input 
              type="number" 
              step="0.01" 
              min="35" 
              max="42" 
              value={basalBodyTemperatureC} 
              onChange={(e) => setBbt(e.target.value)}
              placeholder="e.g., 36.5"
            />
            <small style={{ color: '#636e72', fontSize: '0.85rem', marginTop: '4px' }}>
              Measure first thing in the morning
            </small>
          </div>
          <div className="pt-form-group">
            <label>Resting Heart Rate (bpm)</label>
            <input 
              type="number" 
              step="1" 
              min="40" 
              max="120" 
              value={restingHeartRateBpm} 
              onChange={(e) => setRhr(e.target.value)}
              placeholder="e.g., 72"
            />
            <small style={{ color: '#636e72', fontSize: '0.85rem', marginTop: '4px' }}>
              Measure when completely at rest
            </small>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading || !startDate || !endDate}>
            {loading ? "💾 Saving..." : "💾 Save Cycle Data"}
          </button>
        </div>
      </form>
    </div>
  );
}
