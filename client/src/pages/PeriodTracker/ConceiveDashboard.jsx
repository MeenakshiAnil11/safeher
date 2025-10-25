import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ConceiveDashboard() {
  const navigate = useNavigate();
  const [moodModalOpen, setMoodModalOpen] = useState(false);
  const [moodData, setMoodData] = useState({
    energy: 5,
    stress: 3,
    emotional: 5,
    notes: ""
  });

  // Mock data for demonstration
  const [cycleData] = useState({
    currentPhase: "Follicular",
    daysUntilOvulation: 8,
    nextOvulationDate: "March 15, 2025",
    fertileWindowStart: "March 10, 2025",
    fertileWindowEnd: "March 16, 2025"
  });

  const [fertilityTips] = useState([
    "Track your basal body temperature daily for accurate ovulation prediction",
    "Monitor cervical mucus changes - fertile mucus is clear and stretchy",
    "Maintain a healthy diet rich in folate, iron, and omega-3 fatty acids",
    "Get 7-9 hours of quality sleep to support hormone production",
    "Reduce stress through meditation, yoga, or gentle exercise",
    "Avoid smoking, excessive alcohol, and limit caffeine intake"
  ]);

  const [commonExperiences] = useState([
    "Mild cramping or twinges in the lower abdomen",
    "Increased cervical mucus that's clear and stretchy",
    "Slight mood changes or increased emotional sensitivity",
    "Changes in energy levels throughout the day",
    "Breast tenderness or sensitivity",
    "Increased libido during fertile window"
  ]);

  const handleMoodLog = () => {
    setMoodModalOpen(true);
  };

  const saveMoodData = () => {
    // Save to localStorage or send to API
    localStorage.setItem('conceiveMoodData', JSON.stringify(moodData));
    setMoodModalOpen(false);
    alert('Mood data saved successfully!');
  };

  const updateMoodData = (field, value) => {
    setMoodData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'Follicular': return 'from-blue-400 to-blue-500';
      case 'Ovulation': return 'from-pink-400 to-pink-500';
      case 'Luteal': return 'from-purple-400 to-purple-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getPhaseDescription = (phase) => {
    switch (phase) {
      case 'Follicular': return 'Your body is preparing for ovulation. Focus on overall health and nutrition.';
      case 'Ovulation': return 'Your most fertile time! This is the best window for conception.';
      case 'Luteal': return 'Post-ovulation phase. Continue healthy habits and prepare for next cycle.';
      default: return 'Track your cycle to understand your fertility patterns.';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-poppins">
            Conceive Mode Dashboard
          </h1>
          <p className="text-gray-600">
            Track your fertile window and ovulation for conception
          </p>
        </div>

        {/* Current Cycle Phase */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className={`bg-gradient-to-r ${getPhaseColor(cycleData.currentPhase)} rounded-2xl p-6 text-white shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-2">
                  Current Phase: {cycleData.currentPhase}
                </h2>
                <p className="text-lg opacity-90">
                  {getPhaseDescription(cycleData.currentPhase)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {cycleData.daysUntilOvulation}
                </div>
                <div className="text-sm opacity-90">
                  days until ovulation
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fertility Calendar Overview */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Fertility Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-pink-50 rounded-xl">
                <div className="text-2xl mb-2">🌱</div>
                <div className="font-semibold text-gray-800">Fertile Window</div>
                <div className="text-sm text-gray-600">
                  {cycleData.fertileWindowStart} - {cycleData.fertileWindowEnd}
                </div>
              </div>
              <div className="text-center p-4 bg-pink-100 rounded-xl">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-semibold text-gray-800">Ovulation Day</div>
                <div className="text-sm text-gray-600">{cycleData.nextOvulationDate}</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold text-gray-800">Cycle Tracking</div>
                <div className="text-sm text-gray-600">Day {cycleData.daysUntilOvulation + 14} of cycle</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips and Guidance */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Fertility Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fertilityTips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-pink-50 rounded-xl">
                  <div className="text-pink-500 mt-1">💡</div>
                  <p className="text-gray-700 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mood and Health Logging */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">How I Feel Today</h3>
              <button
                onClick={handleMoodLog}
                className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white py-2 px-4 rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-300"
              >
                Log Mood
              </button>
            </div>
            <p className="text-gray-600 text-sm">
              Track your daily energy, stress levels, and emotional state to identify patterns in your cycle.
            </p>
          </div>
        </div>

        {/* Common Experiences */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Common Experiences During Fertile Window</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {commonExperiences.map((experience, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl">
                  <div className="text-purple-500">✨</div>
                  <p className="text-gray-700 text-sm">{experience}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="max-w-4xl mx-auto text-center">
          <button
            onClick={() => navigate("/period-tracking")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-8 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-300"
          >
            Back to Mode Selection
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm mt-8">
          <p>Developed by Meenakshi Anil | MCA Mini Project 2025</p>
        </div>
      </div>

      {/* Mood Logging Modal */}
      {moodModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              How Are You Feeling Today?
            </h3>
            
            <div className="space-y-6">
              {/* Energy Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Energy Level (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodData.energy}
                  onChange={(e) => updateMoodData('energy', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">{moodData.energy}/10</div>
              </div>

              {/* Stress Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stress Level (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodData.stress}
                  onChange={(e) => updateMoodData('stress', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">{moodData.stress}/10</div>
              </div>

              {/* Emotional State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emotional State (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodData.emotional}
                  onChange={(e) => updateMoodData('emotional', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">{moodData.emotional}/10</div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={moodData.notes}
                  onChange={(e) => updateMoodData('notes', e.target.value)}
                  placeholder="Any symptoms, feelings, or observations..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setMoodModalOpen(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={saveMoodData}
                className="flex-1 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}