import React, { useMemo, useState, useEffect } from "react";
import ExerciseRecommendation from "../../components/ExerciseRecommendation";
import { FaCalendarAlt, FaCheck, FaBell, FaClock, FaDumbbell, FaCalendar, FaComments, FaFire, FaBolt } from "react-icons/fa";
import { phaseExercises } from "../../data/phaseExercises";
import "./periodTracker.css";

export default function ExerciseRecommendations() {
  const [activeTab, setActiveTab] = useState("adaptive-dashboard");
  const [currentPhase, setCurrentPhase] = useState("menstrual");
  const [cycleDay, setCycleDay] = useState(1);
  const [avgCycleLength, setAvgCycleLength] = useState(28);
  const [lastPeriodDate, setLastPeriodDate] = useState(null);
  const [daysSinceLastPeriod, setDaysSinceLastPeriod] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [exerciseLog, setExerciseLog] = useState({});
  const [reminderSettings, setReminderSettings] = useState({
    enabled: true,
    time: "09:00",
    days: ["monday", "wednesday", "friday"]
  });
  const [userInputs, setUserInputs] = useState({
    energyLevel: "medium",
    cramps: "none",
    sleepHours: "7",
    mood: "good"
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [aiRecommendationForm, setAiRecommendationForm] = useState({
    periodStartDate: "",
    periodLength: "5",
    energyLevel: "medium",
    cramps: "none",
    sleepHours: "7",
    mood: "good",
    fitnessLevel: "beginner"
  });
  const [aiGeneratedExercises, setAiGeneratedExercises] = useState([]);

  const phaseOrder = ["menstrual", "follicular", "ovulation", "luteal"];
  const energyScoreMap = {
    low: 25,
    "medium to low": 45,
    "light to moderate": 50,
    moderate: 60,
    "medium to high": 75,
    high: 85,
    peak: 100,
    "very light": 20,
  };

  const getPhaseByCycleDay = (day, cycleLength) => {
    const normalizedDay = ((Number(day) - 1) % Number(cycleLength || 28)) + 1;
    const ovulationDay = Math.max(12, Math.min(16, Math.round(Number(cycleLength || 28) / 2)));
    if (normalizedDay <= 5) return "menstrual";
    if (normalizedDay < ovulationDay) return "follicular";
    if (normalizedDay === ovulationDay) return "ovulation";
    return "luteal";
  };

  const phaseWorkoutPlans = useMemo(() => {
    const phaseLabelMap = {
      menstrual: "Menstrual",
      follicular: "Follicular",
      ovulation: "Ovulation",
      luteal: "Luteal",
    };
    return Object.entries(phaseExercises).reduce((acc, [phaseKey, details]) => {
      acc[phaseKey] = {
        title: `${phaseLabelMap[phaseKey] || "Cycle"} Phase`,
        subtitle: `${details.energy} energy | ${details.intensity} intensity`,
        exercises: (details.exerciseCards || []).map((item) => ({
          name: item.title,
          intensity: item.difficulty,
          duration: item.duration,
          equipment: "Bodyweight / Optional Equipment",
        })),
      };
      return acc;
    }, {});
  }, []);

  const workoutVideos = useMemo(() => {
    return Object.entries(phaseExercises).reduce((acc, [phaseKey, details]) => {
      acc[phaseKey] = (details.videos || []).map((video) => ({
        title: video.title,
        embedUrl: video.url,
        duration: video.duration,
      }));
      return acc;
    }, {});
  }, []);

  // Fetch accurate cycle data from backend
  useEffect(() => {
    const loadCycleData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        // Get current phase from backend API
        const phaseRes = await fetch("/api/periods/current-phase", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const phaseData = await phaseRes.json();
        
        if (phaseData.phase) {
          setCurrentPhase(phaseData.phase);
          setDaysSinceLastPeriod(phaseData.daysSinceLastPeriod || 0);
          setCycleDay((phaseData.daysSinceLastPeriod || 0) + 1);
          setAvgCycleLength(phaseData.avgCycleLength || 28);
          if (phaseData.lastPeriodStart) {
            setLastPeriodDate(phaseData.lastPeriodStart);
          }
        }

        // Get cycle history for additional data
        const historyRes = await fetch("/api/periods/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const historyData = await historyRes.json();
        
        if (historyData.cycles && historyData.cycles.length > 0) {
          const lastCycle = historyData.cycles[0];
          if (lastCycle.startDate) {
            setLastPeriodDate(lastCycle.startDate);
          }
        }
      } catch (err) {
        console.error("Failed to load cycle data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCycleData();

    // Load completed exercises
    const saved = localStorage.getItem("completedExercises");
    if (saved) {
      setCompletedExercises(JSON.parse(saved));
    }
    const savedExerciseLog = localStorage.getItem("exerciseLog");
    if (savedExerciseLog) {
      setExerciseLog(JSON.parse(savedExerciseLog));
    }

    // Load reminder settings
    const reminders = localStorage.getItem("exerciseReminders");
    if (reminders) {
      setReminderSettings(JSON.parse(reminders));
    }

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Load chat history when AI Coach tab is active
  useEffect(() => {
    if (activeTab === "ai-coach") {
      loadChatHistory();
    }
  }, [activeTab]);

  useEffect(() => {
    // Legacy tab id fallback: "Exercise Cards" tab removed.
    if (activeTab === "exercise-cards") {
      setActiveTab("adaptive-dashboard");
    }
  }, [activeTab]);

  const loadChatHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Set default welcome message if not authenticated
        setChatMessages([{
          role: 'assistant',
          content: `Hi! I see you're in your ${getPhaseName(currentPhase).toLowerCase()} phase. How can I help you with your exercise routine today?`,
          timestamp: new Date()
        }]);
        return;
      }

      const response = await fetch("/api/exercise/chat", {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.messages && data.messages.length > 0) {
        setChatMessages(data.messages);
      } else {
        // Initialize with welcome message if no history
        setChatMessages([{
          role: 'assistant',
          content: `Hi! I see you're in your ${getPhaseName(currentPhase).toLowerCase()} phase. How can I help you with your exercise routine today?`,
          timestamp: new Date()
        }]);
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
      // Set default welcome message on error
      setChatMessages([{
        role: 'assistant',
        content: `Hi! I see you're in your ${getPhaseName(currentPhase).toLowerCase()} phase. How can I help you with your exercise routine today?`,
        timestamp: new Date()
      }]);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const messageToSend = chatInput;
    setChatInput("");
    setChatLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated. Please log in.");
      }

      const response = await fetch("/api/exercise/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageToSend,
          currentPhase: currentPhase
        }),
      });

      // Check if response is ok
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}: ${response.statusText}` }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError);
        throw new Error("Invalid response from server");
      }
      
      // Check if we have a response field (even if success is false, we might have a response)
      if (data.response) {
        const assistantMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, assistantMessage]);
      } else if (data.success && data.response) {
        // Fallback for success case
        const assistantMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.message || "Failed to get response");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      const errorMessage = {
        role: 'assistant',
        content: err.message || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  const refreshPhase = async () => {
    try {
      const token = localStorage.getItem("token");
      const phaseRes = await fetch("/api/periods/current-phase", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const phaseData = await phaseRes.json();
      
      if (phaseData.phase) {
        setCurrentPhase(phaseData.phase);
        setDaysSinceLastPeriod(phaseData.daysSinceLastPeriod || 0);
        setCycleDay((phaseData.daysSinceLastPeriod || 0) + 1);
        setAvgCycleLength(phaseData.avgCycleLength || 28);
        if (phaseData.lastPeriodStart) {
          setLastPeriodDate(phaseData.lastPeriodStart);
        }
      }
    } catch (err) {
      console.error("Failed to refresh phase:", err);
    }
  };

  const markExerciseComplete = (exerciseName, category) => {
    const today = new Date().toISOString().split('T')[0];
    const logEntry = {
      date: today,
      exercise: exerciseName,
      category: category,
      phase: currentPhase,
      completedAt: new Date().toISOString()
    };

    setExerciseLog(prev => {
      const nextLog = {
        ...prev,
        [today]: [...(prev[today] || []), logEntry]
      };
      localStorage.setItem("exerciseLog", JSON.stringify(nextLog));
      return nextLog;
    });

    setCompletedExercises(prev => {
      const nextCompleted = [...prev, exerciseName];
      localStorage.setItem("completedExercises", JSON.stringify(nextCompleted));
      return nextCompleted;
    });
  };

  const saveReminderSettings = () => {
    localStorage.setItem("exerciseReminders", JSON.stringify(reminderSettings));
    alert("Reminder settings saved!");
  };

  const showReminderNotification = () => {
    const phaseMessages = {
      menstrual: "Try light yoga today to ease cramps and promote relaxation! 🌸",
      follicular: "Energy is high - time for strength training or cardio! 💪",
      ovulation: "Peak energy! Try a HIIT workout or dance cardio! 🔥",
      luteal: "Focus on restorative yoga or gentle cardio to manage PMS symptoms. 🧘‍♀️"
    };

    const message = phaseMessages[currentPhase] || "Time for your daily exercise routine! 🏃‍♀️";

    if (Notification.permission === 'granted') {
      new Notification('Exercise Reminder', {
        body: message,
        icon: '/favicon.ico'
      });
    } else {
      alert(`Exercise Reminder: ${message}`);
    }
  };

  const getPhaseColor = (phase) => {
    const colors = {
      'menstrual': '#e91e63',
      'follicular': '#4caf50',
      'ovulation': '#ff9800',
      'luteal': '#9c27b0'
    };
    return colors[phase] || '#9e9e9e';
  };

  const getPhaseName = (phase) => {
    const names = {
      'menstrual': 'Menstrual',
      'follicular': 'Follicular',
      'ovulation': 'Ovulation',
      'luteal': 'Luteal'
    };
    return names[phase] || 'Unknown';
  };

  const tabs = [
    { id: "adaptive-dashboard", label: "Adaptive Dashboard", icon: <FaBolt /> },
    { id: "workout-plans", label: "Workout Plans", icon: <FaCalendar /> },
    { id: "videos", label: "Videos", icon: <FaBolt /> },
    { id: "ai-coach", label: "AI Coach", icon: <FaComments /> },
    { id: "ai-powered-recommendation", label: "AI-Powered Recommendation", icon: <FaFire /> },
    { id: "progress-streaks", label: "Progress & Streaks", icon: <FaCheck /> },
    { id: "reminders", label: "Reminders", icon: <FaBell /> }
  ];

  const selectedPhasePlan = phaseWorkoutPlans[currentPhase] || phaseWorkoutPlans.follicular;
  const selectedPhaseVideos = workoutVideos[currentPhase] || workoutVideos.follicular;
  const selectedPhaseData = phaseExercises[currentPhase] || phaseExercises.follicular;

  const weeklyProgress = useMemo(() => {
    const today = new Date();
    const dayIndex = (today.getDay() + 6) % 7; // Monday as start
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayIndex);

    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return labels.map((label, index) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + index);
      const key = d.toISOString().split("T")[0];
      const completed = Boolean(exerciseLog[key]?.length);
      return { label, key, completed };
    });
  }, [exerciseLog]);

  const weeklyCompletion = useMemo(() => {
    const completedDays = weeklyProgress.filter((day) => day.completed).length;
    return {
      completedDays,
      percentage: Math.round((completedDays / 7) * 100),
    };
  }, [weeklyProgress]);

  const cycleAdaptivePlan = useMemo(() => {
    return Array.from({ length: 3 }, (_, offset) => {
      const planDay = cycleDay + offset;
      const phaseKey = getPhaseByCycleDay(planDay, avgCycleLength);
      const phaseInfo = phaseExercises[phaseKey] || phaseExercises.follicular;
      return {
        day: planDay,
        phase: phaseKey,
        workout: phaseInfo.recommended?.[0] || "Light Mobility Session",
      };
    });
  }, [cycleDay, avgCycleLength]);

  const aiCoachMessage = useMemo(() => {
    const phaseName = getPhaseName(currentPhase);
    const recommended = selectedPhaseData.recommended?.slice(0, 2).join(" or ");
    return `Based on your ${phaseName} phase your energy is ${selectedPhaseData.energy.toLowerCase()}. Try a ${selectedPhaseData.intensity.toLowerCase()} session like ${recommended} today.`;
  }, [currentPhase, selectedPhaseData]);

  const personalizedExercises = useMemo(() => {
    let items = [...selectedPhasePlan.exercises];
    if (userInputs.energyLevel === "low" || userInputs.cramps === "moderate" || userInputs.cramps === "high") {
      items = items.filter((item) => item.intensity !== "High");
    }
    if (Number(userInputs.sleepHours) < 6) {
      items = items.filter((item) => item.duration !== "40 min");
    }
    if (userInputs.mood === "low") {
      items = items.map((item) => ({
        ...item,
        intensity: item.intensity === "High" ? "Moderate" : item.intensity
      }));
    }
    return items;
  }, [selectedPhasePlan.exercises, userInputs]);

  const streakCount = useMemo(() => {
    const days = Object.keys(exerciseLog).sort();
    if (!days.length) return 0;
    let streak = 0;
    const cursor = new Date();
    for (let i = 0; i < 14; i += 1) {
      const key = cursor.toISOString().split("T")[0];
      if (exerciseLog[key]?.length) streak += 1;
      else if (i > 0) break;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }, [exerciseLog]);

  const earnedBadges = useMemo(() => {
    const badges = [];
    if (completedExercises.length >= 5) badges.push("Consistency Starter");
    if (completedExercises.length >= 15) badges.push("Phase Athlete");
    if (streakCount >= 3) badges.push("3-Day Streak");
    if (streakCount >= 7) badges.push("Weekly Warrior");
    return badges;
  }, [completedExercises.length, streakCount]);

  const EXERCISE_VIDEO_LIBRARY = {
    "Light Yoga Flow": "https://www.youtube.com/embed/hJbRpHZr_d0?rel=0",
    "Gentle Stretch Routine": "https://www.youtube.com/embed/SEfs5TJZ6Nk?rel=0",
    "Comfort Walk": "https://www.youtube.com/embed/ml6cT4AZdqI?rel=0",
    "Breathing Practice": "https://www.youtube.com/embed/SEfs5TJZ6Nk?rel=0",
    "Cardio Intervals": "https://www.youtube.com/embed/ml6cT4AZdqI?rel=0",
    "Jogging Session": "https://www.youtube.com/embed/UBMk30rjy0o?rel=0",
    "Strength Circuit": "https://www.youtube.com/embed/U0bhE67HuDY?rel=0",
    "Dance Workout": "https://www.youtube.com/embed/cZnsLVArIt8?rel=0",
    "HIIT Session": "https://www.youtube.com/embed/cZnsLVArIt8?rel=0",
    "Power Run": "https://www.youtube.com/embed/UBMk30rjy0o?rel=0",
    "Cycling Sprint Set": "https://www.youtube.com/embed/UBMk30rjy0o?rel=0",
    "Strength Training": "https://www.youtube.com/embed/U0bhE67HuDY?rel=0",
    "Pilates Core Flow": "https://www.youtube.com/embed/lCg_gh_fppI?rel=0",
    "Calm Yoga Session": "https://www.youtube.com/embed/4C-gxOE0j7s?rel=0",
    "Swimming Laps": "https://www.youtube.com/embed/UBMk30rjy0o?rel=0",
    "Light Strength Work": "https://www.youtube.com/embed/U0bhE67HuDY?rel=0"
  };

  const getAiRecommendationSet = () => {
    const phaseBase = phaseWorkoutPlans[currentPhase]?.exercises || [];
    let recommendations = [...phaseBase];

    if (aiRecommendationForm.energyLevel === "low" || ["moderate", "high"].includes(aiRecommendationForm.cramps)) {
      recommendations = recommendations.filter((item) => item.intensity !== "High");
    }

    if (Number(aiRecommendationForm.sleepHours) < 6) {
      recommendations = recommendations.filter((item) => item.duration !== "40 min");
    }

    if (aiRecommendationForm.mood === "low") {
      recommendations = recommendations.map((item) => ({
        ...item,
        intensity: item.intensity === "High" ? "Moderate" : item.intensity
      }));
    }

    if (aiRecommendationForm.fitnessLevel === "beginner") {
      recommendations = recommendations.map((item) => ({
        ...item,
        duration: item.duration === "35 min" || item.duration === "40 min" ? "20 min" : item.duration
      }));
    }

    if (aiRecommendationForm.fitnessLevel === "advanced") {
      recommendations = recommendations.map((item) => ({
        ...item,
        duration: item.duration === "20 min" ? "30 min" : item.duration
      }));
    }

    if (Number(aiRecommendationForm.periodLength) >= 7) {
      recommendations = recommendations.map((item) => ({
        ...item,
        intensity: item.intensity === "High" ? "Moderate" : item.intensity
      }));
    }

    return recommendations.slice(0, 4);
  };

  const handleGenerateAiRecommendation = () => {
    const generated = getAiRecommendationSet();
    setAiGeneratedExercises(generated);
  };

  if (loading) {
    return (
      <div className="exercise-recommendations-loading">
        <div className="loading-spinner"></div>
        <p>Loading your exercise recommendations...</p>
      </div>
    );
  }

  return (
    <section className="exercise-recommendations-redesign enhanced-layout">
      {/* Phase Header with Accurate Data */}
      <section className="phase-header-redesign" style={{ background: `linear-gradient(135deg, ${getPhaseColor(currentPhase)}15 0%, ${getPhaseColor(currentPhase)}25 100%)` }}>
        <div className="phase-info-redesign">
          <div className="phase-icon-wrapper" style={{ backgroundColor: getPhaseColor(currentPhase) }}>
            <FaCalendarAlt />
          </div>
          <div className="phase-details">
            <h3 style={{ color: getPhaseColor(currentPhase) }}>
              {getPhaseName(currentPhase)} Phase
            </h3>
            <p className="phase-subtitle">Day {cycleDay} of your {avgCycleLength}-day cycle</p>
            <div className="phase-meta">
              <span>📅 Cycle Day: <strong>{cycleDay}</strong> / {avgCycleLength}</span>
              {lastPeriodDate && (
                <span>🩸 Last Period: <strong>{new Date(lastPeriodDate).toLocaleDateString()}</strong></span>
              )}
              <button onClick={refreshPhase} className="refresh-btn">
                🔄 Refresh Phase
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="exercise-tabs-container">
        <div className="exercise-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`exercise-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <section className="exercise-tab-content">
        {activeTab === "adaptive-dashboard" && (
          <div className="tab-panel">
            <h3>Cycle-Adaptive Fitness Dashboard</h3>
            <p>
              Your workouts are automatically adjusted for the {getPhaseName(currentPhase).toLowerCase()} phase.
            </p>

            <section className="phase-fitness-dashboard">
              <div className="phase-fitness-stat">
                <span>Current Phase</span>
                <strong>{getPhaseName(currentPhase)}</strong>
              </div>
              <div className="phase-fitness-stat">
                <span>Energy Level</span>
                <strong>{selectedPhaseData.energy}</strong>
              </div>
              <div className="phase-fitness-stat">
                <span>Recommended Intensity</span>
                <strong>{selectedPhaseData.intensity}</strong>
              </div>
            </section>

            <section className="phase-energy-rail">
              {phaseOrder.map((phaseKey) => {
                const phaseData = phaseExercises[phaseKey];
                const scoreKey = String(phaseData.energy || phaseData.intensity || "").toLowerCase();
                const score = energyScoreMap[scoreKey] || 55;
                const active = currentPhase === phaseKey;
                return (
                  <article key={phaseKey} className={`energy-node ${active ? "active" : ""}`}>
                    <header>
                      <h4>{getPhaseName(phaseKey)}</h4>
                      <span>{score}%</span>
                    </header>
                    <div className="energy-track">
                      <div className="energy-fill" style={{ width: `${score}%` }} />
                    </div>
                    <p>{phaseData.intensity}</p>
                  </article>
                );
              })}
            </section>

            <section className="adaptive-two-col">
              <div className="adaptive-card">
                <h4>Recommended Workouts</h4>
                <ul>
                  {(selectedPhaseData.recommended || []).map((item) => (
                    <li key={item}>✅ {item}</li>
                  ))}
                </ul>
              </div>
              <div className="adaptive-card caution">
                <h4>Workouts to Avoid</h4>
                <ul>
                  {(selectedPhaseData.avoid || []).map((item) => (
                    <li key={item}>⚠️ {item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h4>Recommended Workout Videos</h4>
              <div className="video-workouts-grid">
                {(selectedPhaseData.videos || []).map((video) => (
                  <div className="video-workout-card" key={video.title}>
                    <h4>{video.title}</h4>
                    <p><FaClock /> {video.duration}</p>
                    <div className="video-embed-wrap">
                      <iframe
                        src={video.url}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h4>Guided Audio Workouts</h4>
              <div className="phase-audio-grid">
                {(selectedPhaseData.audios || []).map((audio) => (
                  <article className="phase-audio-card" key={audio.title}>
                    <h5>{audio.title}</h5>
                    <p>{audio.description}</p>
                    <audio controls preload="metadata">
                      <source src={audio.file} type="audio/mpeg" />
                    </audio>
                    <a href={audio.file} target="_blank" rel="noreferrer">
                      Open audio in new tab
                    </a>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <h4>Exercise Cards</h4>
              <div className="phase-exercise-card-grid">
                {(selectedPhaseData.exerciseCards || []).map((exercise) => (
                  <article className="phase-exercise-card" key={exercise.title}>
                    <h5>{exercise.title}</h5>
                    <div className="exercise-cues">
                      <span><FaClock /> {exercise.duration}</span>
                      <span><FaFire /> {exercise.difficulty}</span>
                      <span><FaBolt /> {exercise.calories}</span>
                    </div>
                    <ol>
                      {(exercise.steps || []).map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                    <button type="button" onClick={() => markExerciseComplete(exercise.title, getPhaseName(currentPhase))}>
                      Start Workout
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className="adaptive-card">
              <h4>AI Fitness Coach</h4>
              <p>{aiCoachMessage}</p>
              <div className="coach-questions">
                <button type="button" onClick={() => setChatInput("What workout is best for this phase?")}>
                  What workout is best for this phase?
                </button>
                <button type="button" onClick={() => setChatInput("How intense should my workout be today?")}>
                  How intense should my workout be today?
                </button>
              </div>
              <small>Tip: Open AI Coach tab to send these questions directly.</small>
            </section>

            <section className="adaptive-two-col">
              <div className="adaptive-card">
                <h4>Workout Progress Tracking</h4>
                <div className="weekly-progress-row">
                  {weeklyProgress.map((day) => (
                    <span key={day.key} className={`week-pill ${day.completed ? "done" : "missed"}`}>
                      {day.label} {day.completed ? "✔" : "✘"}
                    </span>
                  ))}
                </div>
                <p><strong>Weekly completion:</strong> {weeklyCompletion.completedDays}/7 days ({weeklyCompletion.percentage}%)</p>
                <p><strong>Current Streak:</strong> {streakCount} day{streakCount === 1 ? "" : "s"}</p>
              </div>
              <div className="adaptive-card">
                <h4>Cycle Adaptive Workout Planner</h4>
                <ul className="planner-list">
                  {cycleAdaptivePlan.map((entry) => (
                    <li key={`${entry.day}-${entry.phase}`}>
                      Day {entry.day} ({getPhaseName(entry.phase)}) → {entry.workout}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        )}

        {activeTab === "workout-plans" && (
          <div className="tab-panel">
            <h3>📅 Workout Plans</h3>
            <p>Structured workout plans tailored to your cycle phase.</p>
            <div className="personalization-panel">
              <h4>Personalize Recommendations</h4>
              <div className="personalization-grid">
                <label>
                  Energy Level
                  <select value={userInputs.energyLevel} onChange={(e) => setUserInputs(prev => ({ ...prev, energyLevel: e.target.value }))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label>
                  Cramps
                  <select value={userInputs.cramps} onChange={(e) => setUserInputs(prev => ({ ...prev, cramps: e.target.value }))}>
                    <option value="none">None</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label>
                  Sleep (hours)
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={userInputs.sleepHours}
                    onChange={(e) => setUserInputs(prev => ({ ...prev, sleepHours: e.target.value }))}
                  />
                </label>
                <label>
                  Mood
                  <select value={userInputs.mood} onChange={(e) => setUserInputs(prev => ({ ...prev, mood: e.target.value }))}>
                    <option value="low">Low</option>
                    <option value="good">Good</option>
                    <option value="great">Great</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="phase-plans-grid">
              {Object.entries(phaseWorkoutPlans).map(([phaseKey, phasePlan]) => (
                <div key={phaseKey} className={`phase-plan-card ${phaseKey === currentPhase ? "active" : ""}`}>
                  <h4>{phasePlan.title}</h4>
                  <p>{phasePlan.subtitle}</p>
                  <ul>
                    {phasePlan.exercises.map((item) => (
                      <li key={`${phaseKey}-${item.name}`}>
                        <strong>{item.name}</strong>
                        <div className="exercise-cues">
                          <span><FaFire /> {item.intensity}</span>
                          <span><FaClock /> {item.duration}</span>
                          <span><FaDumbbell /> {item.equipment}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="workout-plans-grid">
              <div className="workout-plan-card personalized">
                <h4>{selectedPhasePlan.title} - Personalized Set</h4>
                <p>Adjusted for your current energy, cramps, sleep, and mood.</p>
                <ul>
                  {personalizedExercises.map((item) => (
                    <li key={`personalized-${item.name}`}>
                      <span>{item.name} ({item.duration})</span>
                      <button type="button" onClick={() => markExerciseComplete(item.name, selectedPhasePlan.title)}>
                        <FaCheck /> Mark Complete
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "videos" && (
          <div className="tab-panel">
            <h3>🎬 Workout Videos</h3>
            <p>Embedded guided sessions for your {getPhaseName(currentPhase).toLowerCase()} phase.</p>
            <div className="video-workouts-grid">
              {selectedPhaseVideos.map((video) => (
                <div className="video-workout-card" key={video.title}>
                  <h4>{video.title}</h4>
                  <p><FaClock /> {video.duration}</p>
                  <div className="video-embed-wrap">
                    <iframe
                      src={video.embedUrl}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ))}
              <div className="video-workout-card">
                <h4>Phase-Fit Mobility Routine</h4>
                <p><FaClock /> 15 min</p>
                <div className="video-embed-wrap">
                  <video controls preload="metadata">
                    <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ai-powered-recommendation" && (
          <div className="tab-panel">
            <h3>🤖 AI-Powered Recommendation</h3>
            <p>
              Personalized exercise suggestions generated from your cycle phase and current wellness inputs.
            </p>

            <div className="personalization-panel">
              <h4>Personalize Recommendations</h4>
              <div className="personalization-grid">
                <label>
                  Period Start Date
                  <input
                    type="date"
                    value={aiRecommendationForm.periodStartDate}
                    onChange={(e) => setAiRecommendationForm((prev) => ({ ...prev, periodStartDate: e.target.value }))}
                  />
                </label>
                <label>
                  Period Length (days)
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={aiRecommendationForm.periodLength}
                    onChange={(e) => setAiRecommendationForm((prev) => ({ ...prev, periodLength: e.target.value }))}
                  />
                </label>
                <label>
                  Energy Level
                  <select value={aiRecommendationForm.energyLevel} onChange={(e) => setAiRecommendationForm((prev) => ({ ...prev, energyLevel: e.target.value }))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label>
                  Cramps
                  <select value={aiRecommendationForm.cramps} onChange={(e) => setAiRecommendationForm((prev) => ({ ...prev, cramps: e.target.value }))}>
                    <option value="none">None</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label>
                  Sleep (hours)
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={aiRecommendationForm.sleepHours}
                    onChange={(e) => setAiRecommendationForm((prev) => ({ ...prev, sleepHours: e.target.value }))}
                  />
                </label>
                <label>
                  Mood
                  <select value={aiRecommendationForm.mood} onChange={(e) => setAiRecommendationForm((prev) => ({ ...prev, mood: e.target.value }))}>
                    <option value="low">Low</option>
                    <option value="good">Good</option>
                    <option value="great">Great</option>
                  </select>
                </label>
                <label>
                  Fitness Level
                  <select value={aiRecommendationForm.fitnessLevel} onChange={(e) => setAiRecommendationForm((prev) => ({ ...prev, fitnessLevel: e.target.value }))}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </label>
              </div>
              <button type="button" className="ai-generate-btn" onClick={handleGenerateAiRecommendation}>
                Get Exercise Recommendation
              </button>
            </div>

            <div className="phase-plans-grid">
              {(aiGeneratedExercises.length ? aiGeneratedExercises : personalizedExercises).map((item) => (
                <div key={`ai-rec-${item.name}`} className="phase-plan-card active">
                  <h4>{item.name}</h4>
                  <p>Optimized for your {getPhaseName(currentPhase).toLowerCase()} phase profile</p>
                  <div className="exercise-cues">
                    <span><FaFire /> {item.intensity}</span>
                    <span><FaClock /> {item.duration}</span>
                    <span><FaDumbbell /> {item.equipment}</span>
                  </div>
                  <div className="video-embed-wrap" style={{ marginTop: "12px" }}>
                    <iframe
                      src={EXERCISE_VIDEO_LIBRARY[item.name] || selectedPhaseVideos[0]?.embedUrl}
                      title={`${item.name} workout`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <button type="button" onClick={() => markExerciseComplete(item.name, "AI Recommendation")}>
                    <FaCheck /> Mark Complete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "ai-coach" && (
          <div className="tab-panel">
            <h3>💬 AI Coach</h3>
            <p>Chat with your AI fitness coach about exercises for your current phase.</p>
            <div className="ai-coach-chat">
              <div className="chat-messages" id="chat-messages-container">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.role === 'user' ? 'user' : 'bot'}`}>
                    <div className="message-content">
                      <p>{msg.content}</p>
                      <span className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="chat-message bot">
                    <div className="message-content">
                      <p className="typing-indicator">AI is typing...</p>
                    </div>
                  </div>
                )}
                <div ref={(el) => {
                  if (el) {
                    setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
                  }
                }} />
              </div>
              <div className="chat-input-container">
                <input 
                  type="text" 
                  placeholder="Ask me about exercises..." 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleChatKeyPress}
                  disabled={chatLoading}
                />
                <button 
                  onClick={sendChatMessage}
                  disabled={chatLoading || !chatInput.trim()}
                >
                  {chatLoading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "progress-streaks" && (
          <div className="tab-panel">
            <h3>📈 Progress & Streaks</h3>
            <p>Track your consistency and celebrate milestones.</p>
            <section className="progress-overview-section">
              <div className="progress-kpi">
                <h4><FaFire /> Current Streak</h4>
                <strong>{streakCount} day{streakCount === 1 ? "" : "s"}</strong>
              </div>
              <div className="progress-kpi">
                <h4><FaCheck /> Completed</h4>
                <strong>{completedExercises.length}</strong>
              </div>
              <div className="progress-kpi">
                <h4><FaBolt /> Motivation Badges</h4>
                <div className="badge-row">
                  {earnedBadges.length ? earnedBadges.map((badge) => (
                    <span key={badge} className="motivation-badge">{badge}</span>
                  )) : <span className="motivation-badge muted">Start your first workout</span>}
                </div>
              </div>
            </section>

            <section className="exercise-log-section">
              <h4><FaCheck /> Recent Exercise Log</h4>
              <div className="log-entries">
                {Object.entries(exerciseLog).slice(-7).reverse().map(([date, entries]) => (
                  <div key={date} className="log-day">
                    <h5>{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h5>
                    {entries.map((entry, i) => (
                      <div key={i} className="log-entry">
                        <span className="exercise-name">{entry.exercise}</span>
                        <span className="exercise-category">{entry.category}</span>
                        <span className="exercise-time">{new Date(entry.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ))}
                  </div>
                ))}
                {Object.keys(exerciseLog).length === 0 && (
                  <p className="no-log">No exercises logged yet. Complete some exercises to see your progress!</p>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === "reminders" && (
          <div className="tab-panel">
            <h3>🔔 Reminders</h3>
            <p>Set your preferred schedule and stay consistent with your workouts.</p>
            <section className="reminder-settings-section">
              <h4><FaBell /> Exercise Reminders</h4>
              <div className="reminder-form">
                <div className="reminder-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={reminderSettings.enabled}
                      onChange={(e) => setReminderSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                    />
                    Enable exercise reminders
                  </label>
                </div>

                <div className="reminder-time">
                  <label>Reminder time:</label>
                  <input
                    type="time"
                    value={reminderSettings.time}
                    onChange={(e) => setReminderSettings(prev => ({ ...prev, time: e.target.value }))}
                    disabled={!reminderSettings.enabled}
                  />
                </div>

                <div className="reminder-days">
                  <label>Days to remind:</label>
                  <div className="days-checkboxes">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                      <label key={day}>
                        <input
                          type="checkbox"
                          checked={reminderSettings.days.includes(day)}
                          onChange={(e) => {
                            const newDays = reminderSettings.days.includes(day)
                              ? reminderSettings.days.filter(d => d !== day)
                              : [...reminderSettings.days, day];
                            setReminderSettings(prev => ({ ...prev, days: newDays }));
                          }}
                          disabled={!reminderSettings.enabled}
                        />
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="reminder-actions">
                  <button onClick={saveReminderSettings} disabled={!reminderSettings.enabled}>
                    Save Settings
                  </button>
                  <button onClick={showReminderNotification}>
                    Test Reminder
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </section>
    </section>
  );
}
