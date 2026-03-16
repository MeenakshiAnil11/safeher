import React, { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import api from "../../services/api";
import { filterLogsByDate, getStoredLogs } from "../../services/perimenopauseService";

export default function PerimenopauseReports() {
  const [activeTab, setActiveTab] = useState("symptoms");
  const [reportData, setReportData] = useState({
    symptoms: [],
    mood: [],
    sleep: []
  });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)); // 90 days ago
  const [endDate, setEndDate] = useState(new Date());
  const [dateRange, setDateRange] = useState("30");

  const buildReportFromLogs = (logs) => {
    const symptoms = [];
    const mood = [];
    const sleep = [];

    const byDay = {};
    logs.forEach((log) => {
      const day = String(log.date).slice(0, 10);
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(log);
    });
    Object.keys(byDay).sort().forEach((day) => {
      const rows = byDay[day];
      const avgHot = rows.reduce((s, r) => s + (Number(r.hotFlashIntensity) || 0), 0) / rows.length;
      const poorSleepCount = rows.filter((r) => (Number(r.sleepQuality) || 0) <= 2).length;
      const moodSwingsCount = rows.filter((r) => ["anxious", "irritable", "sad"].includes(String(r.mood).toLowerCase())).length;
      symptoms.push({
        date: day,
        hotFlashes: Number(avgHot.toFixed(2)),
        nightSweats: Number((avgHot * 0.7).toFixed(2)),
        moodSwings: moodSwingsCount,
        fatigue: poorSleepCount,
        headaches: Number((avgHot * 0.45).toFixed(2)),
      });
    });

    const byMonth = {};
    logs.forEach((log) => {
      const key = new Date(log.date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
      if (!byMonth[key]) byMonth[key] = [];
      byMonth[key].push(log);
    });
    Object.entries(byMonth).forEach(([month, rows]) => {
      const avgMood = rows.reduce((s, r) => s + (["happy", "energetic", "calm"].includes(r.mood) ? 4 : ["neutral"].includes(r.mood) ? 3 : 2), 0) / rows.length;
      const avgSleep = rows.reduce((s, r) => s + (Number(r.sleepQuality) || 0), 0) / rows.length;
      mood.push({
        month,
        averageMood: Number(avgMood.toFixed(2)),
        energyLevel: Number((avgMood > 3 ? 4 : avgMood > 2.5 ? 3 : 2).toFixed(2)),
        stressLevel: Number((5 - avgSleep).toFixed(2)),
      });
    });

    const filteredForWeeks = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
    for (let i = 0; i < filteredForWeeks.length; i += 7) {
      const weekRows = filteredForWeeks.slice(i, i + 7);
      if (!weekRows.length) continue;
      const weekDate = String(weekRows[0].date).slice(0, 10);
      sleep.push({
        week: `Week ${Math.floor(i / 7) + 1}`,
        date: weekDate,
        avgHours: Number((5 + (weekRows.reduce((s, r) => s + (Number(r.sleepQuality) || 0), 0) / weekRows.length)).toFixed(2)),
        quality: Number((weekRows.reduce((s, r) => s + (Number(r.sleepQuality) || 0), 0) / weekRows.length).toFixed(2)),
        interruptions: weekRows.filter((r) => (Number(r.sleepQuality) || 0) <= 2).length,
      });
    }

    return { symptoms, mood, sleep };
  };

  // Fetch report data from API
  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/perimenopause/reports', {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });
      const apiLogs = Array.isArray(response.data?.logs) ? response.data.logs : [];
      const fallbackLogs = filterLogsByDate(getStoredLogs(), startDate, endDate);
      const finalLogs = apiLogs.length ? apiLogs : fallbackLogs;
      setReportData(buildReportFromLogs(finalLogs));
    } catch (error) {
      console.error('Error fetching report data:', error);
      setReportData(buildReportFromLogs(filterLogsByDate(getStoredLogs(), startDate, endDate)));
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  // Handle date range preset
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    const today = new Date();
    const newStartDate = new Date(today);
    
    switch (range) {
      case "7":
        newStartDate.setDate(today.getDate() - 7);
        break;
      case "30":
        newStartDate.setDate(today.getDate() - 30);
        break;
      case "90":
        newStartDate.setDate(today.getDate() - 90);
        break;
      case "180":
        newStartDate.setDate(today.getDate() - 180);
        break;
      default:
        newStartDate.setDate(today.getDate() - 30);
    }
    
    setStartDate(newStartDate);
    setEndDate(today);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
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

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-4">
      <div className="h-64 bg-gray-200 rounded-lg"></div>
      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Perimenopause Report", 14, 22);
    doc.setFontSize(12);
    doc.text(`Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, 14, 30);
    
    if (activeTab === "symptoms") {
      doc.text("Symptom Frequency Report", 14, 40);
    } else if (activeTab === "mood") {
      doc.text("Mood Variation Report", 14, 40);
    } else if (activeTab === "sleep") {
      doc.text("Sleep Patterns Report", 14, 40);
    }
    
    doc.save(`perimenopause-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    let csvContent = "";
    
    if (activeTab === "symptoms") {
      csvContent = "Date,Hot Flashes,Night Sweats,Mood Swings,Fatigue,Headaches\n";
      reportData.symptoms.forEach(row => {
        csvContent += `${row.date},${row.hotFlashes},${row.nightSweats},${row.moodSwings},${row.fatigue},${row.headaches}\n`;
      });
    } else if (activeTab === "mood") {
      csvContent = "Month,Average Mood,Energy Level,Stress Level\n";
      reportData.mood.forEach(row => {
        csvContent += `${row.month},${row.averageMood},${row.energyLevel},${row.stressLevel}\n`;
      });
    } else if (activeTab === "sleep") {
      csvContent = "Week,Avg Hours,Quality,Interruptions\n";
      reportData.sleep.forEach(row => {
        csvContent += `${row.week},${row.avgHours},${row.quality},${row.interruptions}\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `perimenopause-report-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 font-serif">
            Perimenopause Reports
          </h1>
          <p className="text-lg text-gray-600">
            Long-term trends and statistics for your perimenopause journey
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Date Range:</label>
              <select
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="180">Last 180 days</option>
                <option value="custom">Custom Range</option>
              </select>
              
              {dateRange === "custom" && (
                <>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500"
                  />
                  <span className="text-gray-500">to</span>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500"
                  />
                </>
              )}
            </div>

            {/* Export Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleExportPDF}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                📄 Download PDF Report
              </button>
              <button
                onClick={handleExportCSV}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                📊 Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {[
            { key: "symptoms", label: "📈 Symptom Frequency" },
            { key: "mood", label: "😊 Mood Variation" },
            { key: "sleep", label: "😴 Sleep Patterns" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${
                activeTab === tab.key
                  ? "border-lavender-500 text-lavender-600"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {activeTab === "symptoms" && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    Symptom Frequency Over Time
                  </h3>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={reportData.symptoms}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="date"
                          stroke="#6b7280"
                          fontSize={12}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="hotFlashes" stroke="#ef4444" strokeWidth={2} name="Hot Flashes" />
                        <Line type="monotone" dataKey="nightSweats" stroke="#f59e0b" strokeWidth={2} name="Night Sweats" />
                        <Line type="monotone" dataKey="moodSwings" stroke="#8b5cf6" strokeWidth={2} name="Mood Swings" />
                        <Line type="monotone" dataKey="fatigue" stroke="#3b82f6" strokeWidth={2} name="Fatigue" />
                        <Line type="monotone" dataKey="headaches" stroke="#ec4899" strokeWidth={2} name="Headaches" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {activeTab === "mood" && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    Mood Variation Per Month
                  </h3>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.mood}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="averageMood" fill="#8b5cf6" name="Average Mood" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="energyLevel" fill="#10b981" name="Energy Level" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="stressLevel" fill="#ef4444" name="Stress Level" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {activeTab === "sleep" && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    Sleep Patterns (Weekly Average)
                  </h3>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.sleep}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="week" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="avgHours" fill="#3b82f6" name="Avg Hours" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="quality" fill="#8b5cf6" name="Quality" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm mt-8">
          <p>Developed by Meenakshi Anil | MCA Mini Project 2025</p>
        </div>
      </div>
    </div>
  );
}
