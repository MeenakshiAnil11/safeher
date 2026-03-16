import React, { useState } from 'react';
import HealthRiskPrediction from './HealthRiskPrediction';
import MoodPrediction from './MoodPrediction';
import SymptomClassification from './SymptomClassification';
import './MLDashboard.css';

const MLDashboard = () => {
  const [activeTab, setActiveTab] = useState('health');

  const tabs = [
    { id: 'health', label: 'Health Risk' },
    { id: 'mood', label: 'Mood Prediction' },
    { id: 'symptoms', label: 'Symptom Analysis' }
  ];

  return (
    <div className="ml-dash">
      <div className="ml-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`ml-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="ml-content">
        {activeTab === 'health' && <HealthRiskPrediction />}
        {activeTab === 'mood' && <MoodPrediction />}
        {activeTab === 'symptoms' && <SymptomClassification />}
      </div>
    </div>
  );
};

export default MLDashboard;
