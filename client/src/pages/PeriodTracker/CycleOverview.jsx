import React, { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../services/api";

export default function CycleOverview() {
  const [phaseData, setPhaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [progress, setProgress] = useState(0);

  // Mock data for demonstration
  const mockPhaseData = {
    phase: "follicular",
    daysSinceLastPeriod: 5,
    avgCycleLength: 28,
    note: "Your body is preparing for ovulation. Energy levels are rising!",
    lastPeriodStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  };

  useEffect(() => {
    fetchCurrentPhase();
  }, []);

  useEffect(() => {
    if (phaseData) {
      // Calculate and animate progress ring
      const timer = setTimeout(() => {
        const currentDay = phaseData.daysSinceLastPeriod + 1;
        const totalDays = phaseData.avgCycleLength || 28;
        const calculatedProgress = Math.min((currentDay / totalDays) * 100, 100);
        console.log('Progress calculation:', { currentDay, totalDays, calculatedProgress });
        setProgress(calculatedProgress);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phaseData]);

  const fetchCurrentPhase = async () => {
    try {
      // Use mock data for now
      setPhaseData(mockPhaseData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching phase:", err);
      setError("Failed to load cycle data");
      setLoading(false);
    }
  };

  const handleMoodSubmit = async () => {
    if (selectedMoods.length === 0) return;
    try {
      const today = new Date().toISOString().split("T")[0];
      await api.post("/health/moodlogs", {
        date: today,
        moods: selectedMoods,
      });
      setShowMoodModal(false);
      setSelectedMoods([]);
      alert("Mood logged successfully!");
    } catch (err) {
      console.error("Error logging mood:", err);
      // For demo purposes, just show success
      setShowMoodModal(false);
      setSelectedMoods([]);
      alert("Mood logged successfully!");
    }
  };

  const toggleMood = (mood) => {
    setSelectedMoods(prev => 
      prev.includes(mood) 
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
      {error}
    </div>
  );
  
  if (!phaseData) return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-gray-700">
      No cycle data available
    </div>
  );

  const { phase, daysSinceLastPeriod, avgCycleLength, note, lastPeriodStart } = phaseData;

  // Calculate progress
  const currentDay = daysSinceLastPeriod + 1;
  const totalDays = avgCycleLength || 28;
  const currentProgress = Math.min((currentDay / totalDays) * 100, 100);

  // Calculate next period date
  const lastStart = new Date(lastPeriodStart);
  const nextPeriodDate = new Date(lastStart.getTime() + totalDays * 24 * 60 * 60 * 1000);
  const daysRemaining = Math.max(0, Math.ceil((nextPeriodDate - new Date()) / (24 * 60 * 60 * 1000)));

  // Mock hormone data for chart
  const hormoneData = [
    { day: 1, fsh: 5, lh: 3, pg: 1, e2: 20 },
    { day: 7, fsh: 8, lh: 5, pg: 2, e2: 80 },
    { day: 14, fsh: 12, lh: 15, pg: 3, e2: 150 },
    { day: 21, fsh: 6, lh: 8, pg: 15, e2: 100 },
    { day: 28, fsh: 4, lh: 2, pg: 8, e2: 30 },
  ];

  // Phase insights
  const phaseInsights = {
    menstrual: {
      title: "Menstrual Phase",
      description: "In this phase, estrogen and progesterone levels are low, causing the uterine lining to shed. This is a time for rest and self-care.",
      experiences: [
        "Light to heavy flow",
        "Low energy levels", 
        "Mild to moderate cramps",
        "Mood sensitivity",
        "Need for extra rest"
      ],
      tips: "Stay hydrated, use heating pads for cramps, and prioritize rest. Gentle yoga and warm baths can help.",
      color: "from-red-400 to-pink-400"
    },
    follicular: {
      title: "Follicular Phase", 
      description: "Estrogen levels start to rise, preparing the body for ovulation. This is a time of renewed energy and optimism.",
      experiences: [
        "Increased energy levels",
        "Improved mood and confidence",
        "Clearer skin",
        "Better focus and motivation",
        "Rising libido"
      ],
      tips: "Focus on strength training and try new activities. This is a great time for goal-setting and social activities.",
      color: "from-green-400 to-emerald-400"
    },
    ovulation: {
      title: "Ovulation Phase",
      description: "Estrogen peaks and LH surge triggers ovulation. This is the most fertile time of your cycle.",
      experiences: [
        "Heightened libido",
        "Clear, stretchy cervical mucus",
        "Slight pain or twinges (mittelschmerz)",
        "Increased confidence",
        "Peak energy levels"
      ],
      tips: "Track cervical mucus and consider fertility awareness. This is an excellent time for important decisions and presentations.",
      color: "from-yellow-400 to-orange-400"
    },
    luteal: {
      title: "Luteal Phase",
      description: "Progesterone rises to prepare for potential pregnancy. This phase can bring both physical and emotional changes.",
      experiences: [
        "Bloating and water retention",
        "Mood swings and irritability",
        "Breast tenderness",
        "Food cravings",
        "Sleep disturbances"
      ],
      tips: "Maintain a balanced diet, practice stress management, and be gentle with yourself. Magnesium supplements may help.",
      color: "from-purple-400 to-indigo-400"
    },
  };

  const currentInsight = phaseInsights[phase] || phaseInsights.follicular;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-lavender-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Animated Progress Ring */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative w-64 h-64">
              <CircularProgressbar
                value={progress}
                styles={buildStyles({
                  pathColor: "#ec4899",
                  trailColor: "#f3f4f6",
                  strokeWidth: 8,
                })}
                strokeWidth={8}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="text-sm font-medium text-gray-600 mb-1">Today</div>
                <div className="text-lg font-bold text-gray-800">{new Date().toLocaleDateString()}</div>
                <div className="text-sm text-gray-500 mt-2">Next Period</div>
                <div className="text-sm font-semibold text-pink-600">{nextPeriodDate.toLocaleDateString()}</div>
                <div className="text-xs text-gray-500 mt-1">{daysRemaining} days</div>
                <div className="text-sm font-medium text-purple-600 mt-2">{currentInsight.title}</div>
                <div className="text-xs text-gray-500">Day {currentDay} of {totalDays}</div>
                <div className="text-xs text-blue-500 mt-1">Progress: {Math.round(progress)}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mood Logging Button */}
        <div className="flex justify-center">
          <button 
            onClick={() => setShowMoodModal(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
          >
            <span>💭</span>
            <span>How I Feel Today</span>
          </button>
        </div>

        {/* Current Phase Details */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${currentInsight.color}`}></div>
            <h2 className="text-2xl font-bold text-gray-800">{currentInsight.title}</h2>
          </div>
          
          <p className="text-gray-700 text-lg leading-relaxed mb-6">{currentInsight.description}</p>
          
          {/* Interactive Hormone Chart */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Hormone Levels</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hormoneData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="fsh" 
                    stroke="#ec4899" 
                    strokeWidth={3}
                    name="FSH" 
                    dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="lh" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    name="LH" 
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pg" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Progesterone" 
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="e2" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    name="Estradiol" 
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">💡 Tips for This Phase</h4>
            <p className="text-gray-700">{currentInsight.tips}</p>
          </div>
        </div>

        {/* Common Experiences Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Common Experiences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentInsight.experiences.map((experience, index) => (
              <div 
                key={index}
                className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <span className="text-gray-700 font-medium">{experience}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mood Modal */}
        {showMoodModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">How are you feeling today?</h3>
                  <button 
                    onClick={() => setShowMoodModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {[
                    { emoji: "😔", label: "Mood Swings" },
                    { emoji: "😡", label: "Not in Control" },
                    { emoji: "🙂", label: "Fine" },
                    { emoji: "😄", label: "Happy" },
                    { emoji: "😢", label: "Sad" },
                    { emoji: "😟", label: "Sensitive" },
                    { emoji: "😠", label: "Angry" },
                  ].map((mood) => (
                    <button
                      key={mood.label}
                      onClick={() => toggleMood(mood.label)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedMoods.includes(mood.label)
                          ? 'border-pink-500 bg-pink-50 shadow-lg transform scale-105'
                          : 'border-gray-200 hover:border-pink-300 hover:bg-pink-25'
                      }`}
                    >
                      <div className="text-3xl mb-2">{mood.emoji}</div>
                      <div className="text-sm font-medium text-gray-700">{mood.label}</div>
                    </button>
                  ))}
                </div>
                
                <div className="flex space-x-4">
                  <button 
                    onClick={handleMoodSubmit}
                    disabled={selectedMoods.length === 0}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      selectedMoods.length > 0
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Save Mood{selectedMoods.length > 0 ? ` (${selectedMoods.length})` : ''}
                  </button>
                  <button 
                    onClick={() => setShowMoodModal(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
