import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserHeader from "../../components/UserHeader";
import api from "../../services/api";
import "./PregnancyModeDashboard.css";

// Import all pregnancy components
import PregnancyDashboard from "./PregnancyDashboard";
import BabyDevelopmentTracker from "./BabyDevelopmentTracker";
import PregnancyHealthLog from "./PregnancyHealthLog";
import AppointmentMedicationTracker from "./AppointmentMedicationTracker";
import NutritionWellnessTips from "./NutritionWellnessTips";
import PregnancyExercises from "./PregnancyExercises";
import PregnancyEmotionalSupport from "./PregnancyEmotionalSupport";
import PregnancyAIAssistant from "./PregnancyAIAssistant";
import PregnancyCommunity from "./PregnancyCommunity";
import BabyNameSuggestion from "./BabyNameSuggestion";
import PregnancyResourceHub from "./PregnancyResourceHub";
import PregnancyAIHealthInsights from "./PregnancyAIHealthInsights";
import CarePlanPage from "../pregnancy/CarePlanPage";
import { pregnancyWeeks } from "../../data/pregnancyWeeks";
import PregnancyRiskCard from "../../components/pregnancy/PregnancyRiskCard";

const resolveFruitImageKey = (fruitName = "") => {
  const fruit = String(fruitName).toLowerCase();
  if (fruit.includes("poppy")) return "poppy-seed";
  if (fruit.includes("blueberry")) return "blueberry";
  if (fruit.includes("lime")) return "lime";
  if (fruit.includes("avocado")) return "avocado";
  if (fruit.includes("banana")) return "banana";
  if (fruit.includes("corn")) return "corn";
  if (fruit.includes("eggplant")) return "eggplant";
  if (fruit.includes("papaya")) return "papaya";
  if (fruit.includes("watermelon")) return "watermelon";
  return "squash";
};

const toAverageNumber = (text = "") => {
  const matches = String(text).match(/(\d+(\.\d+)?)/g);
  if (!matches || !matches.length) return null;
  if (matches.length >= 2 && String(text).includes("-")) {
    return (Number(matches[0]) + Number(matches[1])) / 2;
  }
  return Number(matches[0]);
};

const parseLengthToCm = (lengthText = "") => {
  const value = toAverageNumber(lengthText);
  if (value == null) return null;
  const text = String(lengthText).toLowerCase();
  if (text.includes("inch")) return value * 2.54;
  if (text.includes("mm")) return value / 10;
  return value; // default cm
};

const parseWeightToGrams = (weightText = "") => {
  const value = toAverageNumber(weightText);
  if (value == null) return null;
  const text = String(weightText).toLowerCase();
  if (text.includes("kg")) return value * 1000;
  if (text.includes("lb")) return value * 453.592;
  return value; // default grams
};

export default function PregnancyModeDashboard({ initialTab = "dashboard" }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(20);
  const [trimester, setTrimester] = useState("second");
  const [dueDate, setDueDate] = useState("2024-06-15");
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingMode, setOnboardingMode] = useState("week");
  const [onboardingWeek, setOnboardingWeek] = useState("");
  const [onboardingDueDate, setOnboardingDueDate] = useState("");
  const [onboardingError, setOnboardingError] = useState("");
  const [savingOnboarding, setSavingOnboarding] = useState(false);
  const [kickCountToday, setKickCountToday] = useState(0);
  const [kickCounterActive, setKickCounterActive] = useState(false);
  const [selectedMood, setSelectedMood] = useState("");
  const [savingMood, setSavingMood] = useState(false);
  const [weeklyChecklist, setWeeklyChecklist] = useState([]);
  const [savingChecklist, setSavingChecklist] = useState(false);
  const [contractionsToday, setContractionsToday] = useState([]);
  const [contractionStartAt, setContractionStartAt] = useState(null);
  const [contractionElapsedSec, setContractionElapsedSec] = useState(0);
  const [healthInsights, setHealthInsights] = useState({
    overallScore: 0,
    label: "Loading",
    nutritionScore: 0,
    exerciseScore: 0,
    sleepScore: 0,
    vitalsScore: 0,
    symptomsScore: 0,
    risks: [],
    alerts: [],
  });
  const [riskHealthData, setRiskHealthData] = useState({
    systolic: 0,
    diastolic: 0,
    bloodSugar: 0,
    hemoglobin: 0,
    weightGain: 0,
    symptoms: [],
  });

  const isValidWeek = (value) => Number.isInteger(value) && value >= 1 && value <= 40;

  // Load pregnancy data on component mount
  useEffect(() => {
    loadPregnancyData();
  }, []);

  const getTrimesterFromWeek = (week) => {
    if (week <= 12) return "first";
    if (week <= 26) return "second";
    return "third";
  };

  const getTimelineTrimesterLabel = (week) => {
    if (week <= 13) return "First Trimester";
    if (week <= 27) return "Second Trimester";
    return "Third Trimester";
  };

  const calculateDueDateFromWeek = (week) => {
    const date = new Date();
    date.setDate(date.getDate() + (40 - week) * 7);
    return date.toISOString().split("T")[0];
  };

  const calculateWeekFromDueDate = (dateString) => {
    if (!dateString) return null;
    const target = new Date(dateString);
    if (Number.isNaN(target.getTime())) return null;
    const now = new Date();
    const weeksRemaining = Math.max(0, Math.round((target - now) / (1000 * 60 * 60 * 24 * 7)));
    const week = 40 - weeksRemaining;
    if (week < 1 || week > 40) return null;
    return week;
  };

  const getNutritionSuggestions = (week) => {
    if (week <= 13) {
      return {
        title: "First Trimester Nutrition",
        subtitle: "Folate and gentle digestion support",
        foods: ["Spinach", "Lentils", "Citrus fruits", "Whole grains"],
      };
    }
    if (week <= 27) {
      return {
        title: "Second Trimester Nutrition",
        subtitle: "Iron and protein for growth",
        foods: ["Spinach", "Lentils", "Lean red meat", "Eggs", "Greek yogurt"],
      };
    }
    return {
      title: "Third Trimester Nutrition",
      subtitle: "Protein, calcium, and hydration focus",
      foods: ["Salmon", "Paneer or tofu", "Beans", "Banana", "Nuts and seeds"],
    };
  };

  const toLevel = (value) => {
    if (value >= 67) return "high";
    if (value >= 34) return "medium";
    return "low";
  };

  const toLabel = (level) => (level === "high" ? "High" : level === "medium" ? "Medium" : "Low");

  const scoreLabel = (score) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    return "Needs Attention";
  };

  const clampScore = (value, max = 20) => Math.max(0, Math.min(max, Math.round(value)));

  const average = (arr) => (arr.length ? arr.reduce((sum, val) => sum + val, 0) / arr.length : 0);

  const buildHealthInsights = (logs = []) => {
    const recent = logs.slice(0, 14);
    const latest = recent[0] || {};
    const nutritionMeals = average(recent.map((log) => Number(log.mealsEaten) || 0));
    const nutritionWater = average(recent.map((log) => Number(log.waterIntake) || 0));
    const supplementRatio = average(
      recent.map((log) => (Array.isArray(log.supplements) && log.supplements.length > 0 ? 1 : 0))
    );
    const activeDaysRatio = average(
      recent.map((log) => (log.exercise || Number(log.exerciseDuration) >= 20 ? 1 : 0))
    );
    const avgSleep = average(recent.map((log) => Number(log.sleepHours) || 0));
    const avgSleepQuality = average(
      recent.map((log) => {
        const quality = String(log.sleepQuality || "").toLowerCase();
        if (quality === "excellent") return 1;
        if (quality === "good") return 0.8;
        if (quality === "fair") return 0.5;
        return 0.3;
      })
    );

    const systolic = Number(latest?.systolic ?? latest?.bloodPressure?.systolic) || 0;
    const diastolic = Number(latest?.diastolic ?? latest?.bloodPressure?.diastolic) || 0;
    const glucose = Number(latest?.bloodSugar) || 0;
    const weightGain = Number(latest?.weightGain) || 0;
    const stress = Number(latest?.stress) || 5;
    const energy = Number(latest?.energy) || 5;

    const symptomFlags = [
      "nausea",
      "vomiting",
      "fatigue",
      "moodSwings",
      "backPain",
      "heartburn",
      "swelling",
      "insomnia",
    ].reduce((count, key) => count + (latest?.[key] ? 1 : 0), 0);
    const severeSymptoms = Array.isArray(latest?.symptoms)
      ? latest.symptoms.filter((symptom) => String(symptom?.intensity).toLowerCase() === "severe").length
      : 0;

    const nutritionScore = clampScore(
      (nutritionMeals >= 3 ? 8 : nutritionMeals >= 2 ? 6 : 3) +
      (nutritionWater >= 2 ? 8 : nutritionWater >= 1.5 ? 6 : 3) +
      (supplementRatio >= 0.6 ? 4 : supplementRatio >= 0.3 ? 2 : 1)
    );
    const exerciseScore = clampScore(activeDaysRatio * 20);
    const sleepScore = clampScore(
      (avgSleep >= 7 && avgSleep <= 9 ? 12 : avgSleep >= 6 && avgSleep <= 10 ? 9 : 5) +
      avgSleepQuality * 8
    );

    let vitalsBase = 20;
    if (systolic >= 140 || diastolic >= 90) vitalsBase -= 8;
    else if (systolic >= 130 || diastolic >= 85) vitalsBase -= 4;
    if (glucose >= 140) vitalsBase -= 8;
    else if (glucose >= 120) vitalsBase -= 4;
    if (currentWeek >= 20 && weightGain > 12) vitalsBase -= 4;
    else if (currentWeek >= 20 && weightGain > 9) vitalsBase -= 2;
    const vitalsScore = clampScore(vitalsBase);

    const symptomsScore = clampScore(20 - symptomFlags * 1 - severeSymptoms * 2 - (stress > 7 ? 3 : 0) - (energy < 4 ? 2 : 0));

    const overallScore = Math.max(
      0,
      Math.min(100, nutritionScore + exerciseScore + sleepScore + vitalsScore + symptomsScore)
    );

    const gestationalDiabetesValue = Math.min(
      100,
      (glucose >= 140 ? 85 : glucose >= 120 ? 65 : glucose >= 100 ? 40 : 20) +
      (nutritionScore < 12 ? 10 : 0) +
      (exerciseScore < 10 ? 10 : 0)
    );
    const preeclampsiaValue = Math.min(
      100,
      (systolic >= 140 || diastolic >= 90 ? 85 : systolic >= 130 || diastolic >= 85 ? 60 : 20) +
      (latest?.swelling ? 15 : 0)
    );
    const anemiaValue = Math.min(
      100,
      20 + (latest?.fatigue ? 20 : 0) + (energy < 4 ? 20 : 0) + (nutritionScore < 12 ? 20 : 0)
    );
    const pretermValue = Math.min(
      100,
      20 + (stress > 7 ? 20 : 0) + (avgSleep < 6 ? 20 : 0) + ((systolic >= 140 || diastolic >= 90) ? 25 : 0) + (symptomsScore < 10 ? 15 : 0)
    );

    const risks = [
      { label: "Gestational Diabetes", value: Math.round(gestationalDiabetesValue) },
      { label: "Preeclampsia", value: Math.round(preeclampsiaValue) },
      { label: "Anemia Risk", value: Math.round(anemiaValue) },
      { label: "Preterm Birth", value: Math.round(pretermValue) },
    ].map((item) => ({ ...item, status: toLevel(item.value), levelText: toLabel(toLevel(item.value)) }));

    const alerts = [];
    if (systolic >= 140 || diastolic >= 90) {
      alerts.push("Your blood pressure is higher than normal. Please consult a doctor.");
    }
    if (glucose >= 120) {
      alerts.push("Your blood glucose appears elevated. Please review this with your doctor.");
    }
    if (overallScore < 50) {
      alerts.push("Multiple health indicators need attention. Please seek medical guidance.");
    }

    return {
      overallScore,
      label: scoreLabel(overallScore),
      nutritionScore,
      exerciseScore,
      sleepScore,
      vitalsScore,
      symptomsScore,
      risks,
      alerts,
    };
  };

  const loadPregnancyData = async () => {
    const localUser = JSON.parse(localStorage.getItem("user") || "{}");
    const localWeek = Number(localUser?.pregnancy_week);
    const localDueDate = localUser?.pregnancy_due_date;

    try {
      setLoading(true);
      const profileResponse = await api.get("/auth/me");
      const profileUser = profileResponse.data?.user || {};
      const profileWeek = Number(profileUser.pregnancy_week);
      const resolvedProfileWeek = isValidWeek(profileWeek) ? profileWeek : localWeek;
      const hasProfileWeek = isValidWeek(resolvedProfileWeek);

      if (!hasProfileWeek) {
        setActiveTab("dashboard");
        setShowOnboarding(true);
        setOnboardingWeek("");
        if (profileUser?.pregnancy_due_date) {
          setOnboardingDueDate(new Date(profileUser.pregnancy_due_date).toISOString().split("T")[0]);
          setOnboardingMode("due-date");
        } else {
          setOnboardingDueDate("");
          setOnboardingMode("week");
        }
        return;
      }

      setShowOnboarding(false);
      const response = await api.get('/pregnancy/current-week');
      const resolvedWeek = Number(response.data?.currentWeek) || resolvedProfileWeek || 20;
      const resolvedTrimester = response.data?.trimester || getTrimesterFromWeek(resolvedWeek);
      const resolvedDueDate = response.data?.dueDate || profileUser?.pregnancy_due_date || localDueDate || calculateDueDateFromWeek(resolvedWeek);

      setCurrentWeek(resolvedWeek);
      setTrimester(resolvedTrimester);
      setDueDate(typeof resolvedDueDate === "string" ? resolvedDueDate : new Date(resolvedDueDate).toISOString().split("T")[0]);
    } catch (error) {
      console.error('Error loading pregnancy data:', error);
      if (isValidWeek(localWeek)) {
        setCurrentWeek(localWeek);
        setTrimester(getTrimesterFromWeek(localWeek));
        setDueDate(localDueDate || calculateDueDateFromWeek(localWeek));
        setShowOnboarding(false);
      } else {
        // Use default values and keep onboarding prompt
        setCurrentWeek(20);
        setTrimester("second");
        setDueDate("2024-06-15");
        setShowOnboarding(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadTrackingFeatures = async () => {
    if (showOnboarding) return;
    try {
      const [kickRes, moodRes, checklistRes, contractionsRes] = await Promise.all([
        api.get("/pregnancy/kick-logs/today"),
        api.get("/pregnancy/mood-logs/today"),
        api.get(`/pregnancy/weekly-checklist?week=${currentWeek}`),
        api.get("/pregnancy/contractions/today"),
      ]);
      const logsRes = await api.get("/pregnancy/logs");

      setKickCountToday(Number(kickRes.data?.kickLog?.count) || 0);
      setSelectedMood(moodRes.data?.moodLog?.mood || "");
      setWeeklyChecklist(Array.isArray(checklistRes.data?.checklist?.items) ? checklistRes.data.checklist.items : []);
      setContractionsToday(Array.isArray(contractionsRes.data?.contractions) ? contractionsRes.data.contractions : []);
      const logs = Array.isArray(logsRes.data?.logs) ? logsRes.data.logs : [];
      setHealthInsights(buildHealthInsights(logs));
      const latest = logs[0] || {};
      const mergedSymptoms = [
        ...(Array.isArray(latest?.symptoms) ? latest.symptoms : []),
        ...(latest?.swelling ? ["swelling"] : []),
        ...(latest?.fatigue ? ["fatigue"] : []),
        ...(latest?.backPain ? ["back pain"] : []),
        ...(latest?.heartburn ? ["heartburn"] : []),
      ];
      setRiskHealthData({
        systolic: Number(latest?.systolic ?? latest?.bloodPressure?.systolic) || 0,
        diastolic: Number(latest?.diastolic ?? latest?.bloodPressure?.diastolic) || 0,
        bloodSugar: Number(latest?.bloodSugar) || 0,
        hemoglobin: Number(latest?.hemoglobin ?? latest?.hb) || 0,
        weightGain: Number(latest?.weightGain) || 0,
        symptoms: mergedSymptoms,
      });
    } catch (error) {
      console.error("Failed to load pregnancy tracking features:", error);
    }
  };

  useEffect(() => {
    loadTrackingFeatures();
  }, [currentWeek, showOnboarding]);

  useEffect(() => {
    if (!contractionStartAt) return undefined;
    const interval = setInterval(() => {
      setContractionElapsedSec(Math.max(0, Math.floor((Date.now() - contractionStartAt) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [contractionStartAt]);

  const handleOnboardingContinue = async (event) => {
    event?.preventDefault?.();
    try {
      setOnboardingError("");
      let weekToSave = null;
      let dueDateToSave = onboardingDueDate || null;

      if (onboardingMode === "week") {
        const parsedWeek = Number.parseInt(onboardingWeek, 10);
        if (!Number.isInteger(parsedWeek) || parsedWeek < 1 || parsedWeek > 40) {
          setOnboardingError("Please enter a valid pregnancy week between 1 and 40.");
          return;
        }
        weekToSave = parsedWeek;
        if (!dueDateToSave) {
          dueDateToSave = calculateDueDateFromWeek(parsedWeek);
        }
      } else {
        const weekFromDate = calculateWeekFromDueDate(onboardingDueDate);
        if (!weekFromDate) {
          setOnboardingError("Please choose a valid due date within the current pregnancy timeline.");
          return;
        }
        weekToSave = weekFromDate;
      }

      setSavingOnboarding(true);
      const response = await api.put("/auth/profile", {
        pregnancy_week: weekToSave,
        pregnancy_due_date: dueDateToSave,
      });

      const updatedUser = response.data?.user || {};
      const localUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...localUser,
          ...updatedUser,
          pregnancy_week: weekToSave,
          pregnancy_due_date: dueDateToSave,
        })
      );

      setCurrentWeek(weekToSave);
      setTrimester(getTrimesterFromWeek(weekToSave));
      setDueDate(dueDateToSave || calculateDueDateFromWeek(weekToSave));
      setActiveTab("dashboard");
      setShowOnboarding(false);
      setOnboardingError("");
      navigate("/pregnancy-dashboard");
    } catch (error) {
      console.error("Failed to save pregnancy onboarding data:", error);
      setOnboardingError(error?.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setSavingOnboarding(false);
    }
  };

  const sidebarItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: "🏠",
      description: "Overview & Progress",
      component: PregnancyDashboard
    },
    {
      id: "baby-growth",
      title: "Baby Growth",
      icon: "👶",
      description: "Week-by-week Development",
      component: BabyDevelopmentTracker
    },
    {
      id: "health-symptoms",
      title: "Health Tracker",
      icon: "🏥",
      description: "Log Symptoms & Health",
      component: PregnancyHealthLog
    },
    {
      id: "appointments",
      title: "Appointments",
      icon: "📅",
      description: "Medical & Medication",
      component: AppointmentMedicationTracker
    },
    {
      id: "nutrition-tips",
      title: "Nutrition & Tips",
      icon: "🥗",
      description: "Wellness & Nutrition",
      component: NutritionWellnessTips
    },
    {
      id: "exercises",
      title: "Exercises",
      pageTitle: "Exercise & Fitness",
      icon: "💪",
      description: "Safe pregnancy exercises for every trimester",
      component: PregnancyExercises
    },
    {
      id: "emotional-support",
      title: "Emotional Support",
      pageTitle: "Emotional Support",
      icon: "♡",
      description: "Mental health and wellbeing during pregnancy",
      component: PregnancyEmotionalSupport
    },
    {
      id: "ai-assistant",
      title: "AI Assistant",
      pageTitle: "AI Pregnancy Assistant",
      icon: "🤖",
      description: "Ask me anything about your pregnancy journey",
      component: PregnancyAIAssistant
    },
    {
      id: "community",
      title: "Community",
      pageTitle: "Community Support",
      icon: "👥",
      description: "Connect with other expecting mothers",
      component: PregnancyCommunity
    },
    {
      id: "baby-names",
      title: "Baby Names",
      icon: "📝",
      description: "Name Suggestions",
      component: BabyNameSuggestion
    },
    {
      id: "resources",
      title: "Articles",
      pageTitle: "Pregnancy Articles",
      icon: "📚",
      description: "Educational materials for your pregnancy journey",
      component: PregnancyResourceHub
    },
    {
      id: "ai-health-insights",
      title: "AI Insights",
      icon: "💉",
      description: "AI-powered Analysis",
      component: PregnancyAIHealthInsights
    },
    {
      id: "care-plan",
      title: "Care Plan",
      icon: "📝",
      description: "Personalized weekly maternal care plan",
      component: CarePlanPage,
    },
  ];

  const sidebarItemMap = useMemo(
    () => Object.fromEntries(sidebarItems.map((item) => [item.id, item])),
    [sidebarItems]
  );

  const navGroups = [
    {
      label: "Core Tracking",
      itemIds: ["dashboard", "baby-growth", "health-symptoms", "appointments"],
    },
    {
      label: "Lifestyle & Support",
      itemIds: ["nutrition-tips", "exercises", "emotional-support"],
    },
    {
      label: "AI Tools",
      itemIds: ["ai-assistant", "ai-health-insights", "care-plan"],
    },
    {
      label: "Community & Resources",
      itemIds: ["community", "baby-names", "resources"],
    },
  ];

  const getTrimesterInfo = (trimester) => {
    const info = {
      first: { color: "from-pink-400 to-rose-400", icon: "🌱", weeks: "1-12", label: "1st" },
      second: { color: "from-violet-500 to-fuchsia-500", icon: "🌿", weeks: "13-26", label: "2nd" },
      third: { color: "from-purple-500 to-indigo-500", icon: "🌸", weeks: "27-40", label: "3rd" }
    };
    return info[trimester] || info.second;
  };

  const trimesterInfo = getTrimesterInfo(trimester);
  const activeItem = sidebarItems.find(item => item.id === activeTab);
  const ActiveComponent = activeItem?.component;
  const sharedPregnancyProps = { currentWeek, trimester, dueDate };

  const daysLeft = Math.max(0, Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24)));
  const progress = Math.min(100, Math.round((currentWeek / 40) * 100));
  const timelineProgress = Math.max(0, Math.min(100, ((currentWeek - 1) / 39) * 100));
  const timelineTrimesterLabel = getTimelineTrimesterLabel(currentWeek);
  const weekData = useMemo(() => pregnancyWeeks[currentWeek] || pregnancyWeeks[20], [currentWeek]);
  const nutritionData = useMemo(() => getNutritionSuggestions(currentWeek), [currentWeek]);
  const previousWeekData = useMemo(
    () => pregnancyWeeks[Math.max(1, currentWeek - 1)] || pregnancyWeeks[1],
    [currentWeek]
  );
  const fruitImageKey = useMemo(() => resolveFruitImageKey(weekData.fruit), [weekData.fruit]);
  const growthSinceLastWeek = useMemo(() => {
    const currentLengthCm = parseLengthToCm(weekData.length);
    const prevLengthCm = parseLengthToCm(previousWeekData.length);
    const currentWeightG = parseWeightToGrams(weekData.weight);
    const prevWeightG = parseWeightToGrams(previousWeekData.weight);

    const lengthDeltaCm =
      currentLengthCm != null && prevLengthCm != null ? Math.max(0, currentLengthCm - prevLengthCm) : null;
    const weightDeltaG =
      currentWeightG != null && prevWeightG != null ? Math.max(0, currentWeightG - prevWeightG) : null;

    return {
      lengthCm: lengthDeltaCm,
      lengthIn: lengthDeltaCm != null ? lengthDeltaCm / 2.54 : null,
      weightG: weightDeltaG,
      weightLb: weightDeltaG != null ? weightDeltaG / 453.592 : null,
    };
  }, [weekData, previousWeekData]);

  const upcomingAppointments = [
    { title: "Prenatal Checkup", doctor: "Dr. Emily Johnson", time: "March 15, 2026 • 10:00 AM", marker: "pink" },
    { title: "Ultrasound Scan", doctor: "Women's Health Center", time: "March 22, 2026 • 2:30 PM", marker: "cyan" },
    { title: "Glucose Screening", doctor: "Lab Test", time: "March 29, 2026 • 6:00 AM", marker: "teal" },
  ];

  const recentActivities = [
    { title: "Symptoms Logged", meta: "Mild back pain, fatigue", at: "2 hours ago" },
    { title: "Health Metrics", meta: "BP: 118/78, Weight: 145 lbs", at: "1 day ago" },
    { title: "Exercise Completed", meta: "Prenatal yoga • 20 min", at: "1 day ago" },
  ];

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const handleAddKick = async () => {
    try {
      const response = await api.post("/pregnancy/kick-logs", { amount: 1 });
      setKickCountToday(Number(response.data?.kickLog?.count) || kickCountToday + 1);
      setKickCounterActive(true);
    } catch (error) {
      console.error("Failed to add kick:", error);
    }
  };

  const handleMoodSave = async (mood) => {
    try {
      setSavingMood(true);
      await api.post("/pregnancy/mood-logs", { mood });
      setSelectedMood(mood);
    } catch (error) {
      console.error("Failed to save mood:", error);
    } finally {
      setSavingMood(false);
    }
  };

  const toggleChecklistItem = async (itemId) => {
    const nextItems = weeklyChecklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setWeeklyChecklist(nextItems);
    try {
      setSavingChecklist(true);
      await api.put("/pregnancy/weekly-checklist", { week: currentWeek, items: nextItems });
    } catch (error) {
      console.error("Failed to update checklist:", error);
    } finally {
      setSavingChecklist(false);
    }
  };

  const handleContractionStart = () => {
    setContractionStartAt(Date.now());
    setContractionElapsedSec(0);
  };

  const handleContractionStop = async () => {
    if (!contractionStartAt) return;
    try {
      const endedAt = new Date();
      await api.post("/pregnancy/contractions", {
        startedAt: new Date(contractionStartAt).toISOString(),
        endedAt: endedAt.toISOString(),
      });
      setContractionStartAt(null);
      setContractionElapsedSec(0);
      await loadTrackingFeatures();
    } catch (error) {
      console.error("Failed to save contraction:", error);
    }
  };

  const renderDashboardContent = () => (
    <div className="preg-dashboard-canvas">
      <div className="preg-overview-card">
        <div className="preg-overview-top">
          <div>
            <p className="kicker">Current Week</p>
            <h2>Week {currentWeek}</h2>
            <p className="muted">Trimester</p>
            <p className="value capitalize">{trimester}</p>
          </div>
          <div>
            <p className="kicker">Due Date</p>
            <p className="value">{new Date(dueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
          <div>
            <p className="kicker">Days Left</p>
            <p className="value">{daysLeft} days</p>
          </div>
        </div>
        <div className="preg-progress-row">
          <div className="preg-progress-track">
            <div className="preg-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span>{progress}%</span>
        </div>
        <div className="preg-baby-size-row">
          <span>👶 Baby Size This Week</span>
          <strong>{weekData.fruit} • {weekData.length}</strong>
        </div>
        <div className="preg-timeline-card">
          <div className="preg-timeline-top">
            <span>Week 1</span>
            <span>Week 40</span>
          </div>
          <div className="preg-timeline-track">
            <div className="preg-timeline-fill" style={{ width: `${timelineProgress}%` }} />
            <div className="preg-timeline-dot" style={{ left: `${timelineProgress}%` }}>
              ●
            </div>
          </div>
          <div className="preg-timeline-bottom">
            <strong>Current: Week {currentWeek}</strong>
            <span>{timelineTrimesterLabel}</span>
          </div>
        </div>
      </div>

      <div className="preg-grid-three">
        <PregnancyRiskCard healthData={riskHealthData} />

        <article className="preg-card">
          <h3>💗 Baby Growth</h3>
          <div className="preg-growth-hero-image-wrap">
            <img
              src={`/baby-growth/${fruitImageKey}.png`}
              alt={`${weekData.fruit} size comparison`}
              className="preg-growth-hero-image"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = `/baby-growth/${fruitImageKey}.svg`;
              }}
            />
          </div>
          <div className="preg-metric"><span>Baby Size</span><strong>{weekData.fruit}</strong></div>
          <div className="preg-metric"><span>Length</span><strong>{weekData.length}</strong></div>
          <div className="preg-metric"><span>Weight</span><strong>{weekData.weight}</strong></div>
          <div className="preg-growth-since-last-week">
            <h4>Growth Since Last Week</h4>
            <div className="preg-metric">
              <span>Length</span>
              <strong>
                {growthSinceLastWeek.lengthCm != null
                  ? `+${growthSinceLastWeek.lengthIn.toFixed(1)} inch`
                  : "N/A"}
              </strong>
            </div>
            <div className="preg-metric">
              <span>Weight</span>
              <strong>
                {growthSinceLastWeek.weightG != null
                  ? `+${Math.round(growthSinceLastWeek.weightG)} grams`
                  : "N/A"}
              </strong>
            </div>
          </div>
          <p className="preg-footnote">{weekData.development}</p>
        </article>

        <article className="preg-card">
          <h3>🗓 Upcoming Appointments</h3>
          <div className="preg-appointment-list">
            {upcomingAppointments.map((item) => (
              <div className={`appt-item ${item.marker}`} key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.doctor}</p>
                <small>{item.time}</small>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="preg-grid-three lower">
        <article className="preg-card">
          <h3>📈 Recent Activity</h3>
          <div className="preg-activity-list">
            {recentActivities.map((item) => (
              <div className="activity-item" key={item.title}>
                <div className="dot" />
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.meta}</p>
                  <small>{item.at}</small>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="preg-card message">
          <h3>♡ Weekly Advice</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            {(weekData.tips || []).map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </article>

        <article className="preg-card quick-stats">
          <h3>〽 Quick Stats</h3>
          <div className="mini-grid">
            <div className="mini-card">
              <strong>{daysLeft}</strong>
              <small>Days Remaining</small>
            </div>
            <div className="mini-card">
              <strong>{trimesterInfo.label}</strong>
              <small>Trimester</small>
            </div>
          </div>
        </article>

        <article className="preg-card pregnancy-health-score-card">
          <h3>💖 Overall Pregnancy Health Score</h3>
          <div className="health-score">
            <strong>{healthInsights.overallScore} / 100</strong>
            <span>Status</span>
            <small>{healthInsights.label}</small>
          </div>
          <div className="preg-score-breakdown">
            <p>Nutrition: {healthInsights.nutritionScore}/20</p>
            <p>Exercise: {healthInsights.exerciseScore}/20</p>
            <p>Sleep: {healthInsights.sleepScore}/20</p>
            <p>Vitals: {healthInsights.vitalsScore}/20</p>
            <p>Symptoms: {healthInsights.symptomsScore}/20</p>
          </div>
        </article>
      </div>

      <div className="preg-grid-three lower">
        {currentWeek >= 20 ? (
          <article className="preg-card">
            <h3>👣 Kick Counter Today</h3>
            <p className="text-sm text-gray-600 mb-2">Visible from week 20 onward.</p>
            <div className="mini-card mb-3">
              <strong>{kickCountToday}</strong>
              <small>Kicks logged today</small>
            </div>
            {!kickCounterActive ? (
              <button
                type="button"
                onClick={() => setKickCounterActive(true)}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg font-semibold"
              >
                Start Kick Counter
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleAddKick}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg font-semibold"
                >
                  + Add Kick
                </button>
                <button
                  type="button"
                  onClick={() => setKickCounterActive(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold"
                >
                  Stop Counter
                </button>
              </div>
            )}
          </article>
        ) : null}

        {currentWeek >= 34 ? (
          <article className="preg-card">
            <h3>⏱ Contraction Timer</h3>
            <p className="text-sm text-gray-600 mb-2">Visible from week 34 onward.</p>
            <div className="mini-card mb-3">
              <strong>{formatDuration(contractionElapsedSec)}</strong>
              <small>Current contraction</small>
            </div>
            {!contractionStartAt ? (
              <button
                type="button"
                onClick={handleContractionStart}
                className="w-full bg-violet-500 hover:bg-violet-600 text-white py-2 rounded-lg font-semibold"
              >
                Start Timer
              </button>
            ) : (
              <button
                type="button"
                onClick={handleContractionStop}
                className="w-full bg-violet-500 hover:bg-violet-600 text-white py-2 rounded-lg font-semibold"
              >
                Stop Timer
              </button>
            )}
            <p className="preg-footnote mt-3">
              Logged today: {contractionsToday.length} contraction(s)
            </p>
          </article>
        ) : null}

        <article className="preg-card">
          <h3>😊 How are you feeling today?</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "happy", label: "Happy" },
              { id: "neutral", label: "Neutral" },
              { id: "stressed", label: "Stressed" },
              { id: "tired", label: "Tired" },
            ].map((moodOption) => (
              <button
                key={moodOption.id}
                type="button"
                disabled={savingMood}
                onClick={() => handleMoodSave(moodOption.id)}
                className={`py-2 rounded-lg border font-semibold ${
                  selectedMood === moodOption.id
                    ? "bg-pink-100 border-pink-400 text-pink-700"
                    : "bg-white border-gray-200 text-gray-700"
                }`}
              >
                {moodOption.label}
              </button>
            ))}
          </div>
          <p className="preg-footnote mt-3">Saved to mood logs for today.</p>
        </article>
      </div>

      <div className="preg-grid-three lower">
        <article className="preg-card">
          <h3>✅ Week Checklist</h3>
          <p className="text-sm text-gray-600 mb-2">Week {currentWeek}</p>
          <div className="space-y-2">
            {weeklyChecklist.map((item) => (
              <label key={item.id} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={Boolean(item.completed)}
                  disabled={savingChecklist}
                  onChange={() => toggleChecklistItem(item.id)}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </article>

        <article className="preg-card">
          <h3>🥗 Nutrition Suggestion</h3>
          <p className="text-sm text-gray-600">{nutritionData.title}</p>
          <p className="preg-footnote mb-2">{nutritionData.subtitle}</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            {nutritionData.foods.map((food) => (
              <li key={food}>{food}</li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pregnancy dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="preg-mode-layout">
      <UserHeader />
      <div className="preg-mode-body">
        <aside className={`preg-mode-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="brand-block">
            <div>
              <h3>🤰 Pregnancy Mode</h3>
              <p>Track, support, and grow each week</p>
            </div>
            <button
              type="button"
              className="preg-sidebar-toggle"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle sidebar menu"
            >
              {sidebarOpen ? "✕" : "☰"}
            </button>
          </div>
          <div className="preg-nav-wrap">
            <nav className="preg-nav">
              {navGroups.map((group) => (
                <section key={group.label} className="preg-nav-group">
                  <h4>{group.label}</h4>
                  {group.itemIds
                    .map((id) => sidebarItemMap[id])
                    .filter(Boolean)
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (showOnboarding) {
                            return;
                          }
                          setActiveTab(item.id);
                          if (window.innerWidth <= 1024) {
                            setSidebarOpen(false);
                          }
                        }}
                        className={`preg-nav-item ${activeTab === item.id ? "active" : ""}`}
                        disabled={showOnboarding}
                      >
                        <span className="preg-nav-icon">{item.icon}</span>
                        <span>{item.title}</span>
                      </button>
                    ))}
                </section>
              ))}
            </nav>
            <button className="back-mode-btn" onClick={() => navigate("/period-tracking")}>
              ← Back to Mode Selection
            </button>
          </div>
        </aside>

        <main className="preg-mode-content">
          {activeTab !== "baby-growth" && activeTab !== "health-symptoms" && !showOnboarding ? (
            <div className="preg-mode-headline">
              <h1>{activeTab === "dashboard" ? "Pregnancy Dashboard" : activeItem?.pageTitle || activeItem?.title}</h1>
              <p>
                {activeTab === "dashboard"
                  ? "Welcome back, Sarah! Here's your pregnancy overview."
                  : activeItem?.description}
              </p>
            </div>
          ) : null}

          {showOnboarding ? (
            <section className="preg-onboarding-screen">
              <div className="preg-onboarding-modal">
                <h2>Set Up Pregnancy Mode</h2>
                <p>Add your current pregnancy week or due date to personalize your dashboard.</p>

                <div className="preg-onboarding-switch">
                  <button
                    type="button"
                    className={onboardingMode === "week" ? "active" : ""}
                    onClick={() => setOnboardingMode("week")}
                  >
                    Enter Week
                  </button>
                  <button
                    type="button"
                    className={onboardingMode === "due-date" ? "active" : ""}
                    onClick={() => setOnboardingMode("due-date")}
                  >
                    Enter Due Date
                  </button>
                </div>

                {onboardingMode === "week" ? (
                  <label className="preg-onboarding-field">
                    <span>Pregnancy Week (1-40)</span>
                    <input
                      type="number"
                      min={1}
                      max={40}
                      placeholder="e.g. 20"
                      value={onboardingWeek}
                      onChange={(e) => setOnboardingWeek(e.target.value)}
                    />
                  </label>
                ) : (
                  <label className="preg-onboarding-field">
                    <span>Expected Due Date</span>
                    <input
                      type="date"
                      value={onboardingDueDate}
                      onChange={(e) => setOnboardingDueDate(e.target.value)}
                    />
                  </label>
                )}

                {onboardingError ? <p className="preg-onboarding-error">{onboardingError}</p> : null}

                <button
                  type="button"
                  className="preg-onboarding-continue"
                  onClick={(event) => handleOnboardingContinue(event)}
                  disabled={savingOnboarding}
                >
                  {savingOnboarding ? "Saving..." : "Continue"}
                </button>
              </div>
            </section>
          ) : activeTab === "dashboard" ? (
            renderDashboardContent()
          ) : activeTab === "baby-growth" || activeTab === "health-symptoms" ? (
            ActiveComponent ? <ActiveComponent {...sharedPregnancyProps} /> : null
          ) : activeTab === "care-plan" ? (
            ActiveComponent ? <ActiveComponent {...sharedPregnancyProps} /> : null
          ) : (
            <div className="preg-tab-card">{ActiveComponent ? <ActiveComponent {...sharedPregnancyProps} /> : null}</div>
          )}
        </main>
      </div>
    </div>
  );
}
