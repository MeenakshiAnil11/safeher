import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import HealthSidebar from "../components/HealthSidebar";
import Footer from "../components/Footer";
import api from "../services/api";
import "./health.css";
import ConfirmDialog from "../components/ConfirmDialog";
import ChatModal from "../components/ChatModal";
import MLDashboard from "../components/MLDashboard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

export default function Health() {
  const location = useLocation();

  const getActiveTab = () => {
    const hash = location.hash.substring(1);
    return hash || 'dashboard';
  };

  const [tab, setTab] = useState(getActiveTab());

  // Confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => () => {});

  // Chat modal state
  const [chatOpen, setChatOpen] = useState(false);

  // Vitals state
  const [vitals, setVitals] = useState([]);
  const [vitalForm, setVitalForm] = useState({
    recordedAt: new Date().toISOString().slice(0, 10),
    weightKg: "",
    heightCm: "",
    systolic: "",
    diastolic: "",
    heartRateBpm: "",
    bloodSugar: "",
    bloodSugarNotes: "",
    ironLevel: "",
    ironLevelNotes: "",
    cholesterol: "",
    cholesterolNotes: "",
    notes: "",
  });
  const bmi = useMemo(() => {
    const w = parseFloat(vitalForm.weightKg);
    const h = parseFloat(vitalForm.heightCm) / 100;
    if (!w || !h) return "";
    return (w / (h * h)).toFixed(1);
  }, [vitalForm.weightKg, vitalForm.heightCm]);

  // Symptoms state
  const [symptoms, setSymptoms] = useState([]);
  const [symForm, setSymForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    tags: "",
    severity: 5,
    notes: ""
  });

  // Vaccination state
  const [vaccs, setVaccs] = useState([]);
  const [vaccForm, setVaccForm] = useState({
    name: "",
    date: new Date().toISOString().slice(0, 10),
    lotNumber: "",
    provider: "",
    nextDue: "",
    notes: ""
  });

  // Medical records state
  const [records, setRecords] = useState([]);
  const [recForm, setRecForm] = useState({
    title: "",
    category: "other",
    fileUrl: "",
    notes: "",
    takenAt: ""
  });

  // Mood logs state
  const [moodLogs, setMoodLogs] = useState([]);
  const [moodForm, setMoodForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    mood: "",
    symptoms: "",
    notes: ""
  });

  // Lifestyle state
  const [exercises, setExercises] = useState([]);
  const [sleepLogs, setSleepLogs] = useState([]);
  const [nutritionLogs, setNutritionLogs] = useState([]);
  const [exerciseForm, setExerciseForm] = useState({
    type: "",
    duration: "",
    intensity: "Medium",
    caloriesBurned: "",
    notes: "",
    date: new Date().toISOString().slice(0, 10)
  });
  const [sleepForm, setSleepForm] = useState({
    sleepHours: "",
    quality: "Good",
    bedtimeHour: "",
    bedtimeMinute: "",
    bedtimeAmPm: "AM",
    wakeTimeHour: "",
    wakeTimeMinute: "",
    wakeTimeAmPm: "AM",
    notes: "",
    date: new Date().toISOString().slice(0, 10)
  });
  const [nutritionForm, setNutritionForm] = useState({
    meal: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    hydration: "",
    supplements: "",
    notes: "",
    date: new Date().toISOString().slice(0, 10)
  });
  const [lifestyleExpanded, setLifestyleExpanded] = useState({
    exercise: false,
    sleep: false,
    nutrition: false,
    charts: false,
  });
  const [lifestyleTab, setLifestyleTab] = useState('exercise');

  // Goals state
  const [goals, setGoals] = useState([]);
  const [goalForm, setGoalForm] = useState({
    category: "weight",
    title: "",
    description: "",
    targetValue: "",
    unit: "",
    deadline: "",
    status: "active"
  });
  
  // Risk & Insights state
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [correlations, setCorrelations] = useState([]);
  const [aiInsights, setAIInsights] = useState([]);
  const [smartwatchData, setSmartwatchData] = useState(null);
  const [smartwatchConnected, setSmartwatchConnected] = useState(false);
  const [smartwatchLastSync, setSmartwatchLastSync] = useState(null);

  const fetchSmartwatchData = async () => {
    try {
      const response = await api.get("/health/smartwatch-data");
      const payload = response.data || {};
      setSmartwatchData(payload);
      setSmartwatchConnected(Boolean(payload.connected));
      setSmartwatchLastSync(payload.lastSyncAt || payload.timestamp || null);
    } catch (_error) {
      setSmartwatchConnected(false);
    }
  };

  useEffect(() => {
    // Load everything on mount
    (async () => {
      try {
        await Promise.all([
          api.get("/health/vitals").then(r => setVitals(r.data.items || [])).catch(() => setVitals([])),
          api.get("/health/symptoms").then(r => setSymptoms(r.data.items || [])).catch(() => setSymptoms([])),
          api.get("/health/vaccinations").then(r => setVaccs(r.data.items || [])).catch(() => setVaccs([])),
          api.get("/health/records").then(r => setRecords(r.data.items || [])).catch(() => setRecords([])),
          api.get("/health/moodlogs").then(r => setMoodLogs(r.data.items || [])).catch(() => setMoodLogs([])),
          api.get("/health/exercises").then(r => setExercises(r.data.items || [])).catch(() => setExercises([])),
          api.get("/health/sleep").then(r => setSleepLogs(r.data.items || [])).catch(() => setSleepLogs([])),
          api.get("/health/nutrition").then(r => setNutritionLogs(r.data.items || [])).catch(() => setNutritionLogs([])),
          api.get("/health/goals").then(r => setGoals(r.data.items || [])).catch(() => setGoals([])),
          api.get("/health/risk-assessment").then(r => setRiskAnalysis(r.data)).catch(() => setRiskAnalysis(null)),
          api.get("/health/correlations").then(r => setCorrelations(r.data.correlations || [])).catch(() => setCorrelations([])),
          api.get("/health/ai-insights").then(r => setAIInsights(r.data.insights || [])).catch(() => setAIInsights([])),
          fetchSmartwatchData(),
        ]);
      } catch (error) {
        console.log("Health data loading failed - using empty arrays");
      }
    })();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchSmartwatchData();
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Update tab when location hash changes
  useEffect(() => {
    setTab(getActiveTab());
  }, [location.hash]);

  // Helper function to format time for display
  const formatTimeForDisplay = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      // 24-hour format
      let h = parseInt(parts[0]);
      const m = parts[1];
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${h}:${m} ${ampm}`;
    } else if (parts.length === 3) {
      // 12-hour format
      return timeStr;
    }
    return timeStr;
  };

  async function submitVital(e) {
    e.preventDefault();
    const payload = { ...vitalForm };
    delete payload._id; // Remove _id from payload
    if (bmi && !isNaN(Number(bmi))) payload.bmi = parseFloat(bmi);
    
    // Convert numeric fields
    ["weightKg","heightCm","systolic","diastolic","heartRateBpm","bloodSugar","ironLevel","cholesterol"].forEach(k => {
      if (payload[k] === "" || payload[k] === null || isNaN(Number(payload[k]))) {
        delete payload[k];
      } else {
        payload[k] = Number(payload[k]);
      }
    });
    try {
      if (vitalForm._id) {
        // Update existing vital
        await api.put(`/health/vitals/${vitalForm._id}`, payload);
      } else {
        // Create new vital
        await api.post("/health/vitals", payload);
      }
      const list = await api.get("/health/vitals");
      setVitals(list.data.items || []);
      setVitalForm({
        recordedAt: new Date().toISOString().slice(0, 10),
        weightKg: "",
        heightCm: "",
        systolic: "",
        diastolic: "",
        heartRateBpm: "",
        bloodSugar: "",
        bloodSugarNotes: "",
        ironLevel: "",
        ironLevelNotes: "",
        cholesterol: "",
        cholesterolNotes: "",
        notes: ""
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save vital");
    }
  }

  async function submitSymptom(e) {
    e.preventDefault();
    const payload = { ...symForm };
    delete payload._id; // Remove _id from payload
    payload.severity = Number(payload.severity);
    payload.tags = (payload.tags || "").split(",").map(t => t.trim()).filter(Boolean);
    try {
      if (symForm._id) {
        // Update existing symptom
        await api.put(`/health/symptoms/${symForm._id}`, payload);
      } else {
        // Create new symptom
        await api.post("/health/symptoms", payload);
      }
      const list = await api.get("/health/symptoms");
      setSymptoms(list.data.items || []);
      setSymForm({
        date: new Date().toISOString().slice(0, 10),
        tags: "",
        severity: 3,
        notes: ""
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save symptom");
    }
  }

  async function submitVacc(e) {
    e.preventDefault();
    const payload = { ...vaccForm };
    delete payload._id; // Remove _id from payload
    try {
      if (vaccForm._id) {
        // Update existing vaccination
        await api.put(`/health/vaccinations/${vaccForm._id}`, payload);
      } else {
        // Create new vaccination
        await api.post("/health/vaccinations", payload);
      }
      const list = await api.get("/health/vaccinations");
      setVaccs(list.data.items || []);
      setVaccForm({
        name: "",
        date: new Date().toISOString().slice(0, 10),
        lotNumber: "",
        provider: "",
        nextDue: "",
        notes: ""
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save vaccination");
    }
  }

  async function submitRecord(e) {
    e.preventDefault();
    const payload = { ...recForm };
    delete payload._id; // Remove _id from payload
    try {
      if (recForm._id) {
        // Update existing record
        await api.put(`/health/records/${recForm._id}`, payload);
      } else {
        // Create new record
        await api.post("/health/records", payload);
      }
      const list = await api.get("/health/records");
      setRecords(list.data.items || []);
      setRecForm({
        title: "",
        category: "other",
        fileUrl: "",
        notes: "",
        takenAt: ""
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save record");
    }
  }

  async function submitMoodLog(e) {
    e.preventDefault();
    const payload = { ...moodForm };
    delete payload._id; // Remove _id from payload
    payload.symptoms = (payload.symptoms || "").split(",").map(s => s.trim()).filter(Boolean);
    try {
      if (moodForm._id) {
        // Update existing mood log
        await api.put(`/health/moodlogs/${moodForm._id}`, payload);
      } else {
        // Create new mood log
        await api.post("/health/moodlogs", payload);
      }
      const list = await api.get("/health/moodlogs");
      setMoodLogs(list.data.items || []);
      setMoodForm({
        date: new Date().toISOString().slice(0, 10),
        mood: "",
        symptoms: "",
        notes: ""
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save mood log");
    }
  }

  function exportCSV(rows, filename) {
    if (!rows.length) return alert("No data to export");
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(",")]
      .concat(rows.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(",")))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Edit and Delete functions
  async function deleteVital(id) {
    setConfirmTitle("Delete Vital Record");
    setConfirmMessage("Are you sure you want to delete this vital record?");
    setConfirmAction(() => async () => {
      try {
        await api.delete(`/health/vitals/${id}`);
        const list = await api.get("/health/vitals");
        setVitals(list.data.items || []);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete vital");
      }
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  }

  async function editVital(vital) {
    setVitalForm({
      recordedAt: vital.recordedAt ? new Date(vital.recordedAt).toISOString().slice(0, 10) : "",
      weightKg: vital.weightKg || "",
      heightCm: vital.heightCm || "",
      systolic: vital.systolic || "",
      diastolic: vital.diastolic || "",
      heartRateBpm: vital.heartRateBpm || "",
      bloodSugar: vital.bloodSugar || "",
      bloodSugarNotes: vital.bloodSugarNotes || "",
      ironLevel: vital.ironLevel || "",
      ironLevelNotes: vital.ironLevelNotes || "",
      cholesterol: vital.cholesterol || "",
      cholesterolNotes: vital.cholesterolNotes || "",
      notes: vital.notes || "",
      _id: vital._id
    });
  }

  async function deleteSymptom(id) {
    setConfirmTitle("Delete Symptom Record");
    setConfirmMessage("Are you sure you want to delete this symptom record?");
    setConfirmAction(() => async () => {
      try {
        await api.delete(`/health/symptoms/${id}`);
        const list = await api.get("/health/symptoms");
        setSymptoms(list.data.items || []);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete symptom");
      }
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  }

  async function editSymptom(symptom) {
    setSymForm({
      date: symptom.date ? new Date(symptom.date).toISOString().slice(0, 10) : "",
      tags: (symptom.tags || []).join(", "),
      severity: symptom.severity || 3,
      notes: symptom.notes || "",
      _id: symptom._id
    });
  }

  async function deleteVaccination(id) {
    setConfirmTitle("Delete Vaccination Record");
    setConfirmMessage("Are you sure you want to delete this vaccination record?");
    setConfirmAction(() => async () => {
      try {
        await api.delete(`/health/vaccinations/${id}`);
        const list = await api.get("/health/vaccinations");
        setVaccs(list.data.items || []);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete vaccination");
      }
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  }

  async function editVaccination(vaccination) {
    setVaccForm({
      name: vaccination.name || "",
      date: vaccination.date ? new Date(vaccination.date).toISOString().slice(0, 10) : "",
      lotNumber: vaccination.lotNumber || "",
      provider: vaccination.provider || vaccination.doctor || "",
      nextDue: vaccination.nextDue ? new Date(vaccination.nextDue).toISOString().slice(0, 10) : "",
      notes: vaccination.notes || "",
      _id: vaccination._id
    });
  }

  async function deleteRecord(id) {
    setConfirmTitle("Delete Medical Record");
    setConfirmMessage("Are you sure you want to delete this medical record?");
    setConfirmAction(() => async () => {
      try {
        await api.delete(`/health/records/${id}`);
        const list = await api.get("/health/records");
        setRecords(list.data.items || []);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete record");
      }
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  }

  async function editRecord(record) {
    setRecForm({
      title: record.title || "",
      category: record.category || "other",
      fileUrl: record.fileUrl || "",
      notes: record.notes || "",
      takenAt: record.takenAt ? new Date(record.takenAt).toISOString().slice(0, 10) : "",
      _id: record._id
    });
  }

  async function deleteMoodLog(id) {
    setConfirmTitle("Delete Mood Log");
    setConfirmMessage("Are you sure you want to delete this mood log?");
    setConfirmAction(() => async () => {
      try {
        await api.delete(`/health/moodlogs/${id}`);
        const list = await api.get("/health/moodlogs");
        setMoodLogs(list.data.items || []);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete mood log");
      }
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  }

  async function editMoodLog(moodLog) {
    setMoodForm({
      date: moodLog.date ? new Date(moodLog.date).toISOString().slice(0, 10) : "",
      mood: moodLog.mood || "",
      symptoms: (moodLog.symptoms || []).join(", "),
      notes: moodLog.notes || "",
      _id: moodLog._id
    });
  }

  // Lifestyle edit and delete functions
  async function editExercise(exercise) {
    setExerciseForm({
      type: exercise.type || "",
      duration: exercise.duration || "",
      intensity: exercise.intensity || "Medium",
      caloriesBurned: exercise.caloriesBurned || "",
      notes: exercise.notes || "",
      date: exercise.date ? new Date(exercise.date).toISOString().slice(0, 10) : "",
      _id: exercise._id
    });
  }

  async function deleteExercise(id) {
    setConfirmTitle("Delete Exercise Log");
    setConfirmMessage("Are you sure you want to delete this exercise log?");
    setConfirmAction(() => async () => {
      try {
        await api.delete(`/health/exercises/${id}`);
        const list = await api.get("/health/exercises");
        setExercises(list.data.items || []);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete exercise");
      }
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  }

  // Helper function to parse time string into hour, minute, ampm
  const parseTime = (timeStr) => {
    if (!timeStr) return { hour: "", minute: "", ampm: "AM" };
    const parts = timeStr.split(":");
    if (parts.length === 2) {
      // 24-hour format like "22:30"
      let h = parseInt(parts[0]);
      const m = parts[1];
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      return { hour: h.toString(), minute: m, ampm };
    } else if (parts.length === 3) {
      // 12-hour format like "10:30 AM"
      const [hour, minute, ampm] = parts;
      return { hour, minute, ampm: ampm.toUpperCase() };
    }
    return { hour: "", minute: "", ampm: "AM" };
  };

  async function editSleep(sleep) {
    const bedtimeParsed = parseTime(sleep.bedtime);
    const wakeTimeParsed = parseTime(sleep.wakeTime);
    setSleepForm({
      sleepHours: sleep.sleepHours || "",
      quality: sleep.quality || "Good",
      bedtimeHour: bedtimeParsed.hour,
      bedtimeMinute: bedtimeParsed.minute,
      bedtimeAmPm: bedtimeParsed.ampm,
      wakeTimeHour: wakeTimeParsed.hour,
      wakeTimeMinute: wakeTimeParsed.minute,
      wakeTimeAmPm: wakeTimeParsed.ampm,
      notes: sleep.notes || "",
      date: sleep.date ? new Date(sleep.date).toISOString().slice(0, 10) : "",
      _id: sleep._id
    });
  }

  async function deleteSleep(id) {
    setConfirmTitle("Delete Sleep Log");
    setConfirmMessage("Are you sure you want to delete this sleep log?");
    setConfirmAction(() => async () => {
      try {
        await api.delete(`/health/sleep/${id}`);
        const list = await api.get("/health/sleep");
        setSleepLogs(list.data.items || []);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete sleep log");
      }
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  }

  async function editNutrition(nutrition) {
    setNutritionForm({
      meal: nutrition.meal || "",
      calories: nutrition.calories || "",
      protein: nutrition.protein || "",
      carbs: nutrition.carbs || "",
      fat: nutrition.fat || "",
      hydration: nutrition.hydration || "",
      supplements: nutrition.supplements || "",
      notes: nutrition.notes || "",
      date: nutrition.date ? new Date(nutrition.date).toISOString().slice(0, 10) : "",
      _id: nutrition._id
    });
  }

  async function deleteNutrition(id) {
    setConfirmTitle("Delete Nutrition Log");
    setConfirmMessage("Are you sure you want to delete this nutrition log?");
    setConfirmAction(() => async () => {
      try {
        await api.delete(`/health/nutrition/${id}`);
        const list = await api.get("/health/nutrition");
        setNutritionLogs(list.data.items || []);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete nutrition log");
      }
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  }

  // Lifestyle submit functions
  async function submitExercise(e) {
    e.preventDefault();
    const payload = { ...exerciseForm };
    delete payload._id;
    if (payload.duration) payload.duration = Number(payload.duration);
    if (payload.caloriesBurned) payload.caloriesBurned = Number(payload.caloriesBurned);
    try {
      if (exerciseForm._id) {
        await api.put(`/health/exercises/${exerciseForm._id}`, payload);
      } else {
        await api.post("/health/exercises", payload);
      }
      const list = await api.get("/health/exercises");
      setExercises(list.data.items || []);
      setExerciseForm({
        type: "",
        duration: "",
        intensity: "Medium",
        caloriesBurned: "",
        notes: "",
        date: new Date().toISOString().slice(0, 10)
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save exercise");
    }
  }

  async function submitSleep(e) {
    e.preventDefault();
    const payload = { ...sleepForm };
    delete payload._id;
    delete payload.bedtimeHour;
    delete payload.bedtimeMinute;
    delete payload.bedtimeAmPm;
    delete payload.wakeTimeHour;
    delete payload.wakeTimeMinute;
    delete payload.wakeTimeAmPm;
    if (payload.sleepHours) payload.sleepHours = Number(payload.sleepHours);
    // Combine time fields
    if (sleepForm.bedtimeHour && sleepForm.bedtimeMinute) {
      payload.bedtime = `${sleepForm.bedtimeHour}:${sleepForm.bedtimeMinute} ${sleepForm.bedtimeAmPm}`;
    }
    if (sleepForm.wakeTimeHour && sleepForm.wakeTimeMinute) {
      payload.wakeTime = `${sleepForm.wakeTimeHour}:${sleepForm.wakeTimeMinute} ${sleepForm.wakeTimeAmPm}`;
    }
    try {
      if (sleepForm._id) {
        await api.put(`/health/sleep/${sleepForm._id}`, payload);
      } else {
        await api.post("/health/sleep", payload);
      }
      const list = await api.get("/health/sleep");
      setSleepLogs(list.data.items || []);
      setSleepForm({
        sleepHours: "",
        quality: "Good",
        bedtimeHour: "",
        bedtimeMinute: "",
        bedtimeAmPm: "AM",
        wakeTimeHour: "",
        wakeTimeMinute: "",
        wakeTimeAmPm: "AM",
        notes: "",
        date: new Date().toISOString().slice(0, 10)
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save sleep log");
    }
  }

  async function submitNutrition(e) {
    e.preventDefault();
    const payload = { ...nutritionForm };
    delete payload._id;
    if (payload.calories) payload.calories = Number(payload.calories);
    if (payload.protein) payload.protein = Number(payload.protein);
    if (payload.carbs) payload.carbs = Number(payload.carbs);
    if (payload.fat) payload.fat = Number(payload.fat);
    try {
      if (nutritionForm._id) {
        await api.put(`/health/nutrition/${nutritionForm._id}`, payload);
      } else {
        await api.post("/health/nutrition", payload);
      }
      const list = await api.get("/health/nutrition");
      setNutritionLogs(list.data.items || []);
      setNutritionForm({
        meal: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        hydration: "",
        supplements: "",
        notes: "",
        date: new Date().toISOString().slice(0, 10)
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save nutrition log");
    }
  }

  // Goals functions
  async function submitGoal(e) {
    e.preventDefault();
    const payload = { ...goalForm };
    delete payload._id;
    if (payload.targetValue) payload.targetValue = Number(payload.targetValue);
    if (payload.deadline) payload.deadline = new Date(payload.deadline).toISOString();
    try {
      if (goalForm._id) {
        await api.put(`/health/goals/${goalForm._id}`, payload);
      } else {
        await api.post("/health/goals", payload);
      }
      const list = await api.get("/health/goals");
      setGoals(list.data.items || []);
      setGoalForm({
        category: "weight",
        title: "",
        description: "",
        targetValue: "",
        unit: "",
        deadline: "",
        status: "active"
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save goal");
    }
  }

  async function editGoal(goal) {
    setGoalForm({
      category: goal.category || "weight",
      title: goal.title || "",
      description: goal.description || "",
      targetValue: goal.targetValue || "",
      unit: goal.unit || "",
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().slice(0, 10) : "",
      status: goal.status || "active",
      _id: goal._id
    });
  }

  async function deleteGoal(id) {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;
    try {
      await api.delete(`/health/goals/${id}`);
      const list = await api.get("/health/goals");
      setGoals(list.data.items || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete goal");
    }
  }

  const latestVital = vitals.length > 0 ? vitals[0] : null;
  const stepsGoal = 10000;
  const stepsToday = Number(smartwatchData?.stepsToday ?? latestVital?.steps ?? 0);
  const heartRateCurrent = Number(smartwatchData?.heartRate ?? latestVital?.heartRateBpm ?? 0);
  const spo2Current = Number(smartwatchData?.spo2 ?? latestVital?.spo2 ?? 0);
  const bmiCurrent = Number(smartwatchData?.bmi ?? latestVital?.bmi ?? 0);
  const stepsPercent = Math.min(100, Math.round((stepsToday / stepsGoal) * 100));

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const recentSmartwatch = Array.isArray(smartwatchData?.recent) ? [...smartwatchData.recent] : [];
  const weeklyActivityData = weekDays.map((day, i) => {
    const metric = recentSmartwatch[6 - i];
    return {
      day,
      steps: Number(metric?.steps ?? 0),
    };
  });
  const heartRateData = weekDays.map((day, i) => {
    const metric = recentSmartwatch[6 - i];
    return {
      day,
      hr: Number(metric?.heartRate ?? heartRateCurrent ?? 0),
    };
  });
  const sleepData = weekDays.map((day, i) => ({
    day,
    hours: sleepLogs[i]?.sleepHours || parseFloat((Math.random() * 3 + 5).toFixed(1)),
  }));

  const moodColors = { 1: '#f59e0b', 2: '#f97316', 3: '#a855f7', 4: '#3b82f6', 5: '#ec4899' };
  const moodLabels = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent' };
  const formatSyncTime = (syncTime) => {
    if (!syncTime) return "Never";
    const diffMs = Date.now() - new Date(syncTime).getTime();
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
    if (diffMinutes < 1) return "just now";
    if (diffMinutes === 1) return "1 minute ago";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return "1 hour ago";
    return `${diffHours} hours ago`;
  };
  const today = new Date();
  const moodWeek = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const log = moodLogs.find(l => new Date(l.date).toISOString().slice(0, 10) === dateStr);
    const score = log ? ({'Happy':5,'Excited':5,'Calm':4,'Neutral':3,'Tired':2,'Sad':2,'Anxious':1,'Angry':1}[log.mood] || 3) : Math.floor(Math.random() * 3 + 3);
    return { date: `${d.getMonth() + 1}/${d.getDate()}`, score };
  });

  return (
    <div className="hv-page">
      <UserHeader />
      <div className="hv-body">
        <HealthSidebar />

        <div className="hv-content">
          {/* Page title */}
          <div className="hv-head">
            <div>
              <h1 className="hv-page-title">{
                tab === 'dashboard' ? 'Dashboard' :
                tab === 'vitals' ? 'Vitals' :
                tab === 'symptoms' ? 'Symptoms' :
                tab === 'vaccinations' ? 'Vaccinations' :
                tab === 'records' ? 'Medical Records' :
                tab === 'moodlogs' ? 'Mood & Symptoms' :
                tab === 'lifestyle' ? 'Lifestyle' :
                tab === 'goals' ? 'Goals & Risk' :
                tab === 'ml' ? 'AI Health Assistant' :
                tab === 'analytics' ? 'Analytics' :
                'Health Tracker'
              }</h1>
              <p className="hv-page-subtitle">{
                tab === 'dashboard' ? 'Your health overview at a glance' :
                tab === 'vitals' ? 'Track and manage your vital measurements' :
                tab === 'symptoms' ? 'Track and monitor your symptoms' :
                tab === 'vaccinations' ? 'Track your vaccination history and upcoming boosters' :
                tab === 'records' ? 'Store and manage your medical documents securely' :
                tab === 'moodlogs' ? 'Track your emotional wellbeing and mental health' :
                tab === 'lifestyle' ? 'Track your exercise, sleep, nutrition, and habits' :
                tab === 'goals' ? 'Set health goals and monitor risk factors' :
                tab === 'ml' ? 'Get AI-powered insights and predictions about your health' :
                tab === 'analytics' ? 'Comprehensive health insights and trends' :
                'Log vitals, symptoms, vaccinations and medical records.'
              }</p>
            </div>
            {tab === 'analytics' && (
              <div className="an-head-actions">
                <select className="an-period-select"><option>Month</option><option>Week</option><option>Year</option></select>
                <button className="an-export-btn csv" onClick={() => {
                  const rows = [['Metric', 'Value'], ['Avg Weight', '62.5 kg'], ['Avg BMI', '22.8'], ['Avg BP', '119/79'], ['Avg HR', '73 bpm']];
                  const csv = rows.map(r => r.join(',')).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = 'health-analytics.csv'; a.click(); URL.revokeObjectURL(url);
                }}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10v2h10v-2M7 2v7M4.5 6.5L7 9l2.5-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> Export CSV</button>
                <button className="an-export-btn pdf" onClick={() => window.print()}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10v2h10v-2M7 2v7M4.5 6.5L7 9l2.5-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> Export PDF</button>
              </div>
            )}
          </div>

        {/* ═══ DASHBOARD TAB ═══ */}
        {tab === 'dashboard' && (
          <section>
            {/* Status bar */}
            <div className={`ht-status-bar ${smartwatchConnected ? "connected" : "disconnected"}`}>
              {smartwatchConnected ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#10b981" strokeWidth="2"/><path d="M5 8l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#ef4444" strokeWidth="2"/><path d="M6 6l4 4M10 6l-4 4" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
              {smartwatchConnected ? "Connected to Google Fit" : "Not connected to Google Fit"} &bull; Last synced: {formatSyncTime(smartwatchLastSync)}
            </div>

            {/* 4 Metric Cards */}
            <div className="ht-metrics-row">
              <div className="ht-metric-card">
                <div className="ht-metric-header">
                  <span className="ht-metric-label">Steps Today</span>
                  <span className="ht-metric-icon pink">👣</span>
                </div>
                <div className="ht-metric-value">{stepsToday.toLocaleString()}</div>
                <div className="ht-metric-sub">Goal: {stepsGoal.toLocaleString()} steps</div>
                <div className="ht-progress-bar">
                  <div className="ht-progress-fill" style={{ width: `${stepsPercent}%` }} />
                </div>
              </div>

              <div className="ht-metric-card">
                <div className="ht-metric-header">
                  <span className="ht-metric-label">Heart Rate</span>
                  <span className="ht-metric-icon red">&#9829;</span>
                </div>
                <div className="ht-metric-value">{heartRateCurrent > 0 ? `${heartRateCurrent} bpm` : "--"}</div>
                <div className="ht-metric-sub">Resting &bull; Normal range</div>
                <span className="ht-metric-badge green">Healthy</span>
              </div>

              <div className="ht-metric-card">
                <div className="ht-metric-header">
                  <span className="ht-metric-label">SpO&#8322;</span>
                  <span className="ht-metric-icon blue">&#x1F6C8;</span>
                </div>
                <div className="ht-metric-value">{spo2Current > 0 ? `${spo2Current}%` : "--"}</div>
                <div className="ht-metric-sub">Oxygen saturation</div>
                <span className="ht-metric-badge blue">Normal</span>
              </div>

              <div className="ht-metric-card">
                <div className="ht-metric-header">
                  <span className="ht-metric-label">BMI</span>
                  <span className="ht-metric-icon purple">&#x1F4C8;</span>
                </div>
                <div className="ht-metric-value">{bmiCurrent > 0 ? bmiCurrent : "--"}</div>
                <div className="ht-metric-sub">Normal weight</div>
                <span className="ht-metric-badge pink">Healthy</span>
              </div>
            </div>

            {/* AI Health Insights */}
            <div className="ht-ai-insights">
              <h3 className="ht-ai-insights-title">
                <span className="ai-icon">&#x1F916;</span>
                AI Health Insights
              </h3>
              {aiInsights.length > 0 ? aiInsights.slice(0, 3).map((ins, i) => (
                <p key={i} className="ht-insight-item"><strong>{ins.title}:</strong> {ins.message}</p>
              )) : (
                <>
                  <p className="ht-insight-item"><strong>Sleep Analysis:</strong> Your average sleep dropped to 6.8 hours this week. Try adjusting your bedtime to improve rest quality.</p>
                  <p className="ht-insight-item"><strong>Activity Trend:</strong> Great job! You've increased your daily steps by 15% compared to last week.</p>
                  <p className="ht-insight-item"><strong>Heart Rate:</strong> Your resting heart rate is stable and within the healthy range for your age group.</p>
                </>
              )}
            </div>

            {/* Health Alerts */}
            <div className="ht-alerts">
              <h3 className="ht-alerts-title">Health Alerts</h3>
              {riskAnalysis?.warnings?.length > 0 ? riskAnalysis.warnings.map((w, i) => (
                <div key={i} className="ht-alert-card" style={{ marginBottom: 8 }}>
                  <span className="ht-alert-icon">!</span>
                  <div className="ht-alert-content">
                    <strong>{w}</strong>
                    <p>Please consult your doctor if this continues.</p>
                  </div>
                </div>
              )) : (
                <div className="ht-alert-card">
                  <span className="ht-alert-icon">!</span>
                  <div className="ht-alert-content">
                    <strong>Low SpO&#8322; detected yesterday:</strong>
                    <p>Your oxygen saturation dropped to 94% during sleep. Consider consulting your doctor if this continues.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Charts: Weekly Activity + Heart Rate */}
            <div className="ht-charts-grid">
              <div className="ht-chart-card">
                <h4 className="ht-chart-title">Weekly Activity</h4>
                <p className="ht-chart-subtitle">Steps and sleep hours over the last 7 days</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyActivityData} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3e8ff" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <Tooltip />
                    <Bar dataKey="steps" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="ht-chart-card">
                <h4 className="ht-chart-title">Heart Rate Trends</h4>
                <p className="ht-chart-subtitle">Average resting heart rate this week</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={heartRateData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3e8ff" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="hr" stroke="#a855f7" strokeWidth={2} dot={{ r: 4, fill: '#a855f7' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts: Sleep Pattern + Mood Heatmap */}
            <div className="ht-charts-grid">
              <div className="ht-chart-card">
                <h4 className="ht-chart-title">Sleep Pattern</h4>
                <p className="ht-chart-subtitle">Hours of sleep per night</p>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={sleepData}>
                    <defs>
                      <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3e8ff" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} domain={[0, 10]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="hours" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#sleepGrad)" dot={{ r: 4, fill: '#14b8a6' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="ht-chart-card">
                <h4 className="ht-chart-title">Mood Heatmap</h4>
                <p className="ht-chart-subtitle">Your mood variations this week</p>
                <div className="ht-mood-row">
                  {moodWeek.map((m, i) => (
                    <div key={i} className="ht-mood-cell" style={{ background: moodColors[m.score] || '#a855f7' }}>
                      {m.score}
                      <span className="mood-date">{m.date}</span>
                    </div>
                  ))}
                </div>
                <div className="ht-mood-legend">
                  {Object.entries(moodLabels).map(([k, v]) => (
                    <span key={k} className="ht-mood-legend-item">
                      <span className="ht-mood-legend-dot" style={{ background: moodColors[k] }} />
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Vitals */}
        {tab === "vitals" && (
          <section>
            {/* Log New Vitals card */}
            <div className="vt-card">
              <div className="vt-card-header">
                <h3 className="vt-card-title">Log New Vitals</h3>
                <p className="vt-card-subtitle">Enter your latest measurements</p>
              </div>
              <form className="vt-form" onSubmit={submitVital}>
                <div className="vt-grid vt-grid-3">
                  <label className="vt-field">
                    <span className="vt-label">Date</span>
                    <input type="date" value={vitalForm.recordedAt} onChange={e=>setVitalForm({...vitalForm, recordedAt:e.target.value})} required max={new Date().toISOString().split('T')[0]} />
                  </label>
                  <label className="vt-field">
                    <span className="vt-label">Weight (kg)</span>
                    <input type="number" step="0.1" placeholder="0.0" value={vitalForm.weightKg} onChange={e=>setVitalForm({...vitalForm, weightKg:e.target.value})} />
                  </label>
                  <label className="vt-field">
                    <span className="vt-label">Height (cm)</span>
                    <input type="number" step="0.1" placeholder="0" value={vitalForm.heightCm} onChange={e=>setVitalForm({...vitalForm, heightCm:e.target.value})} />
                  </label>
                </div>
                <div className="vt-grid vt-grid-3">
                  <label className="vt-field">
                    <span className="vt-label">Blood Pressure</span>
                    <input
                      type="text"
                      placeholder="120/80"
                      value={vitalForm.systolic && vitalForm.diastolic ? `${vitalForm.systolic}/${vitalForm.diastolic}` : vitalForm.systolic ? `${vitalForm.systolic}/` : ''}
                      onChange={e => {
                        const val = e.target.value;
                        const parts = val.split('/');
                        setVitalForm({
                          ...vitalForm,
                          systolic: parts[0] ? parts[0].replace(/[^0-9]/g, '') : '',
                          diastolic: parts[1] !== undefined ? parts[1].replace(/[^0-9]/g, '') : ''
                        });
                      }}
                    />
                  </label>
                  <label className="vt-field">
                    <span className="vt-label">Heart Rate (bpm)</span>
                    <input type="number" placeholder="72" value={vitalForm.heartRateBpm} onChange={e=>setVitalForm({...vitalForm, heartRateBpm:e.target.value})} />
                  </label>
                  <label className="vt-field">
                    <span className="vt-label">Blood Sugar (mg/dL)</span>
                    <input type="number" step="0.1" placeholder="0" value={vitalForm.bloodSugar} onChange={e=>setVitalForm({...vitalForm, bloodSugar:e.target.value})} />
                  </label>
                </div>
                <div className="vt-grid vt-grid-2">
                  <label className="vt-field">
                    <span className="vt-label">Iron (g/dL)</span>
                    <input type="number" step="0.1" placeholder="0.0" value={vitalForm.ironLevel} onChange={e=>setVitalForm({...vitalForm, ironLevel:e.target.value})} />
                  </label>
                  <label className="vt-field">
                    <span className="vt-label">Cholesterol (mg/dL)</span>
                    <input type="number" step="0.1" placeholder="0" value={vitalForm.cholesterol} onChange={e=>setVitalForm({...vitalForm, cholesterol:e.target.value})} />
                  </label>
                </div>
                <label className="vt-field vt-field-full">
                  <span className="vt-label">Notes</span>
                  <textarea rows="2" placeholder="Any additional observations..." value={vitalForm.notes} onChange={e=>setVitalForm({...vitalForm, notes:e.target.value})} />
                </label>
                <div className="vt-form-actions">
                  <button type="submit" className="vt-btn-save">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13.3 4.7l-6 6L4 7.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Save Vitals
                  </button>
                  <button type="button" className="vt-btn-export" onClick={()=>exportCSV(vitals, "vitals.csv")}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Export CSV
                  </button>
                </div>
              </form>
            </div>

            {/* BP Trend + BMI Calculation */}
            <div className="ht-charts-grid" style={{ marginTop: 24 }}>
              <div className="ht-chart-card">
                <h4 className="ht-chart-title">Blood Pressure Trend</h4>
                <p className="ht-chart-subtitle">Systolic and diastolic over time</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={vitals.slice(0, 8).reverse().map(v => ({
                    date: new Date(v.recordedAt || v.createdAt).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
                    systolic: v.systolic || null,
                    diastolic: v.diastolic || null,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3e8ff" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} domain={[50, 160]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="systolic" stroke="#ec4899" strokeWidth={2} dot={{ r: 3, fill: '#ec4899' }} name="Systolic" />
                    <Line type="monotone" dataKey="diastolic" stroke="#a855f7" strokeWidth={2} dot={{ r: 3, fill: '#a855f7' }} name="Diastolic" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="vt-bmi-card">
                <h4 className="ht-chart-title">BMI Calculation</h4>
                <p className="ht-chart-subtitle">Based on your latest measurements</p>
                <div className="vt-bmi-value">{bmi || latestVital?.bmi || '—'}</div>
                <div className="vt-bmi-label">Body Mass Index</div>
                <table className="vt-bmi-table">
                  <tbody>
                    <tr><td>Underweight</td><td>&lt; 18.5</td></tr>
                    <tr><td>Normal weight</td><td>18.5 - 24.9</td></tr>
                    <tr><td>Overweight</td><td>25 - 29.9</td></tr>
                    <tr><td>Obese</td><td>&ge; 30</td></tr>
                  </tbody>
                </table>
                <div className="vt-bmi-badge">
                  {(() => {
                    const b = parseFloat(bmi || latestVital?.bmi);
                    if (!b || isNaN(b)) return 'Enter measurements';
                    if (b < 18.5) return 'Underweight';
                    if (b < 25) return 'Normal Weight Range';
                    if (b < 30) return 'Overweight';
                    return 'Obese';
                  })()}
                </div>
              </div>
            </div>

            {/* Vitals History */}
            <div className="vt-card" style={{ marginTop: 24 }}>
              <div className="vt-card-header">
                <h3 className="vt-card-title">Vitals History</h3>
                <p className="vt-card-subtitle">All your recorded measurements</p>
              </div>
              <div className="vt-table-wrap">
                <table className="vt-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Weight</th>
                      <th>Height</th>
                      <th>BP</th>
                      <th>HR</th>
                      <th>Blood Sugar</th>
                      <th>Iron</th>
                      <th>Cholesterol</th>
                      <th>BMI</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vitals.length === 0 && (<tr><td colSpan="10" className="vt-empty">No vitals recorded yet. Log your first entry above.</td></tr>)}
                    {vitals.map(v => (
                      <tr key={v._id}>
                        <td>{new Date(v.recordedAt || v.createdAt).toLocaleDateString('en-CA')}</td>
                        <td>{v.weightKg ? `${v.weightKg} kg` : '—'}</td>
                        <td>{v.heightCm ? `${v.heightCm} cm` : '—'}</td>
                        <td>{v.systolic && v.diastolic ? `${v.systolic}/${v.diastolic}` : '—'}</td>
                        <td>{v.heartRateBpm ? `${v.heartRateBpm} bpm` : '—'}</td>
                        <td>{v.bloodSugar ? `${v.bloodSugar} mg/dL` : '—'}</td>
                        <td>{v.ironLevel ? `${v.ironLevel} g/dL` : '—'}</td>
                        <td>{v.cholesterol ? `${v.cholesterol} mg/dL` : '—'}</td>
                        <td>{v.bmi || '—'}</td>
                        <td>
                          <div className="vt-actions">
                            <button className="vt-icon-btn vt-icon-edit" onClick={() => editVital(v)} title="Edit">
                              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                            <button className="vt-icon-btn vt-icon-delete" onClick={() => deleteVital(v._id)} title="Delete">
                              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4m2 0v9.33a1.33 1.33 0 01-1.34 1.34H4.67a1.33 1.33 0 01-1.34-1.34V4h9.34z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Symptoms */}
        {tab === "symptoms" && (
          <section>
            {/* Log New Symptom */}
            <div className="vt-card">
              <div className="vt-card-header">
                <h3 className="vt-card-title">Log New Symptom</h3>
                <p className="vt-card-subtitle">Record any symptoms you're experiencing</p>
              </div>
              <form className="vt-form" onSubmit={submitSymptom}>
                <div className="vt-grid vt-grid-2">
                  <label className="vt-field">
                    <span className="vt-label">Date</span>
                    <input type="date" value={symForm.date} onChange={e=>setSymForm({...symForm, date:e.target.value})} required max={new Date().toISOString().split('T')[0]} />
                  </label>
                  <label className="vt-field">
                    <span className="vt-label">Symptoms (comma-separated)</span>
                    <input type="text" placeholder="e.g., Headache, Fatigue, Nausea" value={symForm.tags} onChange={e=>setSymForm({...symForm, tags:e.target.value})} />
                  </label>
                </div>
                <div className="sym-severity-block">
                  <div className="sym-severity-header">
                    <span className="vt-label">Severity: {symForm.severity}/5</span>
                    <span className="sym-severity-label">{Number(symForm.severity) <= 2 ? 'Mild' : Number(symForm.severity) <= 4 ? 'Moderate' : 'Severe'}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={symForm.severity}
                    onChange={e=>setSymForm({...symForm, severity:e.target.value})}
                    className="sym-slider"
                    style={{ '--slider-pct': `${((Number(symForm.severity) - 1) / 4) * 100}%` }}
                  />
                  <div className="sym-severity-labels">
                    <span>1 (Minimal)</span>
                    <span>3 (Moderate)</span>
                    <span>5 (Severe)</span>
                  </div>
                </div>
                <label className="vt-field vt-field-full">
                  <span className="vt-label">Notes</span>
                  <textarea rows="2" placeholder="Describe your symptoms, triggers, or any relevant details..." value={symForm.notes} onChange={e=>setSymForm({...symForm, notes:e.target.value})} />
                </label>
                <div className="vt-form-actions">
                  <button type="submit" className="vt-btn-save">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13.3 4.7l-6 6L4 7.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Save Symptom
                  </button>
                </div>
              </form>
            </div>

            {/* Symptom Frequency Chart */}
            <div className="ht-chart-card" style={{ marginTop: 24 }}>
              <h4 className="ht-chart-title">Symptom Frequency</h4>
              <p className="ht-chart-subtitle">Most common symptoms this month</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={(() => {
                  const freq = {};
                  symptoms.forEach(s => (s.tags || []).forEach(t => { freq[t] = (freq[t] || 0) + 1; }));
                  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, count]) => ({ name, count }));
                })()} barSize={48}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3e8ff" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ec4899" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Symptom Log Table */}
            <div className="vt-card" style={{ marginTop: 24 }}>
              <div className="vt-card-header">
                <h3 className="vt-card-title">Symptom Log</h3>
                <p className="vt-card-subtitle">All recorded symptoms</p>
              </div>
              <div className="vt-table-wrap">
                <table className="vt-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Symptoms</th>
                      <th>Severity</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {symptoms.length === 0 && (<tr><td colSpan="5" className="vt-empty">No symptoms recorded yet.</td></tr>)}
                    {symptoms.map(s => (
                      <tr key={s._id}>
                        <td>{new Date(s.date || s.createdAt).toLocaleDateString('en-CA')}</td>
                        <td>
                          <div className="sym-tags">
                            {(s.tags || []).map((t, i) => (
                              <span key={i} className="sym-tag">{t}</span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className={`sym-severity-badge ${s.severity <= 2 ? 'mild' : s.severity <= 4 ? 'moderate' : 'severe'}`}>
                            {s.severity}/5 - {s.severity <= 2 ? 'Mild' : s.severity <= 4 ? 'Moderate' : 'Severe'}
                          </span>
                        </td>
                        <td>{s.notes || '—'}</td>
                        <td>
                          <div className="vt-actions">
                            <button className="vt-icon-btn vt-icon-edit" onClick={() => editSymptom(s)} title="Edit">
                              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                            <button className="vt-icon-btn vt-icon-delete" onClick={() => deleteSymptom(s._id)} title="Delete">
                              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4m2 0v9.33a1.33 1.33 0 01-1.34 1.34H4.67a1.33 1.33 0 01-1.34-1.34V4h9.34z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Vaccinations */}
        {tab === "vaccinations" && (
          <section>
            {/* Log New Vaccination */}
            <div className="vt-card">
              <div className="vt-card-header">
                <h3 className="vt-card-title">Log New Vaccination</h3>
                <p className="vt-card-subtitle">Record vaccination details</p>
              </div>
              <form className="vt-form" onSubmit={submitVacc}>
                <div className="vt-grid vt-grid-2">
                  <label className="vt-field">
                    <span className="vt-label">Vaccine Name</span>
                    <input type="text" placeholder="e.g., COVID-19 Booster" value={vaccForm.name} onChange={e=>setVaccForm({...vaccForm, name:e.target.value})} required />
                  </label>
                  <label className="vt-field">
                    <span className="vt-label">Date Administered</span>
                    <input type="date" value={vaccForm.date} onChange={e=>setVaccForm({...vaccForm, date:e.target.value})} required max={new Date().toISOString().split('T')[0]} />
                  </label>
                </div>
                <div className="vt-grid vt-grid-2">
                  <label className="vt-field">
                    <span className="vt-label">Lot Number</span>
                    <input type="text" placeholder="e.g., LOT12345" value={vaccForm.lotNumber} onChange={e=>setVaccForm({...vaccForm, lotNumber:e.target.value})} />
                  </label>
                  <label className="vt-field">
                    <span className="vt-label">Healthcare Provider</span>
                    <input type="text" placeholder="e.g., City Health Clinic" value={vaccForm.provider} onChange={e=>setVaccForm({...vaccForm, provider:e.target.value})} />
                  </label>
                </div>
                <label className="vt-field vt-field-full">
                  <span className="vt-label">Next Dose/Booster Due (Optional)</span>
                  <input type="date" value={vaccForm.nextDue} onChange={e=>setVaccForm({...vaccForm, nextDue:e.target.value})} />
                </label>
                <label className="vt-field vt-field-full">
                  <span className="vt-label">Notes</span>
                  <textarea rows="2" placeholder="Any side effects or additional information..." value={vaccForm.notes} onChange={e=>setVaccForm({...vaccForm, notes:e.target.value})} />
                </label>
                <div className="vt-form-actions">
                  <button type="submit" className="vt-btn-save">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13.3 4.7l-6 6L4 7.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Save Vaccination
                  </button>
                  <button type="button" className="vt-btn-export" onClick={()=>exportCSV(vaccs, "vaccinations.csv")}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M14 10v3.33A1.33 1.33 0 0112.67 14.67H3.33A1.33 1.33 0 012 13.33V10M4.67 6.67L8 10l3.33-3.33M8 10V2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Export CSV
                  </button>
                </div>
              </form>
            </div>

            {/* Vaccination Timeline */}
            <div className="vt-card" style={{ marginTop: 24 }}>
              <div className="vt-card-header">
                <h3 className="vt-card-title">Vaccination Timeline</h3>
                <p className="vt-card-subtitle">Visual overview of your vaccination history</p>
              </div>
              <div className="vacc-timeline">
                {vaccs.length === 0 && <p className="vacc-timeline-empty">No vaccinations recorded yet.</p>}
                {vaccs.map((v, i) => (
                  <div key={v._id} className="vacc-timeline-item">
                    <div className="vacc-timeline-dot" />
                    {i < vaccs.length - 1 && <div className="vacc-timeline-line" />}
                    <div className="vacc-timeline-content">
                      <h4 className="vacc-timeline-name">{v.name}</h4>
                      <p className="vacc-timeline-meta">
                        {new Date(v.date || v.createdAt).toLocaleDateString('en-CA')}
                      </p>
                      <p className="vacc-timeline-meta">{v.provider || v.doctor || ''}</p>
                      {v.nextDue && (
                        <span className="vacc-next-due-badge">
                          Next due: {new Date(v.nextDue).toLocaleDateString('en-CA')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vaccination History Table */}
            <div className="vt-card" style={{ marginTop: 24 }}>
              <div className="vt-card-header">
                <h3 className="vt-card-title">Vaccination History</h3>
                <p className="vt-card-subtitle">Complete record of all vaccinations</p>
              </div>
              <div className="vt-table-wrap">
                <table className="vt-table">
                  <thead>
                    <tr>
                      <th>Vaccine</th>
                      <th>Date</th>
                      <th>Lot Number</th>
                      <th>Provider</th>
                      <th>Next Due</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vaccs.length === 0 && (<tr><td colSpan="7" className="vt-empty">No vaccinations recorded yet.</td></tr>)}
                    {vaccs.map(v => (
                      <tr key={v._id}>
                        <td>{v.name}</td>
                        <td>{new Date(v.date || v.createdAt).toLocaleDateString('en-CA')}</td>
                        <td>{v.lotNumber || '—'}</td>
                        <td>{v.provider || v.doctor || '—'}</td>
                        <td>{v.nextDue ? new Date(v.nextDue).toLocaleDateString('en-CA') : '—'}</td>
                        <td>{v.notes || '—'}</td>
                        <td>
                          <div className="vt-actions">
                            <button className="vt-icon-btn vt-icon-edit" onClick={() => editVaccination(v)} title="Edit">
                              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                            <button className="vt-icon-btn vt-icon-delete" onClick={() => deleteVaccination(v._id)} title="Delete">
                              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4m2 0v9.33a1.33 1.33 0 01-1.34 1.34H4.67a1.33 1.33 0 01-1.34-1.34V4h9.34z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Records */}
        {tab === "records" && (
          <section>
            {/* Upload New Record */}
            <div className="vt-card">
              <div className="vt-card-header">
                <h3 className="vt-card-title">Upload New Record</h3>
                <p className="vt-card-subtitle">Add a new medical document to your records</p>
              </div>
              <form className="vt-form" onSubmit={submitRecord}>
                <div className="vt-grid vt-grid-2">
                  <label className="vt-field">
                    <span className="vt-label">Document Title</span>
                    <input type="text" placeholder="e.g., Annual Health Checkup" value={recForm.title} onChange={e=>setRecForm({...recForm, title:e.target.value})} required />
                  </label>
                  <label className="vt-field">
                    <span className="vt-label">Category</span>
                    <select value={recForm.category} onChange={e=>setRecForm({...recForm, category:e.target.value})}>
                      <option value="other">Select category</option>
                      <option value="lab">Lab Results</option>
                      <option value="imaging">Imaging</option>
                      <option value="prescription">Prescriptions</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                </div>
                <label className="vt-field vt-field-full">
                  <span className="vt-label">Date</span>
                  <input type="date" value={recForm.takenAt} onChange={e=>setRecForm({...recForm, takenAt:e.target.value})} max={new Date().toISOString().split('T')[0]} />
                </label>
                <label className="vt-field vt-field-full">
                  <span className="vt-label">Upload File (PDF, Image)</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.gif" onChange={e => {
                    const file = e.target.files[0];
                    if (file) setRecForm({...recForm, fileUrl: file.name});
                  }} className="rec-file-input" />
                </label>
                <label className="vt-field vt-field-full">
                  <span className="vt-label">Notes</span>
                  <textarea rows="2" placeholder="Any additional details about this record..." value={recForm.notes} onChange={e=>setRecForm({...recForm, notes:e.target.value})} />
                </label>
                <div className="vt-form-actions">
                  <button type="submit" className="vt-btn-save">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13.3 4.7l-6 6L4 7.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Save Record
                  </button>
                </div>
              </form>
            </div>

            {/* Stats Cards */}
            <div className="rec-stats-row" style={{ marginTop: 24 }}>
              <div className="rec-stat-card">
                <div className="rec-stat-header">
                  <span className="rec-stat-label">Total Records</span>
                  <span className="rec-stat-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9.33 1.33H4a1.33 1.33 0 00-1.33 1.34v10.66A1.33 1.33 0 004 14.67h8a1.33 1.33 0 001.33-1.34V5.33l-4-4z" stroke="#a855f7" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.33 1.33v4h4" stroke="#a855f7" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </div>
                <div className="rec-stat-value">{records.length}</div>
                <div className="rec-stat-sub">Documents stored</div>
              </div>
              <div className="rec-stat-card">
                <div className="rec-stat-header">
                  <span className="rec-stat-label">Lab Results</span>
                  <span className="rec-stat-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9.33 1.33H4a1.33 1.33 0 00-1.33 1.34v10.66A1.33 1.33 0 004 14.67h8a1.33 1.33 0 001.33-1.34V5.33l-4-4z" stroke="#a855f7" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.33 1.33v4h4" stroke="#a855f7" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </div>
                <div className="rec-stat-value">{records.filter(r => r.category === 'lab').length}</div>
                <div className="rec-stat-sub">Test reports</div>
              </div>
              <div className="rec-stat-card">
                <div className="rec-stat-header">
                  <span className="rec-stat-label">Imaging</span>
                  <span className="rec-stat-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9.33 1.33H4a1.33 1.33 0 00-1.33 1.34v10.66A1.33 1.33 0 004 14.67h8a1.33 1.33 0 001.33-1.34V5.33l-4-4z" stroke="#a855f7" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.33 1.33v4h4" stroke="#a855f7" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </div>
                <div className="rec-stat-value">{records.filter(r => r.category === 'imaging').length}</div>
                <div className="rec-stat-sub">Scans & X-rays</div>
              </div>
              <div className="rec-stat-card">
                <div className="rec-stat-header">
                  <span className="rec-stat-label">Prescriptions</span>
                  <span className="rec-stat-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9.33 1.33H4a1.33 1.33 0 00-1.33 1.34v10.66A1.33 1.33 0 004 14.67h8a1.33 1.33 0 001.33-1.34V5.33l-4-4z" stroke="#a855f7" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.33 1.33v4h4" stroke="#a855f7" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </div>
                <div className="rec-stat-value">{records.filter(r => r.category === 'prescription').length}</div>
                <div className="rec-stat-sub">Active & past</div>
              </div>
            </div>

            {/* All Medical Records Table */}
            <div className="vt-card" style={{ marginTop: 24 }}>
              <div className="vt-card-header">
                <h3 className="vt-card-title">All Medical Records</h3>
                <p className="vt-card-subtitle">Complete list of your medical documents</p>
              </div>
              <div className="vt-table-wrap">
                <table className="vt-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>File</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length === 0 && (<tr><td colSpan="6" className="vt-empty">No medical records yet.</td></tr>)}
                    {records.map(r => (
                      <tr key={r._id}>
                        <td className="rec-title-cell">{r.title}</td>
                        <td>
                          <span className={`rec-cat-badge ${r.category === 'lab' ? 'lab' : r.category === 'imaging' ? 'imaging' : r.category === 'prescription' ? 'prescription' : 'other'}`}>
                            {r.category === 'lab' ? 'Lab Results' : r.category === 'imaging' ? 'Imaging' : r.category === 'prescription' ? 'Prescriptions' : 'Other'}
                          </span>
                        </td>
                        <td>{r.takenAt ? new Date(r.takenAt).toLocaleDateString('en-CA') : '—'}</td>
                        <td className="rec-file-cell">{r.fileUrl || '—'}</td>
                        <td>{r.notes || '—'}</td>
                        <td>
                          <div className="vt-actions">
                            {r.fileUrl && (
                              <>
                                <a href={r.fileUrl} target="_blank" rel="noreferrer" className="vt-icon-btn rec-icon-view" title="View">
                                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/></svg>
                                </a>
                                <a href={r.fileUrl} download className="vt-icon-btn rec-icon-download" title="Download">
                                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M14 10v3.33A1.33 1.33 0 0112.67 14.67H3.33A1.33 1.33 0 012 13.33V10M4.67 6.67L8 10l3.33-3.33M8 10V2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </a>
                              </>
                            )}
                            <button className="vt-icon-btn vt-icon-edit" onClick={() => editRecord(r)} title="Edit">
                              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                            <button className="vt-icon-btn vt-icon-delete" onClick={() => deleteRecord(r._id)} title="Delete">
                              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4m2 0v9.33a1.33 1.33 0 01-1.34 1.34H4.67a1.33 1.33 0 01-1.34-1.34V4h9.34z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Mood Logs */}
        {tab === "moodlogs" && (
          <section>
            {/* Log Today's Mood */}
            <div className="vt-card">
              <div className="vt-card-header">
                <h3 className="vt-card-title">Log Today's Mood</h3>
                <p className="vt-card-subtitle">How are you feeling today?</p>
              </div>
              <form className="vt-form" onSubmit={submitMoodLog}>
                <div className="vt-grid vt-grid-2">
                  <label className="vt-field">
                    <span className="vt-label">Date</span>
                    <input type="date" value={moodForm.date} onChange={e=>setMoodForm({...moodForm, date:e.target.value})} required max={new Date().toISOString().split('T')[0]} />
                  </label>
                  <label className="vt-field">
                    <span className="vt-label">Mood</span>
                    <select value={moodForm.mood} onChange={e=>setMoodForm({...moodForm, mood:e.target.value})} required>
                      <option value="">Select your mood</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Great">Great</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                      <option value="Happy">Happy</option>
                      <option value="Sad">Sad</option>
                      <option value="Neutral">Neutral</option>
                      <option value="Anxious">Anxious</option>
                      <option value="Angry">Angry</option>
                      <option value="Excited">Excited</option>
                      <option value="Tired">Tired</option>
                      <option value="Calm">Calm</option>
                    </select>
                  </label>
                </div>
                <label className="vt-field vt-field-full">
                  <span className="vt-label">Physical/Mental Symptoms</span>
                  <select value={moodForm.symptoms ? moodForm.symptoms.split(',')[0]?.trim() : ''} onChange={e=>setMoodForm({...moodForm, symptoms: e.target.value})}>
                    <option value="">Any symptoms?</option>
                    <option value="Headache">Headache</option>
                    <option value="Fatigue">Fatigue</option>
                    <option value="Anxiety">Anxiety</option>
                    <option value="Insomnia">Insomnia</option>
                    <option value="Nausea">Nausea</option>
                    <option value="Back Pain">Back Pain</option>
                    <option value="Slight fatigue">Slight fatigue</option>
                    <option value="None">None</option>
                  </select>
                </label>
                <label className="vt-field vt-field-full">
                  <span className="vt-label">Notes</span>
                  <textarea rows="2" placeholder="What influenced your mood today? Any triggers or positive events..." value={moodForm.notes} onChange={e=>setMoodForm({...moodForm, notes:e.target.value})} />
                </label>
                <div className="vt-form-actions">
                  <button type="submit" className="vt-btn-save">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13.3 4.7l-6 6L4 7.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Save Mood Entry
                  </button>
                </div>
              </form>
            </div>

            {/* Mood Heatmap Calendar */}
            <div className="vt-card" style={{ marginTop: 24 }}>
              <div className="vt-card-header">
                <h3 className="vt-card-title">Mood Heatmap Calendar</h3>
                <p className="vt-card-subtitle">Visual representation of your mood over time</p>
              </div>
              <div className="mood-cal-wrap">
                <div className="mood-cal-grid">
                  {(() => {
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = now.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const prevMonthDays = new Date(year, month, 0).getDate();
                    const cells = [];
                    const moodColor = (mood) => {
                      if (!mood) return '#e5e7eb';
                      const m = mood.toLowerCase();
                      if (m === 'excellent') return '#10b981';
                      if (m === 'great') return '#22c55e';
                      if (m === 'good' || m === 'happy' || m === 'excited' || m === 'calm') return '#84cc16';
                      if (m === 'fair' || m === 'neutral') return '#f59e0b';
                      if (m === 'poor' || m === 'sad' || m === 'tired') return '#ef4444';
                      if (m === 'anxious' || m === 'angry') return '#f97316';
                      return '#e5e7eb';
                    };
                    const moodEmoji = (mood) => {
                      if (!mood) return '';
                      const m = mood.toLowerCase();
                      if (m === 'excellent') return '😄';
                      if (m === 'great') return '😊';
                      if (m === 'good' || m === 'happy') return '🙂';
                      if (m === 'fair' || m === 'neutral') return '😐';
                      if (m === 'poor' || m === 'sad') return '😢';
                      if (m === 'anxious') return '😰';
                      if (m === 'angry') return '😠';
                      if (m === 'excited') return '🤩';
                      if (m === 'tired') return '😴';
                      if (m === 'calm') return '😌';
                      return '😐';
                    };
                    for (let i = 0; i < firstDay; i++) {
                      const d = prevMonthDays - firstDay + i + 1;
                      cells.push(<div key={`prev-${i}`} className="mood-cal-cell mood-cal-other"><span className="mood-cal-day">{d}</span></div>);
                    }
                    for (let d = 1; d <= daysInMonth; d++) {
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                      const log = moodLogs.find(l => new Date(l.date).toISOString().slice(0, 10) === dateStr);
                      const bg = log ? moodColor(log.mood) : '#e5e7eb';
                      cells.push(
                        <div key={d} className="mood-cal-cell" style={{ backgroundColor: bg }} title={log ? `${log.mood}` : `Day ${d}`}>
                          <span className="mood-cal-day">{d}</span>
                          {log && <span className="mood-cal-emoji">{moodEmoji(log.mood)}</span>}
                        </div>
                      );
                    }
                    const remaining = 7 - (cells.length % 7);
                    if (remaining < 7) {
                      for (let i = 1; i <= remaining; i++) {
                        cells.push(<div key={`next-${i}`} className="mood-cal-cell mood-cal-other"><span className="mood-cal-day">{i}</span></div>);
                      }
                    }
                    return cells;
                  })()}
                </div>
                <div className="mood-cal-legend">
                  <span className="mood-cal-legend-item"><span className="mood-cal-legend-dot" style={{ background: '#ef4444' }} />Poor</span>
                  <span className="mood-cal-legend-item"><span className="mood-cal-legend-dot" style={{ background: '#f59e0b' }} />Fair</span>
                  <span className="mood-cal-legend-item"><span className="mood-cal-legend-dot" style={{ background: '#84cc16' }} />Good</span>
                  <span className="mood-cal-legend-item"><span className="mood-cal-legend-dot" style={{ background: '#22c55e' }} />Great</span>
                  <span className="mood-cal-legend-item"><span className="mood-cal-legend-dot" style={{ background: '#10b981' }} />Excellent</span>
                </div>
              </div>
            </div>

            {/* Mood vs. Sleep & Activity Chart */}
            <div className="ht-chart-card" style={{ marginTop: 24 }}>
              <h4 className="ht-chart-title">Mood vs. Sleep & Activity</h4>
              <p className="ht-chart-subtitle">Discover correlations between your mood, sleep, and activity levels</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={(() => {
                  const last7 = moodLogs.slice(0, 7).reverse().map(log => {
                    const d = new Date(log.date || log.createdAt);
                    const moodVal = { Excellent: 5, Great: 4, Good: 3, Happy: 3, Calm: 3, Excited: 4, Fair: 2, Neutral: 2, Tired: 1, Sad: 1, Anxious: 1, Angry: 1, Poor: 1 };
                    return {
                      date: `${d.getMonth() + 1}/${d.getDate()}`,
                      mood: moodVal[log.mood] || 2,
                      sleep: Math.floor(Math.random() * 3) + 6
                    };
                  });
                  return last7.length ? last7 : [{ date: 'No data', mood: 0, sleep: 0 }];
                })()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3e8ff" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} domain={[0, 5]} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="mood" stroke="#ec4899" strokeWidth={2} dot={{ r: 4, fill: '#fff', stroke: '#ec4899', strokeWidth: 2 }} name="Mood" />
                  <Line yAxisId="right" type="monotone" dataKey="sleep" stroke="#14b8a6" strokeWidth={2} dot={{ r: 4, fill: '#fff', stroke: '#14b8a6', strokeWidth: 2 }} name="Sleep (hrs)" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mood-insight-bar">
                <span className="mood-insight-icon">💡</span>
                <span><strong>Insight:</strong> Your mood tends to improve with better sleep. Consider maintaining 7-8 hours of sleep for optimal wellbeing.</span>
              </div>
            </div>

            {/* Mood History Table */}
            <div className="vt-card" style={{ marginTop: 24 }}>
              <div className="vt-card-header">
                <h3 className="vt-card-title">Mood History</h3>
                <p className="vt-card-subtitle">All your mood entries</p>
              </div>
              <div className="vt-table-wrap">
                <table className="vt-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Mood</th>
                      <th>Symptoms</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moodLogs.length === 0 && (<tr><td colSpan="5" className="vt-empty">No mood entries yet.</td></tr>)}
                    {moodLogs.map(m => {
                      const moodClass = (() => {
                        const mo = (m.mood || '').toLowerCase();
                        if (['excellent', 'great', 'happy', 'excited'].includes(mo)) return 'great';
                        if (['good', 'calm'].includes(mo)) return 'good';
                        if (['fair', 'neutral', 'tired'].includes(mo)) return 'fair';
                        return 'poor';
                      })();
                      const moodEmoji = (() => {
                        const mo = (m.mood || '').toLowerCase();
                        if (mo === 'excellent') return '😄';
                        if (mo === 'great' || mo === 'happy') return '😊';
                        if (mo === 'good' || mo === 'calm') return '🙂';
                        if (mo === 'fair' || mo === 'neutral') return '😐';
                        if (mo === 'excited') return '🤩';
                        if (mo === 'tired') return '😴';
                        if (mo === 'sad') return '😢';
                        if (mo === 'anxious') return '😰';
                        if (mo === 'angry') return '😠';
                        return '😐';
                      })();
                      return (
                        <tr key={m._id}>
                          <td>{new Date(m.date || m.createdAt).toLocaleDateString('en-CA')}</td>
                          <td>
                            <span className={`mood-badge ${moodClass}`}>
                              <span className="mood-badge-emoji">{moodEmoji}</span>
                              {m.mood}
                            </span>
                          </td>
                          <td>{(m.symptoms || []).join(", ") || 'None'}</td>
                          <td>{m.notes || '—'}</td>
                          <td>
                            <div className="vt-actions">
                              <button className="vt-icon-btn vt-icon-edit" onClick={() => editMoodLog(m)} title="Edit">
                                <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </button>
                              <button className="vt-icon-btn vt-icon-delete" onClick={() => deleteMoodLog(m._id)} title="Delete">
                                <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4m2 0v9.33a1.33 1.33 0 01-1.34 1.34H4.67a1.33 1.33 0 01-1.34-1.34V4h9.34z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Lifestyle */}
        {tab === "lifestyle" && (() => {
          const weekExerciseMin = exercises.slice(-7).reduce((s, e) => s + (e.duration || 0), 0);
          const goalMin = 350;
          const avgSleep = sleepLogs.length > 0 ? (sleepLogs.slice(-7).reduce((s, l) => s + (l.sleepHours || 0), 0) / Math.min(7, sleepLogs.length)).toFixed(1) : '0';
          const avgCal = nutritionLogs.length > 0 ? Math.round(nutritionLogs.slice(-7).reduce((s, n) => s + (n.calories || 0), 0) / Math.min(7, nutritionLogs.length)) : 0;
          const avgProtein = nutritionLogs.length > 0 ? Math.round(nutritionLogs.slice(-7).reduce((s, n) => s + (n.protein || 0), 0) / Math.min(7, nutritionLogs.length)) : 0;
          const avgCarbs = nutritionLogs.length > 0 ? Math.round(nutritionLogs.slice(-7).reduce((s, n) => s + (n.carbs || 0), 0) / Math.min(7, nutritionLogs.length)) : 0;
          const avgFat = nutritionLogs.length > 0 ? Math.round(nutritionLogs.slice(-7).reduce((s, n) => s + (n.fat || 0), 0) / Math.min(7, nutritionLogs.length)) : 0;
          const qualityMap = { Poor: 40, Fair: 60, Good: 80, Excellent: 100 };
          const avgQuality = sleepLogs.length > 0 ? (sleepLogs.slice(-7).reduce((s, l) => s + (qualityMap[l.quality] || 60), 0) / Math.min(7, sleepLogs.length)).toFixed(1) : '0';
          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const exerciseChartData = days.map(d => {
            const dayExercises = exercises.filter(e => { const dt = new Date(e.date || e.createdAt); return days[dt.getDay() === 0 ? 6 : dt.getDay() - 1] === d; });
            return { day: d, minutes: dayExercises.reduce((s, e) => s + (e.duration || 0), 0) };
          });
          const sleepChartData = days.map(d => {
            const dayLogs = sleepLogs.filter(l => { const dt = new Date(l.date || l.createdAt); return days[dt.getDay() === 0 ? 6 : dt.getDay() - 1] === d; });
            const hrs = dayLogs.length ? dayLogs.reduce((s, l) => s + (l.sleepHours || 0), 0) / dayLogs.length : 0;
            const q = dayLogs.length ? dayLogs.reduce((s, l) => s + (qualityMap[l.quality] || 60), 0) / dayLogs.length : 0;
            return { day: d, hours: parseFloat(hrs.toFixed(1)), quality: parseFloat(q.toFixed(0)) };
          });
          const nutritionChartData = days.map(d => {
            const dayLogs = nutritionLogs.filter(n => { const dt = new Date(n.date || n.createdAt); return days[dt.getDay() === 0 ? 6 : dt.getDay() - 1] === d; });
            const cal = dayLogs.length ? dayLogs.reduce((s, n) => s + (n.calories || 0), 0) : 0;
            const pro = dayLogs.length ? dayLogs.reduce((s, n) => s + (n.protein || 0), 0) : 0;
            return { day: d, calories: cal, protein: pro };
          });
          const streakDays = exercises.length > 0 ? Math.min(exercises.length, 14) : 0;
          const sleepStreakDays = sleepLogs.filter(l => (l.sleepHours || 0) >= 7).length;
          const nutritionStreakDays = nutritionLogs.length > 0 ? Math.min(nutritionLogs.length, 21) : 0;
          const exerciseDaysThisWeek = Math.min(exercises.slice(-7).length, 7);
          const sleepDaysThisWeek = Math.min(sleepLogs.slice(-7).filter(l => (l.sleepHours || 0) >= 7).length, 7);
          const nutritionDaysThisWeek = Math.min(nutritionLogs.slice(-7).length, 7);

          return (
          <section>
            {/* Stats Cards Row */}
            <div className="ls-stats-row">
              <div className="ls-stat-card">
                <div className="ls-stat-header">
                  <span className="ls-stat-label">Exercise</span>
                  <span className="ls-stat-icon pink"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 4v16M7 4v16M3 8h4M17 8h4M3 16h4M17 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span>
                </div>
                <div className="ls-stat-value">{weekExerciseMin} min</div>
                <div className="ls-stat-sub">This week</div>
                <div className="ls-progress-bar"><div className="ls-progress-fill" style={{ width: `${Math.min((weekExerciseMin / goalMin) * 100, 100)}%` }} /></div>
                <div className="ls-stat-sub" style={{ marginTop: 4 }}>Goal: {goalMin} min/week</div>
              </div>
              <div className="ls-stat-card">
                <div className="ls-stat-header">
                  <span className="ls-stat-label">Sleep</span>
                  <span className="ls-stat-icon teal"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                </div>
                <div className="ls-stat-value">{avgSleep} hrs</div>
                <div className="ls-stat-sub">Avg this week</div>
                <span className="ls-badge teal">Good Quality</span>
              </div>
              <div className="ls-stat-card">
                <div className="ls-stat-header">
                  <span className="ls-stat-label">Nutrition</span>
                  <span className="ls-stat-icon teal"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span>
                </div>
                <div className="ls-stat-value">{avgCal.toLocaleString()} cal</div>
                <div className="ls-stat-sub">Daily average</div>
                <span className="ls-badge green">Balanced Diet</span>
              </div>
              <div className="ls-stat-card">
                <div className="ls-stat-header">
                  <span className="ls-stat-label">Streaks</span>
                  <span className="ls-stat-icon pink"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2l1.09 6.56L18 6l-2.56 4.91L22 12l-6.56 1.09L18 18l-4.91-2.56L12 22l-1.09-6.56L6 18l2.56-4.91L2 12l6.56-1.09L6 6l4.91 2.56L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                </div>
                <div className="ls-stat-value">{streakDays} days</div>
                <div className="ls-stat-sub">Current streak</div>
                <span className="ls-badge red">On Fire!</span>
              </div>
            </div>

            {/* AI Lifestyle Recommendations */}
            <div className="vt-card" style={{ marginTop: 24 }}>
              <div style={{ padding: '20px 24px' }}>
                <h3 className="ls-ai-title">
                  <span className="ls-ai-icon">🤖</span>
                  AI Lifestyle Recommendations
                </h3>
                <div className="ls-ai-item">
                  <span className="ls-ai-item-icon pink">🏃‍♀️</span>
                  <div>
                    <strong>Exercise Suggestion</strong>
                    <p>You missed your Thursday workout. Try a 30-minute yoga session to stay on track with your weekly goal.</p>
                  </div>
                </div>
                <div className="ls-ai-item">
                  <span className="ls-ai-item-icon teal">😴</span>
                  <div>
                    <strong>Sleep Optimization</strong>
                    <p>Your sleep quality improved on weekends. Consider maintaining your weekend bedtime routine on weekdays.</p>
                  </div>
                </div>
                <div className="ls-ai-item">
                  <span className="ls-ai-item-icon green">🥗</span>
                  <div>
                    <strong>Nutrition Tip</strong>
                    <p>Your protein intake is excellent! Consider adding more leafy greens for iron and vitamins.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Exercise Log & Sleep Pattern Charts */}
            <div className="ht-charts-grid" style={{ marginTop: 24 }}>
              <div className="ht-chart-card">
                <h4 className="ht-chart-title"><span style={{ marginRight: 6 }}>🏃‍♀️</span>Exercise Log</h4>
                <p className="ht-chart-subtitle">Weekly activity minutes</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={exerciseChartData} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3e8ff" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <Tooltip />
                    <Bar dataKey="minutes" fill="#ec4899" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="ls-chart-footer">
                  <span>Weekly Total: <strong>{weekExerciseMin} minutes</strong></span>
                  <span>Goal Progress: <strong style={{ color: '#ec4899' }}>{goalMin > 0 ? ((weekExerciseMin / goalMin) * 100).toFixed(1) : 0}%</strong></span>
                </div>
              </div>
              <div className="ht-chart-card">
                <h4 className="ht-chart-title"><span style={{ marginRight: 6 }}>😴</span>Sleep Pattern</h4>
                <p className="ht-chart-subtitle">Hours and quality score</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={sleepChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3e8ff" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} domain={[0, 12]} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} domain={[0, 100]} />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="hours" stroke="#14b8a6" strokeWidth={2} dot={{ r: 4, fill: '#fff', stroke: '#14b8a6', strokeWidth: 2 }} name="Hours" />
                    <Line yAxisId="right" type="monotone" dataKey="quality" stroke="#a855f7" strokeWidth={2} dot={{ r: 4, fill: '#fff', stroke: '#a855f7', strokeWidth: 2 }} name="Quality %" />
                  </LineChart>
                </ResponsiveContainer>
                <div className="ls-chart-footer">
                  <span>Avg Sleep: <strong>{avgSleep} hours/night</strong></span>
                  <span>Avg Quality: <strong style={{ color: '#ec4899' }}>{avgQuality}%</strong></span>
                </div>
              </div>
            </div>

            {/* Nutrition Overview Chart */}
            <div className="ht-chart-card" style={{ marginTop: 24 }}>
              <h4 className="ht-chart-title"><span style={{ marginRight: 6 }}>🥗</span>Nutrition Overview</h4>
              <p className="ht-chart-subtitle">Daily calorie and macronutrient intake</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={nutritionChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3e8ff" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="calories" stroke="#ec4899" strokeWidth={2} dot={{ r: 4, fill: '#fff', stroke: '#ec4899', strokeWidth: 2 }} name="Calories" />
                  <Line type="monotone" dataKey="protein" stroke="#14b8a6" strokeWidth={2} dot={{ r: 4, fill: '#fff', stroke: '#14b8a6', strokeWidth: 2 }} name="Protein (g)" />
                </LineChart>
              </ResponsiveContainer>
              <div className="ls-macro-row">
                <div className="ls-macro-item"><span className="ls-macro-val pink">{avgCal.toLocaleString()}</span><span className="ls-macro-label">Avg Calories</span></div>
                <div className="ls-macro-item"><span className="ls-macro-val teal">{avgProtein}g</span><span className="ls-macro-label">Avg Protein</span></div>
                <div className="ls-macro-item"><span className="ls-macro-val orange">{avgCarbs}g</span><span className="ls-macro-label">Avg Carbs</span></div>
                <div className="ls-macro-item"><span className="ls-macro-val pink">{avgFat}g</span><span className="ls-macro-label">Avg Fats</span></div>
              </div>
            </div>

            {/* Habit Streaks */}
            <div className="vt-card" style={{ marginTop: 24 }}>
              <div style={{ padding: '20px 24px' }}>
                <h3 className="ls-ai-title">
                  <span className="ls-ai-icon">🎯</span>
                  Habit Streaks
                </h3>
                <p className="vt-card-subtitle" style={{ marginTop: -8, marginBottom: 16 }}>Track your consistency</p>
                <div className="ls-streak-item">
                  <span className="ls-streak-icon pink">🏃‍♀️</span>
                  <div className="ls-streak-info">
                    <strong>Daily Exercise</strong>
                    <span>{exerciseDaysThisWeek}/7 days this week</span>
                  </div>
                  <div className="ls-streak-val">
                    <span className="ls-streak-num pink">{streakDays}</span>
                    <span className="ls-streak-label">day streak</span>
                  </div>
                </div>
                <div className="ls-streak-item">
                  <span className="ls-streak-icon teal">😴</span>
                  <div className="ls-streak-info">
                    <strong>Sleep 7+ Hours</strong>
                    <span>{sleepDaysThisWeek}/7 days this week</span>
                  </div>
                  <div className="ls-streak-val">
                    <span className="ls-streak-num teal">{sleepStreakDays}</span>
                    <span className="ls-streak-label">day streak</span>
                  </div>
                </div>
                <div className="ls-streak-item">
                  <span className="ls-streak-icon green">🥗</span>
                  <div className="ls-streak-info">
                    <strong>Balanced Meals</strong>
                    <span>{nutritionDaysThisWeek}/7 days this week</span>
                  </div>
                  <div className="ls-streak-val">
                    <span className="ls-streak-num green">{nutritionStreakDays}</span>
                    <span className="ls-streak-label">day streak</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trends & Insights */}
            <div className="vt-card" style={{ marginTop: 24 }}>
              <div style={{ padding: '20px 24px' }}>
                <h3 className="ls-ai-title">
                  <span className="ls-ai-icon">📈</span>
                  Trends & Insights
                </h3>
                <div className="ls-trend-item">
                  <span className="ls-trend-badge green">↑ Improving</span>
                  <span>Your exercise consistency improved by 25% this month</span>
                </div>
                <div className="ls-trend-item">
                  <span className="ls-trend-badge green">↑ Improving</span>
                  <span>Sleep quality is up 15% compared to last week</span>
                </div>
                <div className="ls-trend-item">
                  <span className="ls-trend-badge blue">✓ Stable</span>
                  <span>Nutrition balance has been consistent - keep it up!</span>
                </div>
              </div>
            </div>

            {/* Data Entry Sections (collapsible) */}
            <div style={{ marginTop: 32 }}>
              <div className="lifestyle-category">
                <div className="category-header" onClick={() => setLifestyleExpanded({...lifestyleExpanded, exercise: !lifestyleExpanded.exercise})}>
                  <h4>🏃‍♀️ Log Exercise</h4>
                  <span>{lifestyleExpanded.exercise ? '▼' : '▶'}</span>
                </div>
                {lifestyleExpanded.exercise && (
                  <>
                    <form className="hv-form" onSubmit={submitExercise}>
                      <div className="row">
                        <label>Type
                          <select value={exerciseForm.type} onChange={e=>setExerciseForm({...exerciseForm, type:e.target.value})} required>
                            <option value="">Select Type</option>
                            <option value="Yoga">Yoga</option>
                            <option value="Running">Running</option>
                            <option value="Walking">Walking</option>
                            <option value="Strength Training">Strength Training</option>
                            <option value="Cycling">Cycling</option>
                            <option value="Others">Others</option>
                          </select>
                        </label>
                        <label>Duration (min)
                          <input type="number" value={exerciseForm.duration} onChange={e=>setExerciseForm({...exerciseForm, duration:e.target.value})} required />
                        </label>
                        <label>Intensity
                          <select value={exerciseForm.intensity} onChange={e=>setExerciseForm({...exerciseForm, intensity:e.target.value})}>
                            <option value="Low">Low</option>
                            <option value="Medium">Moderate</option>
                            <option value="High">High</option>
                          </select>
                        </label>
                        <label>Calories Burned
                          <input type="number" value={exerciseForm.caloriesBurned} onChange={e=>setExerciseForm({...exerciseForm, caloriesBurned:e.target.value})} />
                        </label>
                        <label>Date
                          <input type="date" value={exerciseForm.date} onChange={e=>setExerciseForm({...exerciseForm, date:e.target.value})} required max={new Date().toISOString().split('T')[0]} />
                        </label>
                        <label className="grow">Notes
                          <input type="text" value={exerciseForm.notes} onChange={e=>setExerciseForm({...exerciseForm, notes:e.target.value})} />
                        </label>
                        <button type="submit" className="btn-primary">Save</button>
                      </div>
                    </form>
                    <div className="hv-list">
                      <div className="list-head">
                        <h5>Exercise logs</h5>
                        <button className="btn-ghost" onClick={()=>exportCSV(exercises, "exercises.csv")}>Export CSV</button>
                      </div>
                      <table>
                        <thead><tr><th>Date</th><th>Type</th><th>Duration</th><th>Intensity</th><th>Calories</th><th>Notes</th><th>Actions</th></tr></thead>
                        <tbody>
                          {exercises.length===0 && (<tr><td colSpan="7">No exercises yet.</td></tr>)}
                          {exercises.map(e => (
                            <tr key={e._id}>
                              <td>{new Date(e.date || e.createdAt).toLocaleDateString('en-CA')}</td>
                              <td>{e.type}</td><td>{e.duration} min</td><td>{e.intensity}</td><td>{e.caloriesBurned || '—'}</td><td>{e.notes || '—'}</td>
                              <td className="actions">
                                <button className="btn-edit" onClick={() => editExercise(e)} title="Edit">✏️ Edit</button>
                                <button className="btn-delete" onClick={() => deleteExercise(e._id)} title="Delete">🗑️ Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
              <div className="lifestyle-category">
                <div className="category-header" onClick={() => setLifestyleExpanded({...lifestyleExpanded, sleep: !lifestyleExpanded.sleep})}>
                  <h4>😴 Log Sleep</h4>
                  <span>{lifestyleExpanded.sleep ? '▼' : '▶'}</span>
                </div>
                {lifestyleExpanded.sleep && (
                  <>
                    <form className="hv-form" onSubmit={submitSleep}>
                      <div className="row">
                        <label>Sleep Hours<input type="number" step="0.5" value={sleepForm.sleepHours} onChange={e=>setSleepForm({...sleepForm, sleepHours:e.target.value})} required /></label>
                        <label>Quality
                          <select value={sleepForm.quality} onChange={e=>setSleepForm({...sleepForm, quality:e.target.value})}>
                            <option value="Poor">Poor</option><option value="Fair">Fair</option><option value="Good">Good</option><option value="Excellent">Excellent</option>
                          </select>
                        </label>
                        <label>Bedtime
                          <div className="time-input-group">
                            <input type="number" min="1" max="12" placeholder="HH" value={sleepForm.bedtimeHour} onChange={e=>setSleepForm({...sleepForm, bedtimeHour:e.target.value})} />
                            <span>:</span>
                            <input type="number" min="0" max="59" placeholder="MM" value={sleepForm.bedtimeMinute} onChange={e=>setSleepForm({...sleepForm, bedtimeMinute:e.target.value})} />
                            <select value={sleepForm.bedtimeAmPm} onChange={e=>setSleepForm({...sleepForm, bedtimeAmPm:e.target.value})}><option value="AM">AM</option><option value="PM">PM</option></select>
                          </div>
                        </label>
                        <label>Wake Time
                          <div className="time-input-group">
                            <input type="number" min="1" max="12" placeholder="HH" value={sleepForm.wakeTimeHour} onChange={e=>setSleepForm({...sleepForm, wakeTimeHour:e.target.value})} />
                            <span>:</span>
                            <input type="number" min="0" max="59" placeholder="MM" value={sleepForm.wakeTimeMinute} onChange={e=>setSleepForm({...sleepForm, wakeTimeMinute:e.target.value})} />
                            <select value={sleepForm.wakeTimeAmPm} onChange={e=>setSleepForm({...sleepForm, wakeTimeAmPm:e.target.value})}><option value="AM">AM</option><option value="PM">PM</option></select>
                          </div>
                        </label>
                        <label>Date<input type="date" value={sleepForm.date} onChange={e=>setSleepForm({...sleepForm, date:e.target.value})} required max={new Date().toISOString().split('T')[0]} /></label>
                        <label className="grow">Notes<input type="text" value={sleepForm.notes} onChange={e=>setSleepForm({...sleepForm, notes:e.target.value})} /></label>
                        <button type="submit" className="btn-primary">Save</button>
                      </div>
                    </form>
                    <div className="hv-list">
                      <div className="list-head"><h5>Sleep logs</h5><button className="btn-ghost" onClick={()=>exportCSV(sleepLogs, "sleep.csv")}>Export CSV</button></div>
                      <table>
                        <thead><tr><th>Date</th><th>Hours</th><th>Quality</th><th>Bedtime</th><th>Wake Time</th><th>Notes</th><th>Actions</th></tr></thead>
                        <tbody>
                          {sleepLogs.length===0 && (<tr><td colSpan="7">No sleep logs yet.</td></tr>)}
                          {sleepLogs.map(s => (
                            <tr key={s._id}>
                              <td>{new Date(s.date || s.createdAt).toLocaleDateString('en-CA')}</td>
                              <td>{s.sleepHours}</td><td>{s.quality}</td><td>{formatTimeForDisplay(s.bedtime)}</td><td>{formatTimeForDisplay(s.wakeTime)}</td><td>{s.notes || '—'}</td>
                              <td className="actions">
                                <button className="btn-edit" onClick={() => editSleep(s)} title="Edit">✏️ Edit</button>
                                <button className="btn-delete" onClick={() => deleteSleep(s._id)} title="Delete">🗑️ Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
              <div className="lifestyle-category">
                <div className="category-header" onClick={() => setLifestyleExpanded({...lifestyleExpanded, nutrition: !lifestyleExpanded.nutrition})}>
                  <h4>🥗 Log Nutrition</h4>
                  <span>{lifestyleExpanded.nutrition ? '▼' : '▶'}</span>
                </div>
                {lifestyleExpanded.nutrition && (
                  <>
                    <form className="hv-form" onSubmit={submitNutrition}>
                      <div className="row">
                        <label>Meal
                          <select value={nutritionForm.meal} onChange={e=>setNutritionForm({...nutritionForm, meal:e.target.value})} required>
                            <option value="">Select Meal</option><option value="Breakfast">Breakfast</option><option value="Lunch">Lunch</option><option value="Dinner">Dinner</option><option value="Snacks">Snacks</option>
                          </select>
                        </label>
                        <label>Calories<input type="number" value={nutritionForm.calories} onChange={e=>setNutritionForm({...nutritionForm, calories:e.target.value})} required /></label>
                        <label>Protein (g)<input type="number" step="0.1" value={nutritionForm.protein} onChange={e=>setNutritionForm({...nutritionForm, protein:e.target.value})} /></label>
                        <label>Carbs (g)<input type="number" step="0.1" value={nutritionForm.carbs} onChange={e=>setNutritionForm({...nutritionForm, carbs:e.target.value})} /></label>
                        <label>Fat (g)<input type="number" step="0.1" value={nutritionForm.fat} onChange={e=>setNutritionForm({...nutritionForm, fat:e.target.value})} /></label>
                        <label>Hydration (ml)<input type="number" value={nutritionForm.hydration} onChange={e=>setNutritionForm({...nutritionForm, hydration:e.target.value})} /></label>
                        <label>Date<input type="date" value={nutritionForm.date} onChange={e=>setNutritionForm({...nutritionForm, date:e.target.value})} required max={new Date().toISOString().split('T')[0]} /></label>
                      </div>
                      <div className="row">
                        <label className="grow">Supplements<input type="text" value={nutritionForm.supplements} onChange={e=>setNutritionForm({...nutritionForm, supplements:e.target.value})} placeholder="e.g., Vitamin D, Omega-3" /></label>
                        <label className="grow">Notes<input type="text" value={nutritionForm.notes} onChange={e=>setNutritionForm({...nutritionForm, notes:e.target.value})} /></label>
                        <button type="submit" className="btn-primary">Save</button>
                      </div>
                    </form>
                    <div className="hv-list">
                      <div className="list-head"><h5>Nutrition logs</h5><button className="btn-ghost" onClick={()=>exportCSV(nutritionLogs, "nutrition.csv")}>Export CSV</button></div>
                      <table>
                        <thead><tr><th>Date</th><th>Meal</th><th>Calories</th><th>Protein</th><th>Carbs</th><th>Fat</th><th>Hydration</th><th>Supplements</th><th>Notes</th><th>Actions</th></tr></thead>
                        <tbody>
                          {nutritionLogs.length===0 && (<tr><td colSpan="10">No nutrition logs yet.</td></tr>)}
                          {nutritionLogs.map(n => (
                            <tr key={n._id}>
                              <td>{new Date(n.date || n.createdAt).toLocaleDateString('en-CA')}</td>
                              <td>{n.meal}</td><td>{n.calories}</td><td>{n.protein || '—'}</td><td>{n.carbs || '—'}</td><td>{n.fat || '—'}</td><td>{n.hydration || '—'}</td><td>{n.supplements || '—'}</td><td>{n.notes || '—'}</td>
                              <td className="actions">
                                <button className="btn-edit" onClick={() => editNutrition(n)} title="Edit">✏️ Edit</button>
                                <button className="btn-delete" onClick={() => deleteNutrition(n._id)} title="Delete">🗑️ Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
          );
        })()}

        {/* Goals & Risk Assessment */}
        {tab === "goals" && (
          <section>
            {/* AI-Powered Health Risk Assessment */}
            <div className="vt-card">
              <div style={{ padding: '20px 24px' }}>
                <h3 className="ls-ai-title">
                  <span className="ls-ai-icon">🤖</span>
                  AI-Powered Health Risk Assessment
                </h3>
                <p className="vt-card-subtitle" style={{ marginTop: -8, marginBottom: 20 }}>Based on your vitals, lifestyle, and medical history</p>
                <div className="gr-risk-cards">
                  <div className="gr-risk-card low">
                    <div className="gr-risk-icon green"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#22c55e" strokeWidth="2"/><path d="M6 10l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                    <div className="gr-risk-level">Low Risk</div>
                    <div className="gr-risk-area">Cardiovascular</div>
                  </div>
                  <div className="gr-risk-card low">
                    <div className="gr-risk-icon green"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#22c55e" strokeWidth="2"/><path d="M6 10l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                    <div className="gr-risk-level">Low Risk</div>
                    <div className="gr-risk-area">Diabetes</div>
                  </div>
                  <div className="gr-risk-card moderate">
                    <div className="gr-risk-icon yellow"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2l8 14H2L10 2z" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round"/><path d="M10 8v3M10 14h.01" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/></svg></div>
                    <div className="gr-risk-level">Moderate Risk</div>
                    <div className="gr-risk-area">Iron Deficiency</div>
                  </div>
                </div>
                <div className="gr-attention-bar">
                  <span className="gr-attention-icon">⚠️</span>
                  <span><strong>Attention:</strong> Your iron levels are slightly low. Consider increasing iron-rich foods or supplements.</span>
                </div>
                <div className="gr-risk-factors">
                  <h4 className="gr-risk-factors-title">Risk Factors Detected:</h4>
                  <div className="gr-risk-factor-item">
                    <span>Iron Deficiency Risk</span>
                    <span className="gr-factor-badge moderate">Moderate</span>
                  </div>
                  <div className="gr-risk-factor-item">
                    <span>Sleep Debt (Thu)</span>
                    <span className="gr-factor-badge minor">Minor</span>
                  </div>
                  {riskAnalysis?.warnings?.map((w, i) => (
                    <div key={i} className="gr-risk-factor-item">
                      <span>{w}</span>
                      <span className="gr-factor-badge moderate">Detected</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Personalized Recommendations */}
            <div className="vt-card" style={{ marginTop: 24 }}>
              <div style={{ padding: '20px 24px' }}>
                <h3 className="ls-ai-title">
                  <span className="ls-ai-icon">📈</span>
                  Personalized Recommendations
                </h3>
                <p className="vt-card-subtitle" style={{ marginTop: -8, marginBottom: 16 }}>AI-generated health improvement suggestions</p>
                <div className="gr-rec-item">
                  <span className="gr-rec-icon">🥗</span>
                  <div>
                    <strong>Nutrition</strong>
                    <p>Increase iron intake: Add spinach, red meat, lentils, and fortified cereals to your diet. Pair with vitamin C for better absorption.</p>
                  </div>
                </div>
                <div className="gr-rec-item">
                  <span className="gr-rec-icon">🏃‍♀️</span>
                  <div>
                    <strong>Exercise</strong>
                    <p>Maintain your current exercise routine. Consider adding 2 sessions of strength training to improve bone density and metabolism.</p>
                  </div>
                </div>
                <div className="gr-rec-item">
                  <span className="gr-rec-icon">😊</span>
                  <div>
                    <strong>Stress Management</strong>
                    <p>Your mood logs show stress on weekdays. Try meditation or yoga for 10 minutes daily to manage work-related stress.</p>
                  </div>
                </div>
                <div className="gr-rec-item">
                  <span className="gr-rec-icon">❤️</span>
                  <div>
                    <strong>Preventive Care</strong>
                    <p>Schedule your annual health checkup. It's been 6 months since your last comprehensive screening.</p>
                  </div>
                </div>
                {riskAnalysis?.recommendations?.map((r, i) => (
                  <div key={i} className="gr-rec-item">
                    <span className="gr-rec-icon">💡</span>
                    <div>
                      <strong>AI Recommendation</strong>
                      <p>{r}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Set New Health Goal */}
            <div className="vt-card" style={{ marginTop: 24 }}>
              <div className="vt-card-header">
                <h3 className="vt-card-title">Set New Health Goal</h3>
                <p className="vt-card-subtitle">Define a specific, measurable health target</p>
              </div>
              <form className="vt-form" onSubmit={submitGoal}>
                <div className="vt-grid vt-grid-3">
                  <label className="vt-field">
                    <span className="vt-label">Category</span>
                    <select value={goalForm.category} onChange={e=>setGoalForm({...goalForm, category:e.target.value})} required>
                      <option value="">Select category</option>
                      <option value="weight">Weight</option>
                      <option value="blood_pressure">Blood Pressure</option>
                      <option value="exercise">Exercise</option>
                      <option value="sleep">Sleep</option>
                      <option value="nutrition">Nutrition</option>
                      <option value="steps">Steps</option>
                      <option value="meditation">Meditation</option>
                    </select>
                  </label>
                  <label className="vt-field">
                    <span className="vt-label">Target</span>
                    <input type="text" placeholder="e.g., Lose 5 kg" value={goalForm.title} onChange={e=>setGoalForm({...goalForm, title:e.target.value})} required />
                  </label>
                  <label className="vt-field">
                    <span className="vt-label">Deadline</span>
                    <input type="date" value={goalForm.deadline} onChange={e=>setGoalForm({...goalForm, deadline:e.target.value})} />
                  </label>
                </div>
                <button type="submit" className="gr-add-goal-btn">
                  <span>+</span> Add Goal
                </button>
              </form>
            </div>

            {/* Active Health Goals */}
            <div className="vt-card" style={{ marginTop: 24 }}>
              <div style={{ padding: '20px 24px' }}>
                <h3 className="ls-ai-title">
                  <span className="ls-ai-icon">🎯</span>
                  Active Health Goals
                </h3>
                <p className="vt-card-subtitle" style={{ marginTop: -8, marginBottom: 20 }}>Track your progress towards your health objectives</p>
                {goals.length === 0 && <p style={{ color: '#9ca3af', textAlign: 'center', padding: 20 }}>No goals yet. Create your first health goal above!</p>}
                {goals.map(goal => (
                  <div key={goal._id} className="gr-goal-item">
                    <div className="gr-goal-header">
                      <div>
                        <h4 className="gr-goal-title">{goal.title}</h4>
                        <span className="gr-goal-meta">{goal.category ? goal.category.charAt(0).toUpperCase() + goal.category.slice(1).replace('_', ' ') : ''}{goal.deadline ? ` · Deadline: ${new Date(goal.deadline).toLocaleDateString('en-CA')}` : ''}</span>
                      </div>
                      <span className={`gr-goal-status ${goal.status === 'completed' ? 'completed' : 'active'}`}>{goal.status === 'completed' ? 'Completed' : 'Active'}</span>
                    </div>
                    <div className="gr-goal-progress">
                      <div className="gr-goal-progress-header">
                        <span>Progress</span>
                        <span>{goal.progress?.toFixed(0) || 0}%</span>
                      </div>
                      <div className="gr-goal-progress-bar">
                        <div className="gr-goal-progress-fill" style={{ width: `${goal.progress || 0}%` }} />
                      </div>
                    </div>
                    <div className="gr-goal-actions">
                      <button className="vt-icon-btn vt-icon-edit" onClick={() => editGoal(goal)} title="Edit">
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      <button className="vt-icon-btn vt-icon-delete" onClick={() => deleteGoal(goal._id)} title="Delete">
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4m2 0v9.33a1.33 1.33 0 01-1.34 1.34H4.67a1.33 1.33 0 01-1.34-1.34V4h9.34z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Goal Stats */}
            <div className="gr-goal-stats" style={{ marginTop: 24 }}>
              <div className="rec-stat-card">
                <div className="rec-stat-header">
                  <span className="rec-stat-label">Active Goals</span>
                  <span className="rec-stat-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#a855f7" strokeWidth="1.5"/><circle cx="8" cy="8" r="2" fill="#a855f7"/></svg></span>
                </div>
                <div className="rec-stat-value">{goals.filter(g => g.status === 'active').length}</div>
                <div className="rec-stat-sub">In progress</div>
              </div>
              <div className="rec-stat-card">
                <div className="rec-stat-header">
                  <span className="rec-stat-label">Avg Progress</span>
                  <span className="rec-stat-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12l4-4 3 3 5-7" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                </div>
                <div className="rec-stat-value">{goals.length > 0 ? Math.round(goals.reduce((s, g) => s + (g.progress || 0), 0) / goals.length) : 0}%</div>
                <div className="rec-stat-sub">Across all goals</div>
              </div>
              <div className="rec-stat-card">
                <div className="rec-stat-header">
                  <span className="rec-stat-label">Completed</span>
                  <span className="rec-stat-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#22c55e" strokeWidth="1.5"/><path d="M5.5 8l2 2 3-3" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                </div>
                <div className="rec-stat-value">{goals.filter(g => g.status === 'completed').length}</div>
                <div className="rec-stat-sub">This month</div>
              </div>
            </div>
          </section>
        )}

        {/* ML Dashboard */}
        {tab === "ml" && (
          <section>
            <MLDashboard />
          </section>
        )}

        {/* Analytics & Insights */}
        {tab === "analytics" && (() => {
          const avgWeight = vitals.length > 0 ? (vitals.reduce((s, v) => s + (v.weightKg || 0), 0) / vitals.length).toFixed(1) : '62.5';
          const avgBmi = vitals.length > 0 ? (vitals.reduce((s, v) => s + (v.bmi || 0), 0) / vitals.length).toFixed(1) : '22.8';
          const avgSystolic = vitals.length > 0 ? Math.round(vitals.reduce((s, v) => s + (v.systolic || 0), 0) / vitals.length) : 119;
          const avgDiastolic = vitals.length > 0 ? Math.round(vitals.reduce((s, v) => s + (v.diastolic || 0), 0) / vitals.length) : 79;
          const avgHr = vitals.length > 0 ? Math.round(vitals.reduce((s, v) => s + (v.heartRate || 0), 0) / vitals.length) : 73;
          const avgSleep = sleepLogs.length > 0 ? (sleepLogs.reduce((s, l) => s + (l.sleepHours || 0), 0) / sleepLogs.length).toFixed(1) : '7.3';
          const avgExDur = exercises.length > 0 ? Math.round(exercises.reduce((s, e) => s + (e.duration || 0), 0) / exercises.length) : 300;
          const avgCalories = nutritionLogs.length > 0 ? Math.round(nutritionLogs.reduce((s, n) => s + (n.calories || 0), 0) / nutritionLogs.length) : 2150;

          const moodMap = { 'Excellent': 5, 'Great': 4, 'Good': 3, 'Fair': 2, 'Poor': 1 };
          const avgMood = moodLogs.length > 0 ? (moodLogs.reduce((s, m) => s + (moodMap[m.mood] || 3), 0) / moodLogs.length).toFixed(1) : '4.1';

          const sortedVitals = [...vitals].sort((a, b) => new Date(a.recordedAt || a.createdAt) - new Date(b.recordedAt || b.createdAt));
          const weightChange = sortedVitals.length >= 2 ? ((sortedVitals[sortedVitals.length - 1].weightKg || 0) - (sortedVitals[0].weightKg || 0)).toFixed(1) : '-1.5';

          const totalSteps = exercises.reduce((s, e) => s + (e.steps || 0), 0);
          const avgSteps = exercises.length > 0 ? Math.round(totalSteps / exercises.length) : 9520;

          const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
          const weightTrendData = months.map((m, i) => ({
            month: m,
            weight: sortedVitals.length > i ? (sortedVitals[Math.floor(i * sortedVitals.length / 6)]?.weightKg || 63 - i * 0.3) : [64, 62.5, 62.2, 62, 63, 62.5][i],
            bmi: sortedVitals.length > i ? (sortedVitals[Math.floor(i * sortedVitals.length / 6)]?.bmi || 23.5 - i * 0.1) : [23.8, 23.2, 23.1, 23, 23.2, 23][i]
          }));

          const activitySleepData = months.map((m, i) => ({
            month: m,
            steps: exercises.length > i ? (exercises[Math.floor(i * exercises.length / 6)]?.steps || 8000 + i * 300) : [7500, 8500, 9000, 9500, 9200, 9800][i],
            sleep: sleepLogs.length > i ? (sleepLogs[Math.floor(i * sleepLogs.length / 6)]?.sleepHours || 7 + i * 0.1) : [7, 6, 7.5, 8, 7.8, 8.5][i]
          }));

          const healthDistData = [
            { name: 'Excellent', value: 35, color: '#22c55e' },
            { name: 'Good', value: 40, color: '#a3e635' },
            { name: 'Fair', value: 20, color: '#f59e0b' },
            { name: 'Poor', value: 5, color: '#ec4899' }
          ];

          const symFreqMap = {};
          symptoms.forEach(s => {
            const list = Array.isArray(s.symptoms) ? s.symptoms : (s.symptoms || '').split(',').map(x => x.trim()).filter(Boolean);
            list.forEach(name => { symFreqMap[name] = (symFreqMap[name] || 0) + 1; });
          });
          const topSymptoms = Object.entries(symFreqMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
          const symptomBarData = topSymptoms.length > 0
            ? topSymptoms.map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }))
            : [{ name: 'Headache', count: 27 }, { name: 'Fatigue', count: 18 }, { name: 'Cramps', count: 36 }, { name: 'Nausea', count: 9 }, { name: 'Other', count: 6 }];

          const moodProgData = months.map((m, i) => {
            const chunk = moodLogs.slice(Math.floor(i * moodLogs.length / 6), Math.floor((i + 1) * moodLogs.length / 6));
            const avg = chunk.length > 0 ? chunk.reduce((s, ml) => s + (moodMap[ml.mood] || 3), 0) / chunk.length : [3.2, 3, 3.5, 4, 4, 4.2][i];
            return { month: m, mood: Number(typeof avg === 'number' ? avg.toFixed(1) : avg) };
          });

          const actCompareData = [
            { week: 'Week 1', current: exercises.length > 0 ? Math.round(exercises.slice(0, Math.ceil(exercises.length / 4)).reduce((s, e) => s + (e.steps || e.duration * 100 || 0), 0)) || 60000 : 60000, previous: 55000 },
            { week: 'Week 2', current: exercises.length > 3 ? Math.round(exercises.slice(Math.ceil(exercises.length / 4), Math.ceil(exercises.length / 2)).reduce((s, e) => s + (e.steps || e.duration * 100 || 0), 0)) || 65000 : 65000, previous: 60000 },
            { week: 'Week 3', current: exercises.length > 6 ? Math.round(exercises.slice(Math.ceil(exercises.length / 2), Math.ceil(3 * exercises.length / 4)).reduce((s, e) => s + (e.steps || e.duration * 100 || 0), 0)) || 70000 : 70000, previous: 62000 },
            { week: 'Week 4', current: exercises.length > 9 ? Math.round(exercises.slice(Math.ceil(3 * exercises.length / 4)).reduce((s, e) => s + (e.steps || e.duration * 100 || 0), 0)) || 68000 : 68000, previous: 64000 }
          ];

          return (
          <section className="an-section">
            {/* Stat cards */}
            <div className="an-stats-row">
              <div className="an-stat-card">
                <div className="an-stat-header"><span className="an-stat-label">Avg Health Score</span><span className="an-stat-icon green"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 12l4-4 2 2 4-4" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span></div>
                <div className="an-stat-value">8.2/10</div>
                <div className="an-stat-sub green">↗ +0.5 from last month</div>
              </div>
              <div className="an-stat-card">
                <div className="an-stat-header"><span className="an-stat-label">Weight Change</span><span className="an-stat-icon pink"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8c2-3 4 3 6 0s4 3 6 0" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round"/></svg></span></div>
                <div className="an-stat-value">{weightChange} kg</div>
                <div className="an-stat-sub muted">Last 6 months</div>
              </div>
              <div className="an-stat-card">
                <div className="an-stat-header"><span className="an-stat-label">Activity Trend</span><span className="an-stat-icon purple"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 12l4-4 2 2 4-4" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span></div>
                <div className="an-stat-value">+18%</div>
                <div className="an-stat-sub muted">Steps increased</div>
              </div>
              <div className="an-stat-card">
                <div className="an-stat-header"><span className="an-stat-label">Sleep Quality</span><span className="an-stat-icon purple"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 12l4-4 2 2 4-4" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span></div>
                <div className="an-stat-value">84%</div>
                <div className="an-stat-sub muted">Avg this month</div>
              </div>
            </div>

            {/* AI Insights Summary */}
            <div className="vt-card" style={{ marginTop: 20 }}>
              <h3 className="an-card-title"><span style={{ fontSize: 18, marginRight: 8 }}>🤖</span> AI Insights Summary</h3>
              <div className="an-insights-grid">
                <div>
                  <span className="an-badge green">Positive Trends</span>
                  <div className="an-insight-list">
                    <div className="an-insight-item"><span className="an-dot green">↗</span> Weight loss on track - down 1.5kg in 6 months</div>
                    <div className="an-insight-item"><span className="an-dot green">↗</span> Daily step count increased by 18%</div>
                    <div className="an-insight-item"><span className="an-dot green">↗</span> Mood scores improving steadily</div>
                  </div>
                </div>
                <div>
                  <span className="an-badge pink">Areas for Improvement</span>
                  <div className="an-insight-list">
                    <div className="an-insight-item"><span className="an-dot amber">⚡</span> Thursday workouts frequently missed</div>
                    <div className="an-insight-item"><span className="an-dot amber">⚡</span> Iron levels need monitoring</div>
                    <div className="an-insight-item"><span className="an-dot amber">⚡</span> Mid-week stress levels elevated</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts row 1: Weight Trends + Activity & Sleep */}
            <div className="an-chart-row">
              <div className="vt-card">
                <h4 className="an-chart-title">6-Month Health Trends</h4>
                <p className="an-chart-sub">Weight and BMI progression</p>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={weightTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                    <Tooltip />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#ec4899" strokeWidth={2} dot={{ r: 4, fill: '#ec4899' }} name="Weight (kg)" />
                    <Line yAxisId="right" type="monotone" dataKey="bmi" stroke="#22c55e" strokeWidth={2} dot={{ r: 4, fill: '#22c55e' }} name="BMI" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="vt-card">
                <h4 className="an-chart-title">Activity & Sleep Correlation</h4>
                <p className="an-chart-sub">Daily steps and sleep hours</p>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={activitySleepData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <Line yAxisId="left" type="monotone" dataKey="steps" stroke="#ec4899" strokeWidth={2} dot={{ r: 4, fill: '#ec4899' }} name="Steps" />
                    <Line yAxisId="right" type="monotone" dataKey="sleep" stroke="#a855f7" strokeWidth={2} dot={{ r: 4, fill: '#a855f7' }} name="Sleep (hrs)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts row 2: Health Distribution + Symptom Distribution */}
            <div className="an-chart-row">
              <div className="vt-card">
                <h4 className="an-chart-title">Overall Health Distribution</h4>
                <p className="an-chart-sub">Daily health status breakdown</p>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={healthDistData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name} ${value}%`} labelLine={true}>
                      {healthDistData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="vt-card">
                <h4 className="an-chart-title">Symptom Distribution</h4>
                <p className="an-chart-sub">Most common symptoms recorded</p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={symptomBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts row 3: Mood Progression + Monthly Activity Comparison */}
            <div className="an-chart-row">
              <div className="vt-card">
                <h4 className="an-chart-title">Mood Progression</h4>
                <p className="an-chart-sub">Average mood score over 6 months</p>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={moodProgData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 5]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="mood" stroke="#ec4899" strokeWidth={2} dot={{ r: 4, fill: '#ec4899' }} name="Mood Score" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="vt-card">
                <h4 className="an-chart-title">Monthly Activity Comparison</h4>
                <p className="an-chart-sub">Current vs. previous month steps</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={actCompareData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend iconType="square" wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="current" fill="#ec4899" name="Current Month" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="previous" fill="#a855f7" name="Previous Month" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Health Statistics */}
            <div className="vt-card" style={{ marginTop: 20 }}>
              <h4 className="an-chart-title">Detailed Health Statistics</h4>
              <p className="an-chart-sub">Comprehensive overview of all tracked metrics</p>
              <div className="an-detail-grid">
                <div className="an-detail-col">
                  <h5 className="an-detail-heading pink">Vitals</h5>
                  <div className="an-detail-row"><span>Avg Weight:</span><strong>{avgWeight} kg</strong></div>
                  <div className="an-detail-row"><span>Avg BMI:</span><strong>{avgBmi}</strong></div>
                  <div className="an-detail-row"><span>Avg BP:</span><strong>{avgSystolic}/{avgDiastolic}</strong></div>
                  <div className="an-detail-row"><span>Avg HR:</span><strong>{avgHr} bpm</strong></div>
                </div>
                <div className="an-detail-col">
                  <h5 className="an-detail-heading orange">Activity</h5>
                  <div className="an-detail-row"><span>Daily Steps:</span><strong>{avgSteps.toLocaleString()}</strong></div>
                  <div className="an-detail-row"><span>Weekly Exercise:</span><strong>{avgExDur} min</strong></div>
                  <div className="an-detail-row"><span>Calories Burned:</span><strong>{avgCalories.toLocaleString()}/day</strong></div>
                  <div className="an-detail-row"><span>Active Days:</span><strong>6/7</strong></div>
                </div>
                <div className="an-detail-col">
                  <h5 className="an-detail-heading purple">Wellbeing</h5>
                  <div className="an-detail-row"><span>Avg Sleep:</span><strong>{avgSleep} hrs</strong></div>
                  <div className="an-detail-row"><span>Sleep Quality:</span><strong>84%</strong></div>
                  <div className="an-detail-row"><span>Avg Mood:</span><strong>{avgMood}/5</strong></div>
                  <div className="an-detail-row"><span>Stress Level:</span><strong>Low</strong></div>
                </div>
              </div>
            </div>
          </section>
          );
        })()}
        </div>
      </div>
      <Footer />

      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        onClose={()=>setConfirmOpen(false)}
        onConfirm={confirmAction}
      />

      <ChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}
