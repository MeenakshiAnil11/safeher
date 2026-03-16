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
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState("");
  const [symptomSeverity, setSymptomSeverity] = useState({
    cramps: 0,
    fatigue: 0,
    bloating: 0,
  });

  const validateForm = () => {
    const nextErrors = {};
    if (!startDate) nextErrors.startDate = "Start date is required.";
    if (!endDate) nextErrors.endDate = "End date is required.";
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      nextErrors.endDate = "End date cannot be before start date.";
    }
    if (mood && mood.trim().length < 2) {
      nextErrors.mood = "Mood should be at least 2 characters.";
    }
    if (customSymptom && customSymptom.trim().length > 40) {
      nextErrors.customSymptom = "Custom symptom should be under 40 characters.";
    }
    if (basalBodyTemperatureC && (Number(basalBodyTemperatureC) < 35 || Number(basalBodyTemperatureC) > 42)) {
      nextErrors.bbt = "Basal body temperature must be between 35C and 42C.";
    }
    if (restingHeartRateBpm && (Number(restingHeartRateBpm) < 40 || Number(restingHeartRateBpm) > 120)) {
      nextErrors.rhr = "Resting heart rate must be between 40 and 120 bpm.";
    }
    Object.entries(symptomSeverity).forEach(([key, value]) => {
      if (Number(value) < 0 || Number(value) > 10) {
        nextErrors[key] = `${key} severity must be between 0 and 10.`;
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage("");
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const allSymptoms = [...symptoms];
      if (customSymptom.trim()) {
        allSymptoms.push(customSymptom.trim());
      }
      const severitySummary = `Severity - Cramps:${symptomSeverity.cramps}/10, Fatigue:${symptomSeverity.fatigue}/10, Bloating:${symptomSeverity.bloating}/10`;
      const token = localStorage.getItem("token");
      const res = await fetch("/api/periods/log", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          startDate,
          endDate,
          intensity,
          mood,
          notes: notes ? `${notes}\n${severitySummary}` : severitySummary,
          symptoms: allSymptoms,
          basalBodyTemperatureC: basalBodyTemperatureC ? Number(basalBodyTemperatureC) : undefined,
          restingHeartRateBpm: restingHeartRateBpm ? Number(restingHeartRateBpm) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error");
      setSubmitMessage("Cycle logged successfully.");
      setStartDate(""); setEndDate("");
      setIntensity("medium"); setMood(""); setNotes(""); setSymptoms([]);
      setBbt(""); setRhr(""); setCustomSymptom("");
      setSymptomSeverity({ cramps: 0, fatigue: 0, bloating: 0 });
      setErrors({});
    } catch (err) {
      setSubmitMessage("Failed to save: " + err.message);
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
        {submitMessage ? (
          <p className={`form-feedback ${submitMessage.startsWith("Failed") ? "error" : "success"}`}>
            {submitMessage}
          </p>
        ) : null}
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
            {errors.startDate ? <p className="form-error">{errors.startDate}</p> : null}
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
            {errors.endDate ? <p className="form-error">{errors.endDate}</p> : null}
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
          <select
            value={mood} 
            onChange={(e) => setMood(e.target.value)}
          >
            <option value="">Select mood</option>
            <option value="calm">Calm</option>
            <option value="energetic">Energetic</option>
            <option value="stressed">Stressed</option>
            <option value="moody">Moody</option>
            <option value="happy">Happy</option>
            <option value="low">Low</option>
          </select>
          {errors.mood ? <p className="form-error">{errors.mood}</p> : null}
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
          {errors.customSymptom ? <p className="form-error">{errors.customSymptom}</p> : null}
        </div>

        <div className="pt-form-group">
          <label>Symptom Severity (0-10)</label>
          <div className="symptom-sliders">
            {[
              { key: "cramps", label: "Cramps" },
              { key: "fatigue", label: "Fatigue" },
              { key: "bloating", label: "Bloating" },
            ].map((item) => (
              <div key={item.key} className="symptom-slider-item">
                <span>{item.label}: {symptomSeverity[item.key]}/10</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={symptomSeverity[item.key]}
                  onChange={(e) =>
                    setSymptomSeverity((prev) => ({ ...prev, [item.key]: Number(e.target.value) }))
                  }
                />
                {errors[item.key] ? <p className="form-error">{errors[item.key]}</p> : null}
              </div>
            ))}
          </div>
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
            {errors.bbt ? <p className="form-error">{errors.bbt}</p> : null}
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
            {errors.rhr ? <p className="form-error">{errors.rhr}</p> : null}
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
