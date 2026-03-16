import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import UserHeader from "../../components/UserHeader";
import api from "../../services/api";
import ConceiveArticles from "./ConceiveArticles";
import "./periodTracker.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import FertilityProbabilityMeter from "../../components/periodtracker/FertilityProbabilityMeter";
import DailyFertilityScoreCard from "../../components/periodtracker/DailyFertilityScoreCard";
import AIInsightsPage from "../../components/periodtracker/AIInsightsPage";
import {
  getFertilityPrediction,
  getHealthIntelligenceData,
  getFertilityProbability,
  getDailyFertilityScoreData,
} from "../../utils/fertilityPrediction";
import { generateAIInsightCards } from "../../utils/aiInsightsEngine";

export default function ConceiveDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "overview");
  const [moodModalOpen, setMoodModalOpen] = useState(false);
  const [journalModalOpen, setJournalModalOpen] = useState(false);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [pregnancyTransitionModal, setPregnancyTransitionModal] = useState(false);
  const [dailyLogModalOpen, setDailyLogModalOpen] = useState(false);
  const [aiAnalysisModalOpen, setAiAnalysisModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Enhanced state management for daily logging
  const [dailyLog, setDailyLog] = useState({
    date: new Date().toISOString().split('T')[0],
    bbt: "",
    cervicalMucus: "none",
    cervicalPosition: "medium",
    ovulationTest: "not-tested",
    intercourse: false,
    intercourseTime: "",
    symptoms: [],
    mood: "neutral",
    energy: 5,
    stress: 5,
    sleepHours: 8,
    sleepQuality: "good",
    medications: [],
    supplements: [],
    notes: "",
    cycleDay: 1,
    phase: "follicular"
  });

  const [fertilityInsights, setFertilityInsights] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [recentLogs, setRecentLogs] = useState([]);
  const [hasData, setHasData] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [logSaveMessage, setLogSaveMessage] = useState("");
  const [quickFertilityInsight, setQuickFertilityInsight] = useState("");

  // Legacy state for backward compatibility
  const [moodData, setMoodData] = useState({
    mood: null,
    energy: null,
    stress: null,
    sleep: null,
    bbt: null,
    cervicalMucus: null,
    intercourse: false,
    notes: ""
  });

  const [journalEntry, setJournalEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    content: "",
    mood: "happy",
    isPrivate: true
  });

  const [journalEntries, setJournalEntries] = useState([]);

  // Enhanced cycle data with fertility calculations
  const [cycleData, setCycleData] = useState({
    currentPhase: null,
    cycleDay: null,
    daysUntilOvulation: null,
    ovulationDay: null,
    fertileWindowStartDay: null,
    fertileWindowEndDay: null,
    fertilityStatus: "Low Fertility",
    lastPeriodStartDate: null,
    cycleLength: 28,
    nextOvulationDate: null,
    fertileWindowStart: null,
    fertileWindowEnd: null,
    lastPeriod: null,
    averageCycleLength: 28,
    fertilityScore: null,
    bbtData: []
  });

  // Medical data
  const [medicalData, setMedicalData] = useState({
    thyroid: null,
    prolactin: null,
    fsh: null,
    lh: null
  });

  // AI Tips data
  const [aiTips, setAiTips] = useState([]);

  // Update active tab from location state
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // Fetch real data from API
  useEffect(() => {
    const fetchConceiveData = async () => {
      try {
        setLoading(true);
        const [logsResponse, phaseResponse] = await Promise.all([
          api.get('/fertility/logs'),
          api.get('/periods/current-phase')
        ]);

        const cycleLength = Number(phaseResponse?.data?.avgCycleLength) || 28;
        const lastPeriodStartDate = phaseResponse?.data?.lastPeriodStart || null;
        const prediction = getFertilityPrediction({
          lastPeriodStartDate: lastPeriodStartDate || new Date(),
          cycleLength,
        });

        const today = new Date();
        const cycleStart = lastPeriodStartDate ? new Date(lastPeriodStartDate) : new Date(today);
        const getDateForCycleDay = (day) => {
          const target = new Date(cycleStart);
          target.setDate(cycleStart.getDate() + (day - 1));
          return target;
        };

        setCycleData((prev) => ({
          ...prev,
          currentPhase: prediction.phase,
          cycleDay: prediction.cycleDay,
          daysUntilOvulation: prediction.daysUntilOvulation,
          ovulationDay: prediction.ovulationDay,
          fertileWindowStartDay: prediction.fertileWindowStart,
          fertileWindowEndDay: prediction.fertileWindowEnd,
          fertilityStatus: prediction.fertilityStatus,
          lastPeriodStartDate,
          cycleLength,
          nextOvulationDate: getDateForCycleDay(prediction.ovulationDay).toISOString(),
          fertileWindowStart: getDateForCycleDay(prediction.fertileWindowStart).toISOString(),
          fertileWindowEnd: getDateForCycleDay(prediction.fertileWindowEnd).toISOString(),
          lastPeriod: cycleStart.toISOString(),
          averageCycleLength: cycleLength,
        }));

        // Fetch fertility logs
        if (logsResponse.data?.logs && logsResponse.data.logs.length > 0) {
          setRecentLogs(logsResponse.data.logs);
          setHasData(true);
          
          // Use the latest log to populate mood data
          const latestLog = logsResponse.data.logs[0];
          setMoodData({
            mood: latestLog.mood || null,
            energy: latestLog.energy || null,
            stress: latestLog.stress || null,
            sleep: latestLog.sleepHours || null,
            bbt: latestLog.bbt || null,
            cervicalMucus: latestLog.cervicalMucus || null,
            intercourse: latestLog.intercourse || false,
            notes: latestLog.notes || ""
          });
          
          setCycleData((prev) => ({
            ...prev,
            fertilityScore: 75,
            bbtData: logsResponse.data.logs.slice(0, 8).map((log, idx) => ({
              day: idx + 1,
              temp: log.bbt || 36.5
            }))
          }));
        } else {
          setHasData(false);
        }

        // Fetch AI insights
        const insightsResponse = await api.get('/fertility/insights');
        if (insightsResponse.data?.insights) {
          // Ensure insights is an array
          const insights = Array.isArray(insightsResponse.data.insights) 
            ? insightsResponse.data.insights 
            : [];
          setAiTips(insights);
        }
      } catch (error) {
        console.error('Error fetching conceive data:', error);
        setHasData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchConceiveData();
  }, [refreshTrigger]);

  // Partner data
  const [partnerData, setPartnerData] = useState({
    hasPartner: false,
    partnerEmail: "",
    shareCode: "",
    partnerAccess: false
  });

  const getQuickLogInsight = (symptoms) => {
    const normalized = (Array.isArray(symptoms) ? symptoms : [])
      .map((item) => String(item).toLowerCase().trim());
    if (normalized.includes("cervical mucus")) {
      return "Cervical mucus detected today. This may indicate approaching ovulation.";
    }
    if (normalized.includes("mild cramps")) {
      return "Mild cramps logged. Track this pattern with cycle day for improved ovulation prediction.";
    }
    if (normalized.includes("fatigue")) {
      return "Fatigue noted today. Prioritize hydration and quality sleep to support hormonal health.";
    }
    if (normalized.includes("mood changes")) {
      return "Mood changes recorded. This can reflect hormone shifts across your cycle.";
    }
    return "Consistent daily logging helps generate more accurate fertility insights.";
  };

  const saveDailyLog = async () => {
    try {
      setLoading(true);
      setLogSaveMessage("");
      
      // Prepare symptoms array
      const symptoms = dailyLog.symptoms.map(symptom => ({
        name: symptom,
        intensity: 'mild'
      }));

      const logData = {
        ...dailyLog,
        symptoms,
        date: new Date(dailyLog.date).toISOString()
      };

      await api.post('/fertility/logs', logData);
      
      // Refresh data
      setRefreshTrigger(prev => prev + 1);
      setQuickFertilityInsight(getQuickLogInsight(dailyLog.symptoms));
      setLogSaveMessage("Log Saved Successfully ✓ Your health data has been recorded and will improve fertility predictions.");
      
      // Close modal
      setDailyLogModalOpen(false);
      
      // Reset form
      setDailyLog({
        date: new Date().toISOString().split('T')[0],
        bbt: "",
        cervicalMucus: "none",
        cervicalPosition: "medium",
        ovulationTest: "not-tested",
        intercourse: false,
        intercourseTime: "",
        symptoms: [],
        mood: "neutral",
        energy: 5,
        stress: 5,
        sleepHours: 8,
        sleepQuality: "good",
        medications: [],
        supplements: [],
        notes: "",
        cycleDay: 1,
        phase: "follicular"
      });
      
    } catch (error) {
      console.error('Error saving daily log:', error);
      setLogSaveMessage("Unable to save your log right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateAIAnalysis = async () => {
    try {
      setLoading(true);
      
      // Get recent logs for analysis
      const recentLogsResponse = await api.get('/fertility/logs?limit=7');
      const logs = recentLogsResponse.data.logs;
      
      if (logs.length === 0) {
        setAiAnalysis("No data available for analysis. Please log your daily symptoms first.");
        return;
      }

      // Prepare data for AI analysis
      const analysisData = {
        recentLogs: logs.map(log => ({
          date: log.date,
          mood: log.mood,
          energy: log.energy,
          stress: log.stress,
          sleepHours: log.sleepHours,
          sleepQuality: log.sleepQuality,
          bbt: log.bbt,
          cervicalMucus: log.cervicalMucus,
          ovulationTest: log.ovulationTest,
          intercourse: log.intercourse,
          symptoms: log.symptoms,
          notes: log.notes
        })),
        currentPhase: fertilityInsights?.currentPhase || "Unknown",
        fertilityScore: fertilityInsights?.fertilityScore || 0
      };

      // Generate AI analysis based on the data
      const analysis = generateFertilityAnalysis(analysisData);
      setAiAnalysis(analysis);
      setAiAnalysisModalOpen(true);
      
    } catch (error) {
      console.error('Error generating AI analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateFertilityAnalysis = (data) => {
    const { recentLogs, currentPhase, fertilityScore } = data;
    const latestLog = recentLogs[0];
    
    let analysis = `📊 **Daily Fertility Analysis - ${new Date(latestLog.date).toLocaleDateString()}**\n\n`;
    
    // Mood and Energy Analysis
    if (latestLog.energy >= 7) {
      analysis += `✅ **High Energy Level (${latestLog.energy}/10)** - Great for conception! Your energy levels are optimal.\n`;
    } else if (latestLog.energy <= 4) {
      analysis += `⚠️ **Low Energy Level (${latestLog.energy}/10)** - Consider rest and nutrition to boost fertility.\n`;
    } else {
      analysis += `📈 **Moderate Energy Level (${latestLog.energy}/10)** - Good baseline, room for improvement.\n`;
    }
    
    // Stress Analysis
    if (latestLog.stress <= 3) {
      analysis += `✅ **Low Stress Level (${latestLog.stress}/10)** - Excellent for fertility! Keep up stress management.\n`;
    } else if (latestLog.stress >= 7) {
      analysis += `⚠️ **High Stress Level (${latestLog.stress}/10)** - High stress can impact fertility. Try relaxation techniques.\n`;
    } else {
      analysis += `📊 **Moderate Stress Level (${latestLog.stress}/10)** - Manageable stress levels.\n`;
    }
    
    // Sleep Analysis
    if (latestLog.sleepHours >= 7 && latestLog.sleepQuality === 'excellent') {
      analysis += `✅ **Excellent Sleep Quality** - ${latestLog.sleepHours} hours of quality sleep supports fertility.\n`;
    } else if (latestLog.sleepHours < 6) {
      analysis += `⚠️ **Insufficient Sleep** - Only ${latestLog.sleepHours} hours. Aim for 7-9 hours for optimal fertility.\n`;
    } else {
      analysis += `📈 **Adequate Sleep** - ${latestLog.sleepHours} hours with ${latestLog.sleepQuality} quality.\n`;
    }
    
    // BBT Analysis
    if (latestLog.bbt) {
      if (latestLog.bbt >= 36.0 && latestLog.bbt <= 37.5) {
        analysis += `✅ **Normal BBT (${latestLog.bbt}°C)** - Temperature is within healthy range.\n`;
      } else {
        analysis += `📊 **BBT Recorded (${latestLog.bbt}°C)** - Track pattern over time for ovulation detection.\n`;
      }
    }
    
    // Cervical Mucus Analysis
    if (latestLog.cervicalMucus === 'egg-white') {
      analysis += `🎯 **Fertile Cervical Mucus** - Egg-white consistency indicates peak fertility!\n`;
    } else if (latestLog.cervicalMucus === 'watery') {
      analysis += `💧 **Watery Cervical Mucus** - Approaching fertile window.\n`;
    } else if (latestLog.cervicalMucus === 'creamy') {
      analysis += `🥛 **Creamy Cervical Mucus** - Early fertile phase.\n`;
    }
    
    // Ovulation Test Analysis
    if (latestLog.ovulationTest === 'positive') {
      analysis += `🎉 **Positive Ovulation Test** - Ovulation is imminent! Perfect timing for conception.\n`;
    } else if (latestLog.ovulationTest === 'peak') {
      analysis += `🔥 **Peak Ovulation Test** - Peak fertility detected! Optimal time for intercourse.\n`;
    }
    
    // Intercourse Timing
    if (latestLog.intercourse) {
      analysis += `💕 **Intercourse Logged** - Great timing during ${currentPhase} phase!\n`;
    } else if (currentPhase === 'ovulatory' || latestLog.ovulationTest === 'positive') {
      analysis += `⏰ **Fertile Window** - Consider intercourse for optimal conception timing.\n`;
    }
    
    // Fertility Score Analysis
    analysis += `\n📊 **Overall Fertility Score: ${fertilityScore}/100**\n`;
    if (fertilityScore >= 80) {
      analysis += `🌟 Excellent fertility indicators! Keep up the great work.\n`;
    } else if (fertilityScore >= 60) {
      analysis += `👍 Good fertility indicators with room for improvement.\n`;
    } else {
      analysis += `📈 Focus on improving sleep, stress management, and nutrition.\n`;
    }
    
    // Recommendations
    analysis += `\n💡 **AI Recommendations:**\n`;
    
    if (latestLog.energy <= 4) {
      analysis += `• Take a 20-minute walk to boost energy\n`;
      analysis += `• Consider iron-rich foods (spinach, lean meat)\n`;
    }
    
    if (latestLog.stress >= 7) {
      analysis += `• Practice 10 minutes of deep breathing\n`;
      analysis += `• Try meditation or gentle yoga\n`;
    }
    
    if (latestLog.sleepHours < 7) {
      analysis += `• Establish a consistent bedtime routine\n`;
      analysis += `• Avoid screens 1 hour before bed\n`;
    }
    
    if (latestLog.cervicalMucus === 'dry' && currentPhase === 'ovulatory') {
      analysis += `• Stay hydrated to improve cervical mucus\n`;
    }
    
    if (!latestLog.intercourse && (latestLog.ovulationTest === 'positive' || currentPhase === 'ovulatory')) {
      analysis += `• Consider intercourse during fertile window\n`;
    }
    
    analysis += `• Continue tracking daily for pattern recognition\n`;
    
    return analysis;
  };

  // Calculate fertility score
  const calculateFertilityScore = () => {
    let score = 50; // Base score
    
    // BBT stability (if within normal range)
    if (moodData.bbt >= 36.0 && moodData.bbt <= 37.5) score += 10;
    
    // Cervical mucus quality
    if (moodData.cervicalMucus === "egg white") score += 15;
    else if (moodData.cervicalMucus === "creamy") score += 10;
    else if (moodData.cervicalMucus === "sticky") score += 5;
    
    // Intercourse timing
    if (moodData.intercourse && cycleData.daysUntilOvulation <= 3) score += 15;
    
    // Sleep quality
    if (moodData.sleep >= 7) score += 10;
    else if (moodData.sleep >= 5) score += 5;
    
    // Stress levels
    if (moodData.stress <= 3) score += 10;
    else if (moodData.stress <= 5) score += 5;
    
    return Math.min(score, 100);
  };

  const handleMoodLog = () => {
    setMoodModalOpen(true);
  };

  const handleJournalLog = () => {
    setJournalModalOpen(true);
  };

  const handlePartnerSetup = () => {
    setPartnerModalOpen(true);
  };

  const saveMoodData = () => {
    const newScore = calculateFertilityScore();
    setCycleData(prev => ({ ...prev, fertilityScore: newScore }));
    setMoodModalOpen(false);
  };

  const updateJournalEntry = (field, value) => {
    setJournalEntry(prev => ({ ...prev, [field]: value }));
  };

  const saveJournalEntry = () => {
    // Add the journal entry to the array
    const newEntry = {
      ...journalEntry,
      id: Date.now(), // Generate unique ID
      createdAt: new Date().toISOString()
    };
    
    setJournalEntries(prev => [newEntry, ...prev]);
    
    console.log("Journal entry saved:", newEntry);
    setJournalModalOpen(false);
    setJournalEntry({
      date: new Date().toISOString().split('T')[0],
      content: "",
      mood: "happy",
      isPrivate: true
    });
  };

  const fetchMoreAITips = async () => {
    try {
      setLoading(true);
      const response = await api.get('/fertility/insights');
      if (response.data?.insights) {
        const insights = Array.isArray(response.data.insights) 
          ? response.data.insights 
          : [];
        // Add new tips to existing ones
        setAiTips(prev => [...insights, ...prev]);
      }
    } catch (error) {
      console.error('Error fetching more tips:', error);
      // Fallback: Add some default tips
      const defaultTips = [
        "Track your basal body temperature daily at the same time for best accuracy",
        "Maintain a healthy weight as it can affect hormone balance",
        "Reduce stress through meditation or yoga - high stress can impact ovulation",
        "Eat a balanced diet rich in folic acid, iron, and calcium",
        "Regular moderate exercise can improve fertility",
        "Ensure adequate sleep - 7-9 hours per night for optimal hormone regulation"
      ];
      setAiTips(prev => [...defaultTips, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerInvite = () => {
    // Generate share code
    const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setPartnerData(prev => ({ ...prev, shareCode, hasPartner: true }));
  };

  const handlePregnancyTransition = () => {
    setPregnancyTransitionModal(true);
  };

  const confirmPregnancyTransition = () => {
    navigate("/period-tracking/pregnancy-intro");
  };

  // Tab configuration
  const tabs = [
    { key: "overview", label: "📊 Overview" },
    { key: "daily-log", label: "📝 Daily Log" },
    { key: "insights", label: "🧠 AI Insights" },
    { key: "calendar", label: "📅 Calendar" },
    { key: "tracking", label: "🌡️ Tracking" },
    { key: "analytics", label: "📈 Analytics" },
    { key: "medical", label: "🏥 Medical"},
    { key: "journal", label: "📔 Journal" },
    { key: "articles", label: "📚 Articles" }
  ];

  const moodOptions = [
    { value: "happy", label: "Happy", emoji: "😊" },
    { value: "sad", label: "Sad", emoji: "😢" },
    { value: "anxious", label: "Anxious", emoji: "😰" },
    { value: "irritable", label: "Irritable", emoji: "😠" },
    { value: "calm", label: "Calm", emoji: "😌" },
    { value: "energetic", label: "Energetic", emoji: "⚡" },
    { value: "tired", label: "Tired", emoji: "😴" },
    { value: "neutral", label: "Neutral", emoji: "😐" }
  ];

  const [calendarValue, setCalendarValue] = useState(new Date());

  const toDateSafe = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const baseCycleLength = Number(cycleData.cycleLength || cycleData.averageCycleLength) || 28;
  const baseLastPeriodDate =
    toDateSafe(cycleData.lastPeriodStartDate) ||
    toDateSafe(cycleData.lastPeriod) ||
    new Date(new Date().setDate(new Date().getDate() - ((cycleData.cycleDay || 1) - 1)));

  const fertilityPrediction = useMemo(
    () =>
      getFertilityPrediction({
        lastPeriodStartDate: baseLastPeriodDate,
        cycleLength: baseCycleLength,
      }),
    [baseLastPeriodDate, baseCycleLength]
  );
  const healthIntelligence = useMemo(
    () =>
      getHealthIntelligenceData({
        lastPeriodStartDate: baseLastPeriodDate,
        cycleLength: baseCycleLength,
      }),
    [baseLastPeriodDate, baseCycleLength]
  );
  const fertilityProbability = useMemo(
    () =>
      getFertilityProbability(
        fertilityPrediction.cycleDay,
        fertilityPrediction.fertileWindowStart,
        fertilityPrediction.fertileWindowEnd
      ),
    [fertilityPrediction.cycleDay, fertilityPrediction.fertileWindowStart, fertilityPrediction.fertileWindowEnd]
  );
  const latestSymptoms = useMemo(() => {
    if (Array.isArray(recentLogs?.[0]?.symptoms) && recentLogs[0].symptoms.length) {
      return recentLogs[0].symptoms;
    }
    return Array.isArray(dailyLog?.symptoms) ? dailyLog.symptoms : [];
  }, [recentLogs, dailyLog?.symptoms]);

  const latestTemperature = useMemo(() => {
    if (recentLogs?.[0]?.bbt !== undefined && recentLogs?.[0]?.bbt !== null) {
      return recentLogs[0].bbt;
    }
    return dailyLog?.bbt;
  }, [recentLogs, dailyLog?.bbt]);

  const phaseForScore = useMemo(() => {
    if (
      fertilityPrediction.cycleDay >= fertilityPrediction.fertileWindowStart &&
      fertilityPrediction.cycleDay <= fertilityPrediction.fertileWindowEnd &&
      fertilityPrediction.phase !== "Ovulation"
    ) {
      return "Fertile Window";
    }
    return fertilityPrediction.phase;
  }, [
    fertilityPrediction.cycleDay,
    fertilityPrediction.fertileWindowStart,
    fertilityPrediction.fertileWindowEnd,
    fertilityPrediction.phase,
  ]);

  const dailyFertilityScoreData = useMemo(
    () =>
      getDailyFertilityScoreData({
        phase: phaseForScore,
        symptoms: latestSymptoms,
        temp: latestTemperature,
      }),
    [phaseForScore, latestSymptoms, latestTemperature]
  );
  const nextOvulationDate = new Date();
  nextOvulationDate.setDate(nextOvulationDate.getDate() + fertilityPrediction.daysUntilOvulation);
  const fertileStartDate = new Date(nextOvulationDate);
  fertileStartDate.setDate(nextOvulationDate.getDate() - 2);
  const fertileEndDate = new Date(nextOvulationDate);
  fertileEndDate.setDate(nextOvulationDate.getDate() + 2);
  const lastPeriodDate = new Date(baseLastPeriodDate);

  const aiInsightData = useMemo(
    () =>
      generateAIInsightCards({
        cycleDay: fertilityPrediction.cycleDay,
        cyclePhase: fertilityPrediction.phase,
        ovulationDay: fertilityPrediction.ovulationDay,
        fertileWindowStart: fertilityPrediction.fertileWindowStart,
        fertileWindowEnd: fertilityPrediction.fertileWindowEnd,
        daysUntilOvulation: fertilityPrediction.daysUntilOvulation,
        fertilityScore: dailyFertilityScoreData.fertilityScore,
        symptoms: latestSymptoms,
        temperature: latestTemperature,
        ovulationDate: nextOvulationDate,
        fertileStartDate,
        fertileEndDate,
        logsCount: recentLogs.length,
        logsThisWeek: recentLogs.filter((log) => {
          const now = new Date();
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - 6);
          weekStart.setHours(0, 0, 0, 0);
          const d = new Date(log?.date);
          return !Number.isNaN(d.getTime()) && d >= weekStart && d <= now;
        }).length,
      }),
    [
      fertilityPrediction.cycleDay,
      fertilityPrediction.phase,
      fertilityPrediction.ovulationDay,
      fertilityPrediction.fertileWindowStart,
      fertilityPrediction.fertileWindowEnd,
      fertilityPrediction.daysUntilOvulation,
      dailyFertilityScoreData.fertilityScore,
      latestSymptoms,
      latestTemperature,
      nextOvulationDate,
      fertileStartDate,
      fertileEndDate,
      recentLogs,
    ]
  );

  const sameDay = (a, b) =>
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const inRange = (date, start, end) => {
    if (!start || !end) return false;
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
    return d >= s && d <= e;
  };

  const analyticsSeries = useMemo(() => {
    const logs = recentLogs.slice(0, 10).reverse();
    const cycleLengthTrend = logs.map((log, idx) => ({
      name: `C${idx + 1}`,
      length: Number(log?.cycleLength || cycleData.averageCycleLength || 28),
    }));

    const symptomCounter = {};
    logs.forEach((log) => {
      (log?.symptoms || []).forEach((sym) => {
        const key = typeof sym === "string" ? sym : sym.name;
        if (key) symptomCounter[key] = (symptomCounter[key] || 0) + 1;
      });
    });
    const symptomsFrequency = Object.entries(symptomCounter)
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    const ovulationPredictionHistory = logs.map((log, idx) => ({
      name: `W${idx + 1}`,
      predictedDay: Number(log?.ovulationDay || 14),
    }));

    return {
      cycleLengthTrend: cycleLengthTrend.length ? cycleLengthTrend : [{ name: "C1", length: 28 }],
      symptomsFrequency: symptomsFrequency.length ? symptomsFrequency : [{ name: "No symptoms", count: 0 }],
      ovulationPredictionHistory: ovulationPredictionHistory.length ? ovulationPredictionHistory : [{ name: "W1", predictedDay: 14 }],
    };
  }, [recentLogs, cycleData.averageCycleLength]);
  const analyticsInsights = useMemo(() => {
    const logs = Array.isArray(recentLogs) ? [...recentLogs] : [];
    const sortedLogs = logs
      .filter((log) => !Number.isNaN(new Date(log?.date).getTime()))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const cycleLengths = sortedLogs
      .map((log) => Number(log?.cycleLength))
      .filter((len) => Number.isFinite(len) && len > 0);
    const fallbackCycleLengths = cycleLengths.length ? cycleLengths : [Number(cycleData.averageCycleLength) || 28];
    const averageCycleLength = Math.round(fallbackCycleLengths.reduce((sum, val) => sum + val, 0) / fallbackCycleLengths.length);
    const longestCycle = Math.max(...fallbackCycleLengths);
    const shortestCycle = Math.min(...fallbackCycleLengths);
    const totalCyclesTracked = fallbackCycleLengths.length;

    const temperatureTrend = sortedLogs
      .filter((log) => log?.bbt !== null && log?.bbt !== undefined && !Number.isNaN(Number(log.bbt)))
      .slice(-10)
      .map((log) => {
        const d = new Date(log.date);
        return {
          date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          temperature: Number(log.bbt),
        };
      });

    const moodBuckets = { Happy: 0, Neutral: 0, Low: 0 };
    sortedLogs.forEach((log) => {
      const mood = String(log?.mood || "").toLowerCase();
      if (["happy", "energetic", "calm"].includes(mood)) moodBuckets.Happy += 1;
      else if (["neutral"].includes(mood)) moodBuckets.Neutral += 1;
      else moodBuckets.Low += 1;
    });
    const moodTrend = Object.entries(moodBuckets).map(([name, count]) => ({ name, count }));

    const fertilityScoreTrend = sortedLogs.slice(-10).map((log, idx) => {
      const computedScore = getDailyFertilityScoreData({
        phase: log?.phase || fertilityPrediction.phase,
        symptoms: Array.isArray(log?.symptoms) ? log.symptoms : [],
        temp: log?.bbt,
      }).fertilityScore;
      return {
        name: `D${idx + 1}`,
        score: Number(log?.fertilityScore) || computedScore || dailyFertilityScoreData.fertilityScore,
      };
    });

    const topSymptoms = [...(analyticsSeries.symptomsFrequency || [])]
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    const topSymptomInsight = topSymptoms.length
      ? `${topSymptoms[0].name} is the most frequently recorded symptom.`
      : "Keep logging symptoms to reveal pattern insights.";

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const loggedThisMonth = sortedLogs.filter((log) => {
      const d = new Date(log.date);
      return d >= monthStart && d <= now;
    }).length;

    const cycleConsistencyInsight =
      Math.abs(longestCycle - shortestCycle) <= 2
        ? "Your cycle length appears consistent. Regular cycles often indicate stable hormonal patterns."
        : "Your cycle length shows some variation. Consistent tracking can improve personalized predictions.";

    return {
      averageCycleLength,
      longestCycle,
      shortestCycle,
      totalCyclesTracked,
      cycleConsistencyInsight,
      temperatureTrend: temperatureTrend.length
        ? temperatureTrend
        : [{ date: "Today", temperature: Number(latestTemperature) || 36.5 }],
      moodTrend,
      fertilityScoreTrend: fertilityScoreTrend.length
        ? fertilityScoreTrend
        : [{ name: "D1", score: dailyFertilityScoreData.fertilityScore }],
      topSymptoms,
      topSymptomInsight,
      loggedThisMonth,
    };
  }, [
    recentLogs,
    cycleData.averageCycleLength,
    latestTemperature,
    fertilityPrediction.phase,
    dailyFertilityScoreData.fertilityScore,
    analyticsSeries.symptomsFrequency,
  ]);
  const trackingStreakDays = useMemo(() => {
    if (!Array.isArray(recentLogs) || recentLogs.length === 0) return 0;
    const uniqueDates = [
      ...new Set(
        recentLogs
          .map((log) => {
            const d = new Date(log?.date);
            if (Number.isNaN(d.getTime())) return null;
            return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
          })
          .filter(Boolean)
      ),
    ].sort((a, b) => b - a);

    if (!uniqueDates.length) return 0;
    let streak = 1;
    const dayMs = 24 * 60 * 60 * 1000;
    for (let i = 1; i < uniqueDates.length; i += 1) {
      if (uniqueDates[i - 1] - uniqueDates[i] === dayMs) streak += 1;
      else break;
    }
    return streak;
  }, [recentLogs]);
  const medicalHealthInsights = useMemo(() => {
    const logs = Array.isArray(recentLogs) ? recentLogs : [];

    const cycleLengths = logs
      .map((log) => Number(log?.cycleLength))
      .filter((value) => Number.isFinite(value) && value > 0);
    const avgCycle = cycleLengths.length
      ? cycleLengths.reduce((sum, value) => sum + value, 0) / cycleLengths.length
      : Number(cycleData.averageCycleLength) || 28;
    const irregularCycles = cycleLengths.filter((value) => Math.abs(value - avgCycle) > 3).length;

    const symptomCounter = {};
    logs.forEach((log) => {
      (Array.isArray(log?.symptoms) ? log.symptoms : []).forEach((symptom) => {
        const key = (typeof symptom === "string" ? symptom : symptom?.name || "").toLowerCase().trim();
        if (key) symptomCounter[key] = (symptomCounter[key] || 0) + 1;
      });
    });
    const crampsCount = (symptomCounter.cramps || 0) + (symptomCounter["mild cramps"] || 0);

    const recentScoreValues = logs.slice(0, 10).map((log) =>
      Number(log?.fertilityScore) ||
      getDailyFertilityScoreData({
        phase: log?.phase || fertilityPrediction.phase,
        symptoms: Array.isArray(log?.symptoms) ? log.symptoms : [],
        temp: log?.bbt,
      }).fertilityScore
    );
    const lowScoreDays = recentScoreValues.filter((score) => score < 40).length;

    const temperatureValues = logs
      .map((log) => Number(log?.bbt))
      .filter((value) => Number.isFinite(value));
    const tempSpread =
      temperatureValues.length > 1 ? Math.max(...temperatureValues) - Math.min(...temperatureValues) : 0;

    const messages = [];
    if (irregularCycles >= 2) {
      messages.push("Your cycle length appears irregular. Consider consulting a healthcare professional.");
    }
    if (crampsCount >= 3) {
      messages.push("Frequent cramps have been detected in your recent logs.");
    }
    if (lowScoreDays >= 4) {
      messages.push("Your fertility score trend suggests delayed ovulation patterns.");
    }
    if (!messages.length && trackingStreakDays >= 3) {
      messages.push("Your cycle tracking appears consistent and healthy.");
    }
    if (!messages.length) {
      messages.push("Keep logging symptoms and temperature daily for deeper clinical insights.");
    }

    let alertTitle = "General Monitoring Recommended";
    let alertMessage = "Continue daily tracking and monitor any persistent symptoms.";
    if (irregularCycles >= 2) {
      alertTitle = "Irregular cycle detected";
      alertMessage = "Your recent cycle data shows irregular patterns. You may benefit from consulting a medical professional.";
    } else if (crampsCount >= 3) {
      alertTitle = "Frequent symptoms detected";
      alertMessage = "Frequent cramps have appeared in recent logs. Consider discussing pain patterns with a clinician.";
    } else if (lowScoreDays >= 4 || tempSpread > 0.7) {
      alertTitle = "Possible ovulation irregularity";
      alertMessage = "Recent tracking suggests ovulation variability. A medical review may help clarify hormone patterns.";
    }

    return {
      messages,
      alertTitle,
      alertMessage,
    };
  }, [
    recentLogs,
    cycleData.averageCycleLength,
    fertilityPrediction.phase,
    trackingStreakDays,
  ]);

  const userName = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return "there";
      const parsed = JSON.parse(raw);
      return parsed?.name || parsed?.fullName || parsed?.username || "there";
    } catch (error) {
      return "there";
    }
  }, []);

  const todayGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const latestLogSnapshot = useMemo(() => {
    const latest = recentLogs?.[0] || {};
    const rawSymptoms = Array.isArray(latest?.symptoms) && latest.symptoms.length ? latest.symptoms : dailyLog.symptoms || [];
    const symptoms = rawSymptoms
      .map((item) => (typeof item === "string" ? item : item?.name))
      .filter(Boolean);

    return {
      temperature: latest?.bbt ?? dailyLog?.bbt ?? "Not logged",
      mood: latest?.mood || dailyLog?.mood || "Not logged",
      symptoms,
      notes: latest?.notes || dailyLog?.notes || "No notes added yet.",
    };
  }, [recentLogs, dailyLog]);

  const lutealPhaseStartDate = useMemo(() => {
    const value = new Date(fertileEndDate);
    value.setDate(value.getDate() + 1);
    return value;
  }, [fertileEndDate]);
  const trackingConfidence = useMemo(() => {
    const totalLogs = Array.isArray(recentLogs) ? recentLogs.length : 0;
    if (totalLogs >= 14) {
      return {
        level: "High",
        message: "Your tracking consistency is strong. Predictions are becoming highly reliable.",
      };
    }
    if (totalLogs >= 7) {
      return {
        level: "Medium",
        message: "More daily logs will improve prediction accuracy.",
      };
    }
    return {
      level: "Low",
      message: "Keep logging daily signals to improve prediction confidence.",
    };
  }, [recentLogs]);
  const journalMoodSummary = useMemo(() => {
    const buckets = { happy: 0, neutral: 0, low: 0 };
    (Array.isArray(journalEntries) ? journalEntries : []).forEach((entry) => {
      const mood = String(entry?.mood || "").toLowerCase();
      if (mood === "happy") buckets.happy += 1;
      else if (mood === "neutral") buckets.neutral += 1;
      else if (mood === "low" || mood === "sad" || mood === "anxious" || mood === "tired") buckets.low += 1;
    });
    return buckets;
  }, [journalEntries]);

  const journalStreakDays = useMemo(() => {
    if (!Array.isArray(journalEntries) || !journalEntries.length) return 0;
    const uniqueDates = [
      ...new Set(
        journalEntries
          .map((entry) => {
            const d = new Date(entry?.date);
            if (Number.isNaN(d.getTime())) return null;
            return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
          })
          .filter(Boolean)
      ),
    ].sort((a, b) => b - a);
    if (!uniqueDates.length) return 0;

    let streak = 1;
    const dayMs = 24 * 60 * 60 * 1000;
    for (let i = 1; i < uniqueDates.length; i += 1) {
      if (uniqueDates[i - 1] - uniqueDates[i] === dayMs) streak += 1;
      else break;
    }
    return streak;
  }, [journalEntries]);

  const wellnessInsight = useMemo(() => {
    const allText = (Array.isArray(journalEntries) ? journalEntries : [])
      .map((entry) => String(entry?.content || "").toLowerCase())
      .join(" ");
    const lowMoodCount = journalMoodSummary.low;
    const positiveCount = journalMoodSummary.happy;
    const fatigueSignals = (allText.match(/fatigue|tired|exhausted/g) || []).length;

    if (positiveCount >= Math.max(2, lowMoodCount + 1)) {
      return "Your recent journal entries show positive emotional patterns.";
    }
    if (lowMoodCount >= 2 || fatigueSignals >= 2) {
      return "You have recorded low mood recently. This may occur during hormonal cycle changes.";
    }
    return "Your reflections are building a useful emotional baseline. Keep journaling consistently.";
  }, [journalEntries, journalMoodSummary]);

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      
      <div className="conceive-layout" style={{ marginTop: "64px" }}>
        {/* Sidebar */}
        <div className="conceive-sidebar w-64 bg-white shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Conceive Mode</h2>
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                    activeTab === tab.key
                      ? "bg-pink-100 text-pink-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Back to Mode Selection */}
            <div className="mt-8 p-4 border-t pt-4">
              <button
                onClick={() => navigate("/period-tracking")}
                className="w-full bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
              >
                <span>←</span>
                <span>Back to Mode Selection</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="conceive-content flex-1 p-8 bg-gradient-to-br from-pink-50 via-white to-purple-50">
          {activeTab === "overview" && (
            <div className="space-y-5">
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100">
                <h2 className="text-2xl font-bold text-gray-800">
                  {todayGreeting}, {userName} 🌸
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Here is your fertility overview for today.
                </p>
              </section>

              <DailyFertilityScoreCard data={dailyFertilityScoreData} />

              <section className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Today's Fertility Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                  <p>Cycle Day: <strong>{fertilityPrediction.cycleDay}</strong></p>
                  <p>Current Phase: <strong>{fertilityPrediction.phase}</strong></p>
                  <p>Ovulation In: <strong>{fertilityPrediction.daysUntilOvulation} day(s)</strong></p>
                  <p>Fertile Window: <strong>{fertileStartDate.toLocaleDateString()} - {fertileEndDate.toLocaleDateString()}</strong></p>
                </div>
                <p className="mt-3 text-sm text-purple-700">
                  Recommended Action: Track symptoms and maintain healthy sleep.
                </p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">🌟 Fertility Status</h3>
                  <p className="text-sm text-gray-500 mb-2">Status: <strong className="text-pink-600">{fertilityPrediction.fertilityStatus}</strong></p>
                  <p className="text-sm text-gray-600">Ovulation Day: {nextOvulationDate.toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">Fertile Window: {fertileStartDate.toLocaleDateString()} - {fertileEndDate.toLocaleDateString()}</p>
                </section>

                <section className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">📊 Cycle Summary</h3>
                  <p className="text-sm text-gray-600">Current Phase: <strong>{fertilityPrediction.phase}</strong></p>
                  <p className="text-sm text-gray-600">Cycle Day: <strong>{fertilityPrediction.cycleDay}</strong></p>
                  <p className="text-sm text-gray-600">Days Until Ovulation: <strong>{fertilityPrediction.daysUntilOvulation}</strong></p>
                </section>

                <FertilityProbabilityMeter probability={fertilityProbability} />

                <section className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">🏃 Recommended Exercises</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {healthIntelligence.exercises.map((exercise) => (
                      <li key={exercise}>• {exercise}</li>
                    ))}
                  </ul>
                </section>

                <section className="bg-white rounded-2xl p-5 shadow-sm border border-teal-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">💧 Quick Health Tips</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• {healthIntelligence.healthTip}</li>
                    <li>• Stay hydrated</li>
                    <li>• Maintain healthy sleep</li>
                  </ul>
                </section>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Today's Log</h3>
                  <p className="text-sm text-gray-700">Temperature: <strong>{latestLogSnapshot.temperature === "Not logged" ? "Not logged" : `${latestLogSnapshot.temperature}°C`}</strong></p>
                  <p className="text-sm text-gray-700 mt-1">Mood: <strong className="capitalize">{latestLogSnapshot.mood}</strong></p>
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-gray-700">Symptoms:</p>
                    {latestLogSnapshot.symptoms.length ? (
                      <ul className="text-sm text-gray-700 mt-1 space-y-1">
                        {latestLogSnapshot.symptoms.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 mt-1">No symptoms logged today.</p>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-gray-700">Notes:</p>
                    <p className="text-sm text-gray-600 mt-1">{latestLogSnapshot.notes}</p>
                  </div>
                </section>

                <section className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Upcoming Cycle Events</h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-pink-400" />
                      <p><strong>{fertileStartDate.toLocaleDateString()}</strong> - Fertile Window Begins</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-purple-400" />
                      <p><strong>{nextOvulationDate.toLocaleDateString()}</strong> - Ovulation Day</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-400" />
                      <p><strong>{lutealPhaseStartDate.toLocaleDateString()}</strong> - Luteal Phase Begins</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Cycle Insight</h3>
                  <p className="text-sm text-gray-700">Your average cycle length is <strong>{baseCycleLength} days</strong>.</p>
                  <p className="text-sm text-gray-700 mt-1">Ovulation typically occurs around <strong>Day {fertilityPrediction.ovulationDay}</strong>.</p>
                </section>

                <section className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Nutrition Tip</h3>
                  <p className="text-sm text-gray-700">Folate and iron support reproductive health.</p>
                  <ul className="text-sm text-gray-700 mt-2 space-y-1">
                    <li>• Spinach</li>
                    <li>• Lentils</li>
                    <li>• Avocado</li>
                    <li>• Whole grains</li>
                  </ul>
                </section>

                <section className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("daily-log")}
                      className="w-full text-left text-sm font-medium px-3 py-2 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100"
                    >
                      Log Today's Symptoms
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("daily-log")}
                      className="w-full text-left text-sm font-medium px-3 py-2 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100"
                    >
                      Add Basal Temperature
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("calendar")}
                      className="w-full text-left text-sm font-medium px-3 py-2 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100"
                    >
                      Open Fertility Calendar
                    </button>
                  </div>
                </section>

                <section className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Wellness Message</h3>
                  <p className="text-sm text-gray-700">
                    Your fertility journey is unique.
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    Consistent tracking helps you understand your body's natural rhythm.
                  </p>
                </section>
              </div>
            </div>
          )}

          {activeTab === "daily-log" && (
            <div className="max-w-4xl mx-auto space-y-5">
              <section className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2">🌸 Today's Cycle Context</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
                  <p>Cycle Day: <strong>{fertilityPrediction.cycleDay}</strong></p>
                  <p>Current Phase: <strong>{fertilityPrediction.phase}</strong></p>
                  <p>Ovulation In: <strong>{fertilityPrediction.daysUntilOvulation} day(s)</strong></p>
                </div>
                <p className="text-sm text-pink-700 mt-3">
                  Tracking body signals during this phase helps predict ovulation more accurately.
                </p>
              </section>

              <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-1">Daily Log</h3>
                <p className="text-sm text-gray-500 mb-6">Track your symptoms and bio-signals to improve fertility insights.</p>
                {logSaveMessage ? (
                  <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${logSaveMessage.includes("Successfully") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {logSaveMessage}
                  </div>
                ) : null}
                {quickFertilityInsight ? (
                  <div className="mb-4 rounded-xl px-4 py-3 text-sm bg-purple-50 text-purple-700 border border-purple-100">
                    {quickFertilityInsight}
                  </div>
                ) : null}
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">🩺 Symptoms</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {["cervical mucus", "mild cramps", "mood changes", "fatigue"].map((symptom) => (
                        <label key={symptom} className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={dailyLog.symptoms.includes(symptom)}
                            onChange={(e) => {
                              if (e.target.checked) setDailyLog({ ...dailyLog, symptoms: [...dailyLog.symptoms, symptom] });
                              else setDailyLog({ ...dailyLog, symptoms: dailyLog.symptoms.filter((s) => s !== symptom) });
                            }}
                          />
                          {symptom}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">🌡 Body Temperature</label>
                    <input
                      type="number"
                      step="0.1"
                      value={dailyLog.bbt}
                      onChange={(e) => setDailyLog({ ...dailyLog, bbt: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl"
                      placeholder="Enter basal temperature"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">😊 Mood selector</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button type="button" onClick={() => setDailyLog({ ...dailyLog, mood: "happy" })} className={`p-3 rounded-xl border ${dailyLog.mood === "happy" ? "bg-pink-50 border-pink-400" : "border-gray-200"}`}>😊 Happy</button>
                      <button type="button" onClick={() => setDailyLog({ ...dailyLog, mood: "neutral" })} className={`p-3 rounded-xl border ${dailyLog.mood === "neutral" ? "bg-purple-50 border-purple-400" : "border-gray-200"}`}>😐 Neutral</button>
                      <button type="button" onClick={() => setDailyLog({ ...dailyLog, mood: "low" })} className={`p-3 rounded-xl border ${dailyLog.mood === "low" ? "bg-gray-50 border-gray-400" : "border-gray-200"}`}>😞 Low</button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">📝 Notes</label>
                    <textarea
                      value={dailyLog.notes}
                      onChange={(e) => setDailyLog({ ...dailyLog, notes: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl h-28"
                    />
                  </div>

                  <button
                    onClick={saveDailyLog}
                    disabled={loading}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold"
                  >
                    {loading ? "Saving..." : "Save Log"}
                  </button>
                </div>
              </section>

              <section className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Why Track These Signals?</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Cervical mucus can indicate approaching ovulation</li>
                  <li>• Basal temperature helps identify ovulation patterns</li>
                  <li>• Mood tracking helps understand hormonal changes</li>
                </ul>
              </section>

              <section className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-100">
                <h3 className="text-lg font-bold text-gray-800 mb-3">📊 Recent Logs</h3>
                {recentLogs.slice(0, 4).length ? (
                  <div className="space-y-3">
                    {recentLogs.slice(0, 4).map((entry, idx) => {
                      const entrySymptoms = (Array.isArray(entry?.symptoms) ? entry.symptoms : [])
                        .map((item) => (typeof item === "string" ? item : item?.name))
                        .filter(Boolean);
                      return (
                        <article key={`${entry?.date || idx}`} className="rounded-xl border border-indigo-100 bg-indigo-50/40 px-4 py-3">
                          <p className="text-sm font-semibold text-gray-800">{new Date(entry?.date || Date.now()).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-700 mt-1">Temperature: {entry?.bbt ? `${entry.bbt}°C` : "Not logged"}</p>
                          <p className="text-sm text-gray-700">Mood: <span className="capitalize">{entry?.mood || "Not logged"}</span></p>
                          <p className="text-sm text-gray-700">Symptoms: {entrySymptoms.length ? entrySymptoms.join(", ") : "None"}</p>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No recent entries yet. Save your first daily log to build history.</p>
                )}
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Tracking Progress</h3>
                  <p className="text-sm text-gray-700">
                    You have logged your health data <strong>{trackingStreakDays}</strong> day{trackingStreakDays === 1 ? "" : "s"} in a row.
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Consistent tracking improves fertility insights.</p>
                </section>

                <section className="bg-white rounded-2xl p-5 shadow-sm border border-teal-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Logging Tips</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Measure basal temperature in the morning</li>
                    <li>• Record symptoms daily</li>
                    <li>• Consistency improves cycle predictions</li>
                  </ul>
                </section>
              </div>
            </div>
          )}

          {activeTab === "insights" && (
            <AIInsightsPage insightData={aiInsightData} />
          )}

          {activeTab === "calendar" && (
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Cycle Calendar</h3>
              <Calendar
                value={calendarValue}
                onChange={setCalendarValue}
                tileClassName={({ date, view }) => {
                  if (view !== "month") return null;
                  if (inRange(date, lastPeriodDate, new Date(new Date(lastPeriodDate).setDate(lastPeriodDate.getDate() + 4)))) return "pt-period-day";
                  if (sameDay(date, nextOvulationDate)) return "pt-ovulation-day";
                  if (inRange(date, fertileStartDate, fertileEndDate)) return "pt-fertile-day";
                  return null;
                }}
                tileContent={({ date, view }) => (view === "month" && sameDay(date, nextOvulationDate) ? <span title="Ovulation" className="block text-[10px]">⭐</span> : null)}
              />
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-2"><i className="dot period"></i> Period Days</span>
                <span className="flex items-center gap-2"><i className="dot fertile"></i> Fertile Window</span>
                <span className="flex items-center gap-2">⭐ Ovulation Day</span>
              </div>
            </section>
          )}

          {activeTab === "tracking" && (
            <div className="space-y-5">
              <section className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2">🔄 Cycle Progress</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Day <strong>{fertilityPrediction.cycleDay}</strong> of <strong>{baseCycleLength}</strong> cycle
                </p>
                <div className="h-2.5 rounded-full bg-indigo-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500"
                    style={{ width: `${Math.max(0, Math.min(100, (fertilityPrediction.cycleDay / baseCycleLength) * 100))}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs text-gray-600">
                  {["Menstrual", "Follicular", "Ovulation", "Luteal"].map((phase) => (
                    <div key={phase} className="flex items-center gap-1">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          fertilityPrediction.phase.toLowerCase() === phase.toLowerCase()
                            ? "bg-pink-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span>{phase}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-indigo-700 mt-3">
                  You are currently in the {fertilityPrediction.phase} Phase. Ovulation is expected in {fertilityPrediction.daysUntilOvulation} day(s).
                </p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100">
                  <h4 className="font-bold text-gray-800 mb-2">Next Ovulation Date</h4>
                  <p className="text-xl text-pink-600 font-semibold">{nextOvulationDate.toLocaleDateString()}</p>
                </section>
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
                  <h4 className="font-bold text-gray-800 mb-2">Fertile Window</h4>
                  <p className="text-gray-700">{fertileStartDate.toLocaleDateString()} - {fertileEndDate.toLocaleDateString()}</p>
                </section>
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-teal-100">
                  <h4 className="font-bold text-gray-800 mb-2">Chance of Conception</h4>
                  <p className="font-semibold text-lg">{fertilityPrediction.fertilityStatus.replace(" Fertility", "")}</p>
                </section>
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100">
                  <h4 className="font-bold text-gray-800 mb-2">Recommended Activities Today</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Yoga</li>
                    <li>• Meditation</li>
                    <li>• Light cardio</li>
                  </ul>
                  <div className="mt-3 pt-3 border-t border-pink-100">
                    <p className="text-xs font-semibold text-gray-700">Why?</p>
                    <p className="text-xs text-gray-600 mt-1">
                      During the {fertilityPrediction.phase.toLowerCase()} phase, energy levels can shift and moderate movement may support hormonal balance.
                    </p>
                  </div>
                </section>
              </div>

              <section className="bg-white rounded-2xl p-5 shadow-sm border border-red-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2">❤️ Today's Fertility Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
                  <p>Cycle Day: <strong>{fertilityPrediction.cycleDay}</strong></p>
                  <p>Phase: <strong>{fertilityPrediction.phase}</strong></p>
                  <p>Chance of Conception: <strong>{fertilityPrediction.fertilityStatus.replace(" Fertility", "")}</strong></p>
                </div>
                <p className="text-sm text-red-700 mt-2">Focus on wellness and consistent tracking.</p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">🧘 Lifestyle Recommendation</h3>
                  <p className="text-sm text-gray-700">
                    Balanced nutrition and moderate exercise may support hormonal balance during this phase.
                  </p>
                </section>

                <section className="bg-white rounded-2xl p-5 shadow-sm border border-cyan-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">📅 Upcoming Cycle Events</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>{fertileStartDate.toLocaleDateString()}</strong> → Fertile Window Begins</p>
                    <p><strong>{nextOvulationDate.toLocaleDateString()}</strong> → Ovulation Day</p>
                    <p><strong>{lutealPhaseStartDate.toLocaleDateString()}</strong> → Luteal Phase Begins</p>
                  </div>
                </section>
              </div>

              <section className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2">🩺 Recent Body Signals</h3>
                <p className="text-sm text-gray-700">Temperature: <strong>{latestLogSnapshot.temperature === "Not logged" ? "Not logged" : `${latestLogSnapshot.temperature}°C`}</strong></p>
                <p className="text-sm text-gray-700 mt-1">Mood: <strong className="capitalize">{latestLogSnapshot.mood}</strong></p>
                <div className="mt-2">
                  <p className="text-sm font-semibold text-gray-700">Symptoms Logged:</p>
                  {latestLogSnapshot.symptoms.length ? (
                    <ul className="text-sm text-gray-700 mt-1 space-y-1">
                      {latestLogSnapshot.symptoms.map((signal) => (
                        <li key={signal}>• {signal}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">No recent symptoms logged.</p>
                  )}
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-violet-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Fertility Insight</h3>
                  <p className="text-sm text-gray-700">
                    Your fertile window begins in {Math.max(0, fertilityPrediction.daysUntilOvulation - 2)} day(s). Logging symptoms regularly improves cycle prediction accuracy.
                  </p>
                </section>

                <section className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Nutrition Tip</h3>
                  <p className="text-sm text-gray-700">Iron and folate support reproductive health.</p>
                  <ul className="text-sm text-gray-700 mt-2 space-y-1">
                    <li>• Spinach</li>
                    <li>• Lentils</li>
                    <li>• Avocado</li>
                    <li>• Whole grains</li>
                  </ul>
                </section>
              </div>

              <section className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Prediction Confidence</h3>
                <p className="text-sm text-gray-700">
                  Confidence Level: <strong>{trackingConfidence.level}</strong>
                </p>
                <p className="text-sm text-gray-600 mt-1">{trackingConfidence.message}</p>
              </section>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-5">
              <section className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-100">
                <h4 className="font-bold text-gray-800 mb-3">📊 Cycle Health Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-700">
                  <p>Average Cycle Length: <strong>{analyticsInsights.averageCycleLength} days</strong></p>
                  <p>Longest Cycle: <strong>{analyticsInsights.longestCycle} days</strong></p>
                  <p>Shortest Cycle: <strong>{analyticsInsights.shortestCycle} days</strong></p>
                  <p>Total Cycles Tracked: <strong>{analyticsInsights.totalCyclesTracked}</strong></p>
                </div>
                <p className="text-sm text-indigo-700 mt-3">{analyticsInsights.cycleConsistencyInsight}</p>
              </section>

              <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-3">Cycle Length Trend</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsSeries.cycleLengthTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="length" stroke="#ec4899" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-3">Symptoms Frequency</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsSeries.symptomsFrequency}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#a78bfa" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 text-sm text-gray-700">
                  <p className="font-semibold">Most Common Symptoms:</p>
                  {analyticsInsights.topSymptoms.length ? (
                    <ul className="mt-1 space-y-1">
                      {analyticsInsights.topSymptoms.map((symptom) => (
                        <li key={symptom.name}>
                          {symptom.name} -> {symptom.count} {symptom.count === 1 ? "time" : "times"}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-gray-500">No symptom records yet.</p>
                  )}
                  <p className="mt-2 text-purple-700">{analyticsInsights.topSymptomInsight}</p>
                </div>
              </section>

              <section className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100">
                <h4 className="font-bold text-gray-800 mb-3">🌡 Basal Temperature Trend</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsInsights.temperatureTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={["dataMin - 0.2", "dataMax + 0.2"]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="temperature" stroke="#0ea5e9" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-sky-700 mt-2">
                  A slight rise in basal temperature often occurs after ovulation due to progesterone levels.
                </p>
              </section>

              <section className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
                <h4 className="font-bold text-gray-800 mb-3">😊 Mood Tracking</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsInsights.moodTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-purple-700 mt-2">
                  Mood variations can be associated with hormonal changes during different cycle phases.
                </p>
              </section>

              <section className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100">
                <h4 className="font-bold text-gray-800 mb-3">❤️ Fertility Score Trend</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsInsights.fertilityScoreTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#e11d48" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-rose-700 mt-2">
                  Fertility score tends to increase as ovulation approaches.
                </p>
              </section>

              <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-3">Ovulation Prediction History</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsSeries.ovulationPredictionHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="predictedDay" stroke="#14b8a6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100">
                  <h4 className="font-bold text-gray-800 mb-2">Prediction Insight</h4>
                  <p className="text-sm text-gray-700">
                    Based on previous cycle patterns, ovulation typically occurs around Day {fertilityPrediction.ovulationDay}.
                  </p>
                </section>
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-teal-100">
                  <h4 className="font-bold text-gray-800 mb-2">Tracking Consistency</h4>
                  <p className="text-sm text-gray-700">
                    You logged health data on {analyticsInsights.loggedThisMonth} day{analyticsInsights.loggedThisMonth === 1 ? "" : "s"} this month.
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Consistent tracking improves prediction accuracy.</p>
                </section>
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
                  <h4 className="font-bold text-gray-800 mb-2">Health Recommendation</h4>
                  <p className="text-sm text-gray-700">
                    Maintaining regular sleep and balanced nutrition may support hormonal stability.
                  </p>
                </section>
              </div>
            </div>
          )}

          {activeTab === "medical" && (
            <div className="space-y-5">
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-cyan-100">
                <h3 className="text-xl font-bold text-gray-800 mb-2">🩺 Reproductive Health Overview</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Understanding reproductive health helps improve fertility awareness and early detection of potential issues.
                </p>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                  Key factors influencing fertility include hormonal balance, nutrition, lifestyle habits, and regular cycle tracking.
                </p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">🌸 What affects fertility?</h3>
                  <ul className="text-gray-600 space-y-3 text-sm">
                    <li><strong>Hormonal Balance:</strong> Hormones regulate ovulation and menstrual cycles.</li>
                    <li><strong>Age:</strong> Fertility gradually decreases with age.</li>
                    <li><strong>Stress:</strong> High stress levels can disrupt hormonal regulation.</li>
                    <li><strong>Nutrition:</strong> A balanced diet supports reproductive health.</li>
                  </ul>
                </section>

                <section className="bg-white rounded-2xl p-6 shadow-sm border border-violet-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">👩‍⚕️ When to consult a doctor?</h3>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>• Irregular menstrual cycles</li>
                    <li>• Absence of ovulation</li>
                    <li>• Severe pelvic pain</li>
                    <li>• Difficulty conceiving after 12 months</li>
                    <li>• Unusual bleeding patterns</li>
                  </ul>
                </section>
              </div>

              <section className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Common Conditions Affecting Fertility</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Polycystic Ovary Syndrome (PCOS)</li>
                  <li>• Endometriosis</li>
                  <li>• Hormonal imbalance</li>
                  <li>• Thyroid disorders</li>
                </ul>
                <p className="text-sm text-rose-700 mt-3">
                  Early diagnosis and medical consultation can help manage these conditions effectively.
                </p>
              </section>

              <section className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
                <h3 className="text-xl font-bold text-gray-800 mb-3">💡 Preventive Health Tips</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Maintain balanced nutrition</li>
                  <li>• Exercise regularly</li>
                  <li>• Track menstrual cycles</li>
                  <li>• Manage stress levels</li>
                  <li>• Schedule regular health checkups</li>
                </ul>
              </section>

              <section className="bg-white rounded-2xl p-6 shadow-sm border border-indigo-100">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Dynamic Health Pattern Analysis</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  {medicalHealthInsights.messages.map((message) => (
                    <li key={message}>• {message}</li>
                  ))}
                </ul>
              </section>

              <section className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Personalized Medical Alert</h3>
                <p className="text-sm font-semibold text-amber-700">{medicalHealthInsights.alertTitle}</p>
                <p className="text-sm text-gray-700 mt-1">{medicalHealthInsights.alertMessage}</p>
              </section>

              <section className="bg-white rounded-2xl p-6 shadow-sm border border-red-100">
                <h3 className="text-xl font-bold text-gray-800 mb-3">⚠️ Urgent Symptoms</h3>
                <p className="text-sm text-gray-700 mb-2">Seek immediate medical attention if you experience:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Severe abdominal pain</li>
                  <li>• Heavy bleeding</li>
                  <li>• Sudden dizziness</li>
                </ul>
              </section>

              <section className="bg-white rounded-2xl p-6 shadow-sm border border-teal-100">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Need Medical Advice?</h3>
                <p className="text-sm text-gray-700">
                  If you experience irregular cycles, persistent symptoms, or fertility concerns, you can consult a doctor using the telehealth module.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/telehealth")}
                  className="mt-4 inline-flex items-center rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 text-sm font-semibold hover:from-teal-600 hover:to-cyan-600"
                >
                  Book Telehealth Consultation
                </button>
              </section>
            </div>
          )}

          {activeTab === "journal" && (
            <div className="space-y-5">
              <section className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2">😊 Today's Emotional Check-in</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Tracking emotions helps understand hormonal and emotional changes during your cycle.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => updateJournalEntry("mood", "happy")}
                    className={`px-3 py-2 rounded-xl border text-sm font-medium ${
                      journalEntry.mood === "happy" ? "bg-pink-50 border-pink-400 text-pink-700" : "border-gray-200 text-gray-700"
                    }`}
                  >
                    Happy 😊
                  </button>
                  <button
                    type="button"
                    onClick={() => updateJournalEntry("mood", "neutral")}
                    className={`px-3 py-2 rounded-xl border text-sm font-medium ${
                      journalEntry.mood === "neutral" ? "bg-purple-50 border-purple-400 text-purple-700" : "border-gray-200 text-gray-700"
                    }`}
                  >
                    Neutral 😐
                  </button>
                  <button
                    type="button"
                    onClick={() => updateJournalEntry("mood", "low")}
                    className={`px-3 py-2 rounded-xl border text-sm font-medium ${
                      journalEntry.mood === "low" ? "bg-gray-100 border-gray-400 text-gray-700" : "border-gray-200 text-gray-700"
                    }`}
                  >
                    Low 😔
                  </button>
                </div>
              </section>

              <section className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2">🌸 Cycle Context</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
                  <p>Cycle Day: <strong>{fertilityPrediction.cycleDay}</strong></p>
                  <p>Current Phase: <strong>{fertilityPrediction.phase}</strong></p>
                  <p>Ovulation In: <strong>{fertilityPrediction.daysUntilOvulation} day(s)</strong></p>
                </div>
              </section>

              <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📓 Fertility Journal</h3>
                <div className="space-y-3">
                  <input
                    type="date"
                    value={journalEntry.date}
                    onChange={(e) => updateJournalEntry("date", e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl"
                  />
                  <textarea
                    value={journalEntry.content}
                    onChange={(e) => updateJournalEntry("content", e.target.value)}
                    className="w-full h-40 p-3 border border-gray-200 rounded-xl"
                    placeholder="Write your thoughts..."
                  />
                  <button onClick={saveJournalEntry} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-xl font-semibold">
                    Save Entry
                  </button>
                </div>
              </section>

              <section className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2">✨ Reflection Prompts</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• How did you feel physically today?</li>
                  <li>• Did you notice any symptoms today?</li>
                  <li>• What helped you feel better today?</li>
                </ul>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {journalEntries.map((entry) => (
                  <article key={entry.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h4 className="font-semibold text-gray-800">{new Date(entry.date).toLocaleDateString()}</h4>
                    <p className="text-xs text-gray-500 mt-1 capitalize">Mood: {entry?.mood || "Not set"}</p>
                    <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{entry.content}</p>
                  </article>
                ))}
                {!journalEntries.length ? (
                  <article className="bg-white rounded-2xl p-5 shadow-sm border border-dashed border-gray-300 text-gray-500">
                    No journal entries yet.
                  </article>
                ) : null}
              </section>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Mood Trend</h3>
                  <p className="text-sm text-gray-700">Happy -> <strong>{journalMoodSummary.happy}</strong> entries</p>
                  <p className="text-sm text-gray-700">Neutral -> <strong>{journalMoodSummary.neutral}</strong> entries</p>
                  <p className="text-sm text-gray-700">Low -> <strong>{journalMoodSummary.low}</strong> entries</p>
                </section>

                <section className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Journal Streak</h3>
                  <p className="text-sm text-gray-700">
                    You have written journal entries <strong>{journalStreakDays}</strong> day{journalStreakDays === 1 ? "" : "s"} in a row.
                  </p>
                </section>

                <section className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Wellness Insight</h3>
                  <p className="text-sm text-gray-700">{wellnessInsight}</p>
                </section>
              </div>
            </div>
          )}

          {activeTab === "articles" && (
            <div className="space-y-4">
              <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-1">Featured Reads</h3>
                <p className="text-sm text-gray-500">How to Improve Fertility Naturally • Best Foods for Ovulation • Understanding the Fertile Window • Stress and Fertility</p>
              </section>
              <ConceiveArticles />
            </div>
          )}
        </main>
      </div>

      {/* Daily Log Modal */}
      {dailyLogModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Daily Fertility Log</h3>
              <button
                onClick={() => setDailyLogModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={dailyLog.date}
                  onChange={(e) => setDailyLog({...dailyLog, date: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* BBT */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Basal Body Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dailyLog.bbt}
                  onChange={(e) => setDailyLog({...dailyLog, bbt: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="36.5"
                />
              </div>

              {/* Cervical Mucus */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cervical Mucus</label>
                <select
                  value={dailyLog.cervicalMucus}
                  onChange={(e) => setDailyLog({...dailyLog, cervicalMucus: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="none">None</option>
                  <option value="dry">Dry</option>
                  <option value="sticky">Sticky</option>
                  <option value="creamy">Creamy</option>
                  <option value="watery">Watery</option>
                  <option value="egg-white">Egg White</option>
                </select>
              </div>

              {/* Ovulation Test */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ovulation Test</label>
                <select
                  value={dailyLog.ovulationTest}
                  onChange={(e) => setDailyLog({...dailyLog, ovulationTest: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="not-tested">Not Tested</option>
                  <option value="negative">Negative</option>
                  <option value="positive">Positive</option>
                  <option value="peak">Peak</option>
                </select>
              </div>

              {/* Intercourse */}
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={dailyLog.intercourse}
                    onChange={(e) => setDailyLog({...dailyLog, intercourse: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Intercourse</span>
                </label>
                {dailyLog.intercourse && (
                  <select
                    value={dailyLog.intercourseTime}
                    onChange={(e) => setDailyLog({...dailyLog, intercourseTime: e.target.value})}
                    className="p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Time</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                  </select>
                )}
              </div>

              {/* Mood, Energy, Stress */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
                  <select
                    value={dailyLog.mood}
                    onChange={(e) => setDailyLog({...dailyLog, mood: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="happy">😊 Happy</option>
                    <option value="sad">😢 Sad</option>
                    <option value="anxious">😰 Anxious</option>
                    <option value="irritable">😠 Irritable</option>
                    <option value="calm">😌 Calm</option>
                    <option value="energetic">⚡ Energetic</option>
                    <option value="tired">😴 Tired</option>
                    <option value="neutral">😐 Neutral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Energy (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={dailyLog.energy}
                    onChange={(e) => setDailyLog({...dailyLog, energy: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600">{dailyLog.energy}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stress (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={dailyLog.stress}
                    onChange={(e) => setDailyLog({...dailyLog, stress: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600">{dailyLog.stress}</div>
                </div>
              </div>

              {/* Sleep */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sleep Hours</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={dailyLog.sleepHours}
                    onChange={(e) => setDailyLog({...dailyLog, sleepHours: parseInt(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sleep Quality</label>
                  <select
                    value={dailyLog.sleepQuality}
                    onChange={(e) => setDailyLog({...dailyLog, sleepQuality: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="poor">Poor</option>
                    <option value="fair">Fair</option>
                    <option value="good">Good</option>
                    <option value="excellent">Excellent</option>
                  </select>
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms</label>
                <div className="grid grid-cols-2 gap-2">
                  {['cramps', 'bloating', 'headache', 'nausea', 'breast tenderness', 'mood swings', 'fatigue', 'back pain'].map(symptom => (
                    <label key={symptom} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={dailyLog.symptoms.includes(symptom)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDailyLog({...dailyLog, symptoms: [...dailyLog.symptoms, symptom]});
                          } else {
                            setDailyLog({...dailyLog, symptoms: dailyLog.symptoms.filter(s => s !== symptom)});
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 capitalize">{symptom}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={dailyLog.notes}
                  onChange={(e) => setDailyLog({...dailyLog, notes: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg h-20"
                  placeholder="Any additional notes about today..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setDailyLogModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveDailyLog}
                disabled={loading}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Log"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Modal */}
      {aiAnalysisModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">AI Fertility Analysis</h3>
              <button
                onClick={() => setAiAnalysisModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                {aiAnalysis}
              </pre>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setAiAnalysisModalOpen(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Journal Entry Modal */}
      {journalModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" style={{ paddingTop: '80px' }}>
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-[90%] mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">New Journal Entry</h3>
              <button
                onClick={() => setJournalModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={journalEntry.date}
                  onChange={(e) => updateJournalEntry('date', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Mood */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Mood</label>
                <div className="grid grid-cols-4 gap-2">
                  {moodOptions.slice(0, 4).map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => updateJournalEntry('mood', mood.value)}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                        journalEntry.mood === mood.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{mood.emoji}</div>
                      <div className="text-xs font-medium">{mood.label}</div>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {moodOptions.slice(4, 8).map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => updateJournalEntry('mood', mood.value)}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                        journalEntry.mood === mood.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{mood.emoji}</div>
                      <div className="text-xs font-medium">{mood.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Journal Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Journal Entry</label>
                <textarea
                  value={journalEntry.content}
                  onChange={(e) => updateJournalEntry('content', e.target.value)}
                  placeholder="Write about your fertility journey, feelings, symptoms, or any observations..."
                  rows="8"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Privacy Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={journalEntry.isPrivate}
                  onChange={(e) => updateJournalEntry('isPrivate', e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="isPrivate" className="text-sm font-medium text-gray-700">
                  Keep this entry private
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setJournalModalOpen(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={saveJournalEntry}
                className="flex-1 bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300"
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pregnancy Transition Modal */}
      {pregnancyTransitionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-xl">
            <div className="text-center">
              <div className="text-6xl mb-4">🤰</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Congratulations! Ready to transition to Pregnancy Mode?
              </h3>
              <p className="text-gray-600 mb-6">
                This will help you track your pregnancy journey with specialized tools and insights.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setPregnancyTransitionModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-semibold transition-all duration-300"
                >
                  Stay in Conceive Mode
                </button>
                <button
                  onClick={confirmPregnancyTransition}
                  className="flex-1 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300"
                >
                  Transition to Pregnancy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}