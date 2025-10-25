import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserHeader from "../../components/UserHeader";

export default function PregnancyDashboard() {
  const navigate = useNavigate();
  const [moodModalOpen, setMoodModalOpen] = useState(false);
  const [moodData, setMoodData] = useState({
    mood: "happy",
    energy: 5,
    stress: 3,
    sleep: 5,
    symptoms: [],
    notes: ""
  });

  // Mock data for demonstration - in real app, this would come from user input or API
  const [pregnancyData] = useState({
    currentWeek: 16,
    estimatedDueDate: "August 15, 2025",
    trimester: "Second",
    daysRemaining: 168,
    conceptionDate: "December 1, 2024"
  });

  const [fetalDevelopment] = useState({
    size: "4.5 inches",
    weight: "3.5 ounces",
    description: "Your baby is now the size of an avocado! The baby's eyes are moving and can detect light, and tiny bones are forming in the ears.",
    milestones: [
      "Eyes are moving and can detect light",
      "Tiny bones are forming in the ears",
      "Baby can make facial expressions",
      "Heart is pumping about 25 quarts of blood daily"
    ]
  });

  const [healthTips] = useState([
    {
      category: "Nutrition",
      tips: [
        "Focus on folate-rich foods like leafy greens and citrus fruits",
        "Include lean proteins and whole grains in every meal",
        "Stay hydrated with 8-10 glasses of water daily",
        "Limit caffeine to 200mg per day (about 1-2 cups of coffee)"
      ]
    },
    {
      category: "Exercise",
      tips: [
        "Aim for 30 minutes of moderate exercise most days",
        "Try prenatal yoga or swimming for gentle movement",
        "Avoid high-impact activities and contact sports",
        "Listen to your body and rest when needed"
      ]
    },
    {
      category: "Sleep & Mental Health",
      tips: [
        "Sleep on your left side to improve circulation",
        "Use pregnancy pillows for comfort",
        "Practice relaxation techniques like deep breathing",
        "Stay connected with your support system"
      ]
    },
    {
      category: "Common Symptoms",
      tips: [
        "For morning sickness: eat small, frequent meals",
        "For heartburn: avoid spicy foods and eat slowly",
        "For back pain: maintain good posture and gentle stretches",
        "For fatigue: prioritize rest and light exercise"
      ]
    }
  ]);

  const [importantDates] = useState([
    {
      date: "March 15, 2025",
      event: "Anatomy Scan",
      type: "medical",
      description: "Detailed ultrasound to check baby's development"
    },
    {
      date: "April 1, 2025",
      event: "Glucose Screening",
      type: "medical",
      description: "Test for gestational diabetes"
    },
    {
      date: "May 10, 2025",
      event: "Baby Shower",
      type: "personal",
      description: "Celebrating your little one with family and friends"
    },
    {
      date: "August 15, 2025",
      event: "Due Date",
      type: "milestone",
      description: "Your estimated due date - baby could arrive anytime!"
    }
  ]);

  const moodOptions = [
    { value: "happy", label: "Happy", emoji: "😊" },
    { value: "excited", label: "Excited", emoji: "🤩" },
    { value: "tired", label: "Tired", emoji: "😴" },
    { value: "anxious", label: "Anxious", emoji: "😰" },
    { value: "emotional", label: "Emotional", emoji: "🥺" },
    { value: "energetic", label: "Energetic", emoji: "⚡" },
    { value: "nauseous", label: "Nauseous", emoji: "🤢" },
    { value: "neutral", label: "Neutral", emoji: "😐" }
  ];

  const symptomOptions = [
    "Morning sickness", "Fatigue", "Mood swings", "Food cravings",
    "Heartburn", "Back pain", "Frequent urination", "Breast tenderness",
    "Constipation", "Headaches", "Dizziness", "Swelling"
  ];

  const handleMoodLog = () => {
    setMoodModalOpen(true);
  };

  const saveMoodData = () => {
    localStorage.setItem('pregnancyMoodData', JSON.stringify(moodData));
    setMoodModalOpen(false);
    alert('Mood and symptom data saved successfully!');
  };

  const updateMoodData = (field, value) => {
    setMoodData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleSymptom = (symptom) => {
    setMoodData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const getTrimesterColor = (trimester) => {
    switch (trimester) {
      case 'First': return 'from-pink-400 to-pink-500';
      case 'Second': return 'from-blue-400 to-blue-500';
      case 'Third': return 'from-purple-400 to-purple-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getDateTypeColor = (type) => {
    switch (type) {
      case 'medical': return 'bg-red-50 border-red-200 text-red-800';
      case 'personal': return 'bg-green-50 border-green-200 text-green-800';
      case 'milestone': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <UserHeader />
      
      <div className="container mx-auto px-4 py-8" style={{ marginTop: '80px' }}>
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-poppins">
            Pregnancy Dashboard
          </h1>
          <p className="text-gray-600">
            Track your pregnancy week by week with fetal development updates
          </p>
        </div>

        {/* Overview Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className={`bg-gradient-to-r ${getTrimesterColor(pregnancyData.trimester)} rounded-2xl p-6 text-white shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-2">
                  Week {pregnancyData.currentWeek} - {pregnancyData.trimester} Trimester
                </h2>
                <p className="text-lg opacity-90">
                  Estimated due date: {pregnancyData.estimatedDueDate}
                </p>
                <p className="text-sm opacity-75">
                  {pregnancyData.daysRemaining} days remaining
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">
                  {pregnancyData.currentWeek}
                </div>
                <div className="text-sm opacity-90">
                  weeks pregnant
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fetal Development Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Fetal Development</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-4">👶</div>
                <div className="text-2xl font-bold text-gray-800 mb-2">
                  {fetalDevelopment.size}
                </div>
                <div className="text-gray-600 mb-4">
                  {fetalDevelopment.weight}
                </div>
                <p className="text-gray-700 text-sm">
                  {fetalDevelopment.description}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">This Week's Milestones:</h4>
                <ul className="space-y-2">
                  {fetalDevelopment.milestones.map((milestone, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="text-pink-500 mt-1">✨</div>
                      <p className="text-gray-700 text-sm">{milestone}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Health & Wellness Tips */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Health & Wellness Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {healthTips.map((category, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-lg mr-2">
                      {category.category === 'Nutrition' && '🥗'}
                      {category.category === 'Exercise' && '🏃‍♀️'}
                      {category.category === 'Sleep & Mental Health' && '😴'}
                      {category.category === 'Common Symptoms' && '💊'}
                    </span>
                    {category.category}
                  </h4>
                  <ul className="space-y-2">
                    {category.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start space-x-2">
                        <div className="text-pink-500 mt-1">•</div>
                        <p className="text-gray-700 text-sm">{tip}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mood & Health Logging */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">How I Feel Today</h3>
              <button
                onClick={handleMoodLog}
                className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white py-2 px-4 rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-300"
              >
                Log Mood & Symptoms
              </button>
            </div>
            <p className="text-gray-600 text-sm">
              Track your daily mood, energy levels, and pregnancy symptoms to monitor your well-being.
            </p>
          </div>
        </div>

        {/* Important Dates & Reminders */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Important Dates & Reminders</h3>
            <div className="space-y-3">
              {importantDates.map((date, index) => (
                <div key={index} className={`p-4 rounded-xl border ${getDateTypeColor(date.type)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{date.event}</h4>
                      <p className="text-sm opacity-75">{date.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{date.date}</div>
                      <div className="text-xs opacity-75 capitalize">{date.type}</div>
                    </div>
                  </div>
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

      {/* Mood & Symptom Logging Modal */}
      {moodModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
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
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300'
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

              {/* Symptoms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Current Symptoms (select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {symptomOptions.map((symptom) => (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`p-2 rounded-lg border text-sm transition-all duration-300 ${
                        moodData.symptoms.includes(symptom)
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-200 hover:border-pink-300 text-gray-700'
                      }`}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={moodData.notes}
                  onChange={(e) => updateMoodData('notes', e.target.value)}
                  placeholder="Any thoughts, feelings, or observations about your pregnancy..."
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
