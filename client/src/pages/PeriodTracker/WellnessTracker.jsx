import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import api from "../../services/api";
import {
  calculateSleepMoodCorrelation,
  getStoredLogs,
  groupLogsByLastDays,
} from "../../services/perimenopauseService";
import HormoneSimulationGraph from "../../components/HormoneSimulationGraph";
import AIHealthInsights from "../../components/AIHealthInsights";

export default function WellnessTracker() {
  const [wellnessData, setWellnessData] = useState({
    moodTracker: [],
    sleepQuality: [],
    hotFlashFrequency: [],
    weightTrend: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const mapLogsToWellness = (logs = []) => {
    const rows = groupLogsByLastDays(logs, 7);
    return {
      moodTracker: rows.map((item) => ({
        day: item.day,
        date: item.date,
        mood: Number(item.mood?.toFixed?.(2) || item.mood || 0),
        energy: Math.max(1, Math.min(4, Number((item.mood || 2.5).toFixed(2)))),
        stress: Math.max(1, Math.min(4, Number((5 - (item.sleepQuality || 2.5)).toFixed(2)))),
      })),
      sleepQuality: rows.map((item) => ({
        day: item.day,
        date: item.date,
        quality: Number((item.sleepQuality || 0).toFixed(2)),
        hours: Math.min(9, Math.max(4, 5 + (item.sleepQuality || 0))),
      })),
      hotFlashFrequency: rows.map((item) => ({
        day: item.day,
        date: item.date,
        frequency: Number((item.hotFlashIntensity || 0).toFixed(2)),
        intensity: Number((item.hotFlashIntensity || 0).toFixed(2)),
      })),
      weightTrend: rows.map((item) => ({
        day: item.day,
        date: item.date,
        weight: Number((item.weight || 0).toFixed(2)),
      })),
      rawLogs: logs,
    };
  };

  // Fetch data from API
  const fetchWellnessData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/perimenopause/symptoms');
      const logs = Array.isArray(response.data?.logs) ? response.data.logs : [];
      setWellnessData(mapLogsToWellness(logs.length ? logs : getStoredLogs()));
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching wellness data:', err);
      setError('Failed to load data');
      setWellnessData(mapLogsToWellness(getStoredLogs()));
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchWellnessData();
  }, []);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Get color based on value
  const getMoodColor = (value) => {
    if (value >= 3) return '#10b981'; // green
    if (value >= 2) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getSleepColor = (value) => {
    if (value >= 4) return '#8b5cf6'; // purple
    if (value >= 3) return '#3b82f6'; // blue
    if (value >= 2) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getHotFlashColor = (value) => {
    if (value >= 5) return '#ef4444'; // red
    if (value >= 3) return '#f59e0b'; // yellow
    return '#10b981'; // green
  };

  const sleepMoodCorrelation = calculateSleepMoodCorrelation(wellnessData?.rawLogs || []);
  const safeAvg = (arr = [], key) => {
    if (!arr.length) return "0.0";
    return (arr.reduce((sum, day) => sum + (Number(day[key]) || 0), 0) / arr.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender-500 mx-auto mb-4"></div>
          <p className="text-lavender-600">Loading wellness analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Refresh Button and Last Updated */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2 font-serif">
              Wellness Analytics
            </h1>
            <p className="text-lg text-gray-600">
              Track your perimenopause wellness parameters
            </p>
          </div>
          <div className="text-right">
            <button
              onClick={fetchWellnessData}
              disabled={loading}
              className="bg-gradient-to-r from-lavender-400 to-purple-400 hover:from-lavender-500 hover:to-purple-500 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 mb-2"
            >
              {loading ? 'Refreshing...' : '🔄 Refresh Data'}
            </button>
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            {error && (
              <div className="text-sm text-red-600 mt-1">
                {error} - Showing cached data
              </div>
            )}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Mood Tracker Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-lavender-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">😊</span>
              Mood Tracker (Past 7 Days)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={wellnessData.moodTracker}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    domain={[0, 4]}
                    tickCount={5}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="energy" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="stress" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 mt-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Mood</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Energy</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Stress</span>
              </div>
            </div>
          </div>

          {/* Sleep Quality Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-lavender-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">😴</span>
              Sleep Quality (Past 7 Days)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wellnessData.sleepQuality}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    domain={[0, 5]}
                    tickCount={6}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="quality" radius={[4, 4, 0, 0]}>
                    {wellnessData.sleepQuality.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getSleepColor(entry.quality)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-sm text-gray-600 mt-4">
              Quality Scale: 1 (Poor) - 5 (Excellent)
            </div>
          </div>

          {/* Hot Flash Frequency Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-lavender-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🔥</span>
              Hot Flash Frequency (Past 7 Days)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wellnessData.hotFlashFrequency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    domain={[0, 8]}
                    tickCount={9}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="frequency" radius={[4, 4, 0, 0]}>
                    {wellnessData.hotFlashFrequency.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getHotFlashColor(entry.frequency)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-sm text-gray-600 mt-4">
              Number of hot flashes per day
            </div>
          </div>

          {/* Weight Trend Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-lavender-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">⚖️</span>
              Weight Trend (Past 7 Days)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={wellnessData.weightTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    domain={['dataMin - 1', 'dataMax + 1']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-sm text-gray-600 mt-4">
              Weight in kilograms (kg)
            </div>
          </div>
        </div>

        <HormoneSimulationGraph logs={wellnessData?.rawLogs || []} />

        <div className="mt-8">
          <AIHealthInsights logs={wellnessData?.rawLogs || []} title="AI Pattern Detection Insights" maxItems={4} />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-8">
          <div className="bg-white rounded-xl p-4 shadow-md border border-lavender-100">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold text-gray-800">Avg Mood</div>
              <div className="text-lg text-purple-600">
                {safeAvg(wellnessData.moodTracker, "mood")}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-md border border-lavender-100">
            <div className="text-center">
              <div className="text-2xl mb-2">😴</div>
              <div className="font-semibold text-gray-800">Avg Sleep</div>
              <div className="text-lg text-blue-600">
                {safeAvg(wellnessData.sleepQuality, "quality")}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-md border border-lavender-100">
            <div className="text-center">
              <div className="text-2xl mb-2">🔥</div>
              <div className="font-semibold text-gray-800">Avg Hot Flashes</div>
              <div className="text-lg text-red-600">
                {safeAvg(wellnessData.hotFlashFrequency, "frequency")}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-md border border-lavender-100">
            <div className="text-center">
              <div className="text-2xl mb-2">⚖️</div>
              <div className="font-semibold text-gray-800">Current Weight</div>
              <div className="text-lg text-purple-600">
                {wellnessData.weightTrend[wellnessData.weightTrend.length - 1]?.weight || 0} kg
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border border-lavender-100">
            <div className="text-center">
              <div className="text-2xl mb-2">🔗</div>
              <div className="font-semibold text-gray-800">Sleep-Mood Correlation</div>
              <div className="text-lg text-purple-600">{sleepMoodCorrelation}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm mt-8">
          <p>Developed by Meenakshi Anil | MCA Mini Project 2025</p>
        </div>
      </div>
    </div>
  );
}
