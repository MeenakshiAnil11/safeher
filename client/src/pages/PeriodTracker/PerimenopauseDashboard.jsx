import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PerimenopauseDashboard() {
  const navigate = useNavigate();
  const [symptomModalOpen, setSymptomModalOpen] = useState(false);
  const [moodModalOpen, setMoodModalOpen] = useState(false);

  console.log("PerimenopauseDashboard component is rendering");
  
  const [symptomData, setSymptomData] = useState({
    hotFlashes: false,
    moodSwings: false,
    sleepIssues: false,
    fatigue: false,
    irregularBleeding: false,
    nightSweats: false,
    anxiety: false,
    depression: false,
    weightGain: false,
    memoryIssues: false,
    jointPain: false,
    headaches: false,
    notes: ""
  });

  const [moodData, setMoodData] = useState({
    mood: "neutral",
    energy: 5,
    stress: 3,
    sleep: 5,
    notes: ""
  });

  // Mock data for demonstration
  const [cycleData] = useState({
    lastCycleDate: "February 15, 2025",
    cycleLength: "Irregular (21-35 days)",
    irregularityStatus: "Moderate",
    hormonalPhase: "Transitioning"
  });

  const [wellnessTips] = useState([
    "Maintain a balanced diet rich in calcium, vitamin D, and omega-3 fatty acids",
    "Engage in regular weight-bearing exercises to support bone health",
    "Practice stress-reduction techniques like meditation or yoga",
    "Ensure 7-9 hours of quality sleep each night",
    "Limit caffeine and alcohol intake, especially in the evening",
    "Stay hydrated and consider herbal teas like chamomile for relaxation",
    "Track your symptoms to identify patterns and triggers",
    "Consider speaking with a healthcare provider about hormone therapy options"
  ]);

  const [commonSymptoms] = useState([
    "Hot flashes and night sweats",
    "Irregular menstrual cycles",
    "Mood swings and irritability",
    "Sleep disturbances and insomnia",
    "Fatigue and low energy",
    "Weight gain, especially around the abdomen",
    "Memory problems and difficulty concentrating",
    "Joint and muscle aches",
    "Headaches and migraines",
    "Anxiety and depression",
    "Vaginal dryness and decreased libido",
    "Hair thinning or changes in texture"
  ]);

  const handleSymptomLog = () => {
    setSymptomModalOpen(true);
  };

  const handleMoodLog = () => {
    setMoodModalOpen(true);
  };

  const saveSymptomData = () => {
    localStorage.setItem('perimenopauseSymptomData', JSON.stringify(symptomData));
    setSymptomModalOpen(false);
    alert('Symptom data saved successfully!');
  };

  const saveMoodData = () => {
    localStorage.setItem('perimenopauseMoodData', JSON.stringify(moodData));
    setMoodModalOpen(false);
    alert('Mood data saved successfully!');
  };

  const updateSymptomData = (symptom, value) => {
    setSymptomData(prev => ({
      ...prev,
      [symptom]: value
    }));
  };

  const updateMoodData = (field, value) => {
    setMoodData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getIrregularityColor = (status) => {
    switch (status) {
      case 'Mild': return 'from-green-400 to-green-500';
      case 'Moderate': return 'from-yellow-400 to-yellow-500';
      case 'Severe': return 'from-red-400 to-red-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const moodOptions = [
    { value: "happy", label: "Happy", emoji: "😊" },
    { value: "sad", label: "Sad", emoji: "😢" },
    { value: "anxious", label: "Anxious", emoji: "😰" },
    { value: "calm", label: "Calm", emoji: "😌" },
    { value: "tired", label: "Tired", emoji: "😴" },
    { value: "energetic", label: "Energetic", emoji: "⚡" },
    { value: "irritable", label: "Irritable", emoji: "😤" },
    { value: "neutral", label: "Neutral", emoji: "😐" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-poppins">
            Perimenopause Dashboard
          </h1>
          <p className="text-gray-600">
            Track your cycles, symptoms, and well-being during perimenopause
          </p>
        </div>

        {/* Overview Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Cycle Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">📅</div>
                <div className="font-semibold text-gray-800">Last Cycle</div>
                <div className="text-sm text-gray-600">{cycleData.lastCycleDate}</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">🔄</div>
                <div className="font-semibold text-gray-800">Cycle Length</div>
                <div className="text-sm text-gray-600">{cycleData.cycleLength}</div>
              </div>
              <div className={`bg-gradient-to-r ${getIrregularityColor(cycleData.irregularityStatus)} rounded-xl p-4 text-center text-white`}>
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold">Irregularity</div>
                <div className="text-sm opacity-90">{cycleData.irregularityStatus}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Symptom Logging Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Log Your Symptoms Today</h3>
              <button
                onClick={handleSymptomLog}
                className="bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white py-2 px-4 rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-300"
              >
                Log Symptoms
              </button>
            </div>
            <p className="text-gray-600 text-sm">
              Track common perimenopause symptoms to identify patterns and share with your healthcare provider.
            </p>
          </div>
        </div>

        {/* Mood Logging Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">How I Feel Today</h3>
              <button
                onClick={handleMoodLog}
                className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white py-2 px-4 rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-300"
              >
                Log Mood
              </button>
            </div>
            <p className="text-gray-600 text-sm">
              Track your emotional well-being and energy levels to understand mood patterns during perimenopause.
            </p>
          </div>
        </div>

        {/* Wellness Tips */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Wellness Tips for Perimenopause</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wellnessTips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-xl">
                  <div className="text-purple-500 mt-1">💡</div>
                  <p className="text-gray-700 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Common Symptoms */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Common Perimenopause Symptoms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {commonSymptoms.map((symptom, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-pink-50 rounded-xl">
                  <div className="text-pink-500">✨</div>
                  <p className="text-gray-700 text-sm">{symptom}</p>
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

      {/* Symptom Logging Modal */}
      {symptomModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              Log Your Symptoms Today
            </h3>
            
            <div className="space-y-4">
              {Object.entries(symptomData).map(([key, value]) => {
                if (key === 'notes') return null;
                const symptomName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-700 font-medium">{symptomName}</span>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateSymptomData(key, e.target.checked)}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-600">Yes</span>
                    </label>
                  </div>
                );
              })}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={symptomData.notes}
                  onChange={(e) => updateSymptomData('notes', e.target.value)}
                  placeholder="Any other symptoms or observations..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setSymptomModalOpen(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={saveSymptomData}
                className="flex-1 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300"
              >
                Save Symptoms
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mood Logging Modal */}
      {moodModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              How Are You Feeling Today?
            </h3>
            
            <div className="space-y-6">
              {/* Mood Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Current Mood
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => updateMoodData('mood', mood.value)}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                        moodData.mood === mood.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{mood.emoji}</div>
                      <div className="text-sm font-medium">{mood.label}</div>
                    </button>
                  ))}
                </div>
              </div>

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

              {/* Sleep Quality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sleep Quality (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodData.sleep}
                  onChange={(e) => updateMoodData('sleep', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">{moodData.sleep}/10</div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={moodData.notes}
                  onChange={(e) => updateMoodData('notes', e.target.value)}
                  placeholder="Any thoughts, feelings, or observations..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="flex-1 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300"
              >
                Save Mood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
