import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { pregnancyWeeks } from "../../data/pregnancyWeeks";

export default function PregnancyDashboard() {
  const [loading, setLoading] = useState(false);
  const [pregnancyData, setPregnancyData] = useState(null);
  const [pregnancyInsights, setPregnancyInsights] = useState(null);
  const [dailyTip, setDailyTip] = useState("");
  const [nextAppointment, setNextAppointment] = useState(null);
  const [weightSummary, setWeightSummary] = useState(null);
  const [babyGrowthData, setBabyGrowthData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Load pregnancy data on component mount
  useEffect(() => {
    loadPregnancyData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadPregnancyData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPregnancyData = async () => {
    try {
      setLoading(true);
      
      // Load pregnancy insights
      const insightsResponse = await api.get('/pregnancy/insights');
      setPregnancyInsights(insightsResponse.data.insights);
      
      // Load recent pregnancy logs for weight tracking
      const logsResponse = await api.get('/pregnancy/logs?limit=30');
      const logs = logsResponse.data.logs;
      
      // Calculate weight summary
      if (logs.length > 0) {
        const weightData = logs.filter(log => log.weight).map(log => ({
          date: log.date,
          weight: log.weight,
          week: log.week
        }));
        
        if (weightData.length > 0) {
          const latestWeight = weightData[0];
          const firstWeight = weightData[weightData.length - 1];
          const weightGain = latestWeight.weight - firstWeight.weight;
          
          setWeightSummary({
            current: latestWeight.weight,
            gain: weightGain,
            week: latestWeight.week,
            trend: weightGain > 0 ? "increasing" : "stable"
          });
        }
      }
      
      // Load next appointment
      const appointmentResponse = await api.get('/pregnancy/appointments?upcoming=true&limit=1');
      const appointments = appointmentResponse.data.appointments;
      if (appointments.length > 0) {
        setNextAppointment(appointments[0]);
      }
      
      // Generate daily tip
      generateDailyTip();
      
      // Load baby growth data
      const growthResponse = await api.get('/pregnancy/baby-development');
      setBabyGrowthData(growthResponse.data.development);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading pregnancy data:', error);
      // Set mock data for demonstration
      setPregnancyInsights({
        currentWeek: 20,
        trimester: "second",
        dueDate: "2024-06-15",
        daysRemaining: 126,
        symptoms: ["mild fatigue", "increased appetite"],
        recommendations: ["Stay hydrated", "Get adequate rest"]
      });
      setWeightSummary({
        current: 65.5,
        gain: 3.2,
        week: 20,
        trend: "increasing"
      });
      generateDailyTip();
    } finally {
      setLoading(false);
    }
  };

  const generateDailyTip = () => {
    const tips = [
      "Stay hydrated by drinking plenty of water throughout the day.",
      "Take gentle walks to maintain your energy and circulation.",
      "Listen to your body and rest when you need to.",
      "Eat small, frequent meals to help with digestion.",
      "Practice deep breathing exercises for relaxation.",
      "Keep a pregnancy journal to track your journey.",
      "Stay connected with your healthcare provider.",
      "Enjoy this special time and celebrate each milestone."
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setDailyTip(randomTip);
  };

  const getTrimesterInfo = (trimester) => {
    const info = {
      first: { color: "from-pink-400 to-rose-400", icon: "🌱", weeks: "1-12" },
      second: { color: "from-blue-400 to-cyan-400", icon: "🌿", weeks: "13-26" },
      third: { color: "from-purple-400 to-indigo-400", icon: "🌸", weeks: "27-40" }
    };
    return info[trimester] || info.second;
  };

  const trimesterInfo = getTrimesterInfo(pregnancyInsights?.trimester || "second");
  const currentWeek = pregnancyInsights?.currentWeek || 20;
  const weekData = pregnancyWeeks[currentWeek] || pregnancyWeeks[20];

  return (
    <div className="p-6">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      )}

      {/* Main Dashboard Content */}
      {!loading && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Current Week */}
            <div className={`bg-gradient-to-r ${trimesterInfo.color} p-6 rounded-xl text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Current Week</p>
                  <p className="text-3xl font-bold">{pregnancyInsights?.currentWeek || 20}</p>
                  <p className="text-sm opacity-90 capitalize">{pregnancyInsights?.trimester || "second"} Trimester</p>
                </div>
                <span className="text-4xl">{trimesterInfo.icon}</span>
              </div>
            </div>

            {/* Due Date */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="text-xl font-bold text-gray-800">
                    {pregnancyInsights?.dueDate ? 
                      new Date(pregnancyInsights.dueDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      }) : 
                      "Jun 15"
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    {pregnancyInsights?.daysRemaining || 126} days to go
                  </p>
                </div>
                <span className="text-3xl">📅</span>
              </div>
            </div>

            {/* Weight Summary */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="text-xl font-bold text-gray-800">
                    {weightSummary?.current || 65.5} kg
                  </p>
                  <p className="text-sm text-green-600">
                    +{weightSummary?.gain || 3.2} kg gained
                  </p>
                </div>
                <span className="text-3xl">⚖️</span>
              </div>
            </div>

            {/* Baby Size */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Baby Size</p>
                  <p className="text-lg font-bold text-gray-800">{weekData.length}</p>
                  <p className="text-sm text-gray-500">Size of {weekData.fruit}</p>
                </div>
                <span className="text-3xl">👶</span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Baby Growth Visualization */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-3">👶</span>
                Baby Growth This Week
              </h3>
              
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 mb-4">
                <div className="text-center">
                  <div className="text-6xl mb-4">👶</div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">
                    Week {currentWeek}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Your baby is about the size of a {weekData.fruit} ({weekData.length}) and weighs around {weekData.weight}.
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      {weekData.development}
                    </p>
                    <p className="text-sm text-gray-700 mt-3">
                      <strong>Mother Changes:</strong> {weekData.motherChanges}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Tips */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-3">💡</span>
                Weekly Tips
              </h3>
              
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4">
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  {(weekData.tips || []).map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
              
              <button
                onClick={generateDailyTip}
                className="mt-4 w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300"
              >
                Get Daily Tip
              </button>
              <p className="text-sm text-gray-600 mt-3">{dailyTip}</p>
            </div>
          </div>

          {/* Next Appointment */}
          {nextAppointment && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-3">🏥</span>
                Next Appointment
              </h3>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-800">{nextAppointment.title}</h4>
                    <p className="text-gray-600">
                      {new Date(nextAppointment.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {nextAppointment.time} • {nextAppointment.location}
                    </p>
                  </div>
                  <span className="text-3xl">📅</span>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-3">📊</span>
              Recent Activity
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">📝</span>
                <div>
                  <p className="font-semibold text-gray-800">Health Log Updated</p>
                  <p className="text-sm text-gray-600">Logged symptoms and mood for today</p>
                </div>
                <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">📚</span>
                <div>
                  <p className="font-semibold text-gray-800">Resource Viewed</p>
                  <p className="text-sm text-gray-600">Read article about second trimester nutrition</p>
                </div>
                <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">🤖</span>
                <div>
                  <p className="font-semibold text-gray-800">AI Chat</p>
                  <p className="text-sm text-gray-600">Asked about safe exercises during pregnancy</p>
                </div>
                <span className="text-xs text-gray-500 ml-auto">2 days ago</span>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-center text-gray-500 text-sm">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}