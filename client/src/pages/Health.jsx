import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import HealthSidebar from "../components/HealthSidebar";
import Footer from "../components/Footer";
import api from "../services/api";
import "./health.css";
import ConfirmDialog from "../components/ConfirmDialog";
import ChatModal from "../components/ChatModal";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

function SectionHeader({ title, description }) {
  return (
    <div className="hv-head container">
      <div>
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-subtitle">{description}</p>}
      </div>
    </div>
  );
}

export default function Health() {
  const location = useLocation();

  // Get active section from URL hash, default to 'vitals'
  const getActiveTab = () => {
    const hash = location.hash.substring(1); // Remove the '#'
    return hash || 'vitals';
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
    severity: 3,
    notes: ""
  });

  // Vaccination state
  const [vaccs, setVaccs] = useState([]);
  const [vaccForm, setVaccForm] = useState({
    name: "",
    date: new Date().toISOString().slice(0, 10),
    lotNumber: "",
    provider: "",
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
        ]);
      } catch (error) {
        console.log("Health data loading failed - using empty arrays");
      }
    })();
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
    ["weightKg","heightCm","systolic","diastolic","heartRateBpm","bloodSugar","ironLevel","cholesterol"].forEach(k => {
      if (payload[k] === "" || isNaN(Number(payload[k]))) {
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
      provider: vaccination.provider || "",
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

  return (
    <div className="dashboard-container page-with-header">
      <UserHeader />
      <div className="dashboard-body">
        <HealthSidebar />

        <main className="dashboard-main">
          <SectionHeader
            title="Health Tracker"
            description="Log vitals, symptoms, vaccinations and medical records."
          />

        {/* Vitals */}
        {tab === "vitals" && (
          <section className="container hv-section">
            <form className="hv-form" onSubmit={submitVital}>
              <div className="row">
                <label>Date
                  <input type="date" value={vitalForm.recordedAt} onChange={e=>setVitalForm({...vitalForm, recordedAt:e.target.value})} required max={new Date().toISOString().split('T')[0]} />
                </label>
                <label>Weight (kg)
                  <input type="number" step="0.1" value={vitalForm.weightKg} onChange={e=>setVitalForm({...vitalForm, weightKg:e.target.value})} />
                </label>
                <label>Height (cm)
                  <input type="number" step="0.1" value={vitalForm.heightCm} onChange={e=>setVitalForm({...vitalForm, heightCm:e.target.value})} />
                </label>
                <label>Systolic
                  <input type="number" value={vitalForm.systolic} onChange={e=>setVitalForm({...vitalForm, systolic:e.target.value})} />
                </label>
                <label>Diastolic
                  <input type="number" value={vitalForm.diastolic} onChange={e=>setVitalForm({...vitalForm, diastolic:e.target.value})} />
                </label>
                <label>Heart rate (bpm)
                  <input type="number" value={vitalForm.heartRateBpm} onChange={e=>setVitalForm({...vitalForm, heartRateBpm:e.target.value})} />
                </label>
              </div>
              <div className="row">
                <label>Blood Sugar
                  <input type="number" step="0.1" value={vitalForm.bloodSugar} onChange={e=>setVitalForm({...vitalForm, bloodSugar:e.target.value})} />
                </label>
                <label>Iron Level
                  <input type="number" step="0.1" value={vitalForm.ironLevel} onChange={e=>setVitalForm({...vitalForm, ironLevel:e.target.value})} />
                </label>
                <label>Cholesterol
                  <input type="number" step="0.1" value={vitalForm.cholesterol} onChange={e=>setVitalForm({...vitalForm, cholesterol:e.target.value})} />
                </label>
                <label className="grow">Blood Sugar Notes
                  <input type="text" value={vitalForm.bloodSugarNotes} onChange={e=>setVitalForm({...vitalForm, bloodSugarNotes:e.target.value})} placeholder="Optional" />
                </label>
                <label className="grow">Iron Level Notes
                  <input type="text" value={vitalForm.ironLevelNotes} onChange={e=>setVitalForm({...vitalForm, ironLevelNotes:e.target.value})} placeholder="Optional" />
                </label>
                <label className="grow">Cholesterol Notes
                  <input type="text" value={vitalForm.cholesterolNotes} onChange={e=>setVitalForm({...vitalForm, cholesterolNotes:e.target.value})} placeholder="Optional" />
                </label>
              </div>
              <div className="row">
                <label className="grow">Notes
                  <input type="text" value={vitalForm.notes} onChange={e=>setVitalForm({...vitalForm, notes:e.target.value})} placeholder="Optional" />
                </label>
                <div className="bmi">
                  <span>BMI</span>
                  <strong>{bmi || "—"}</strong>
                </div>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>

            <div className="hv-list">
              <div className="list-head">
                <h3>Your vitals</h3>
                <button className="btn-ghost" onClick={()=>exportCSV(vitals, "vitals.csv")}>Export CSV</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th><th>Weight</th><th>Height</th><th>BMI</th><th>BP</th><th>HR</th><th>Blood Sugar</th><th>Iron Level</th><th>Cholesterol</th><th>Notes</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vitals.length===0 && (<tr><td colSpan="11">No vitals yet.</td></tr>)}
                  {vitals.map(v => (
                    <tr key={v._id}>
                      <td>{new Date(v.recordedAt || v.createdAt).toLocaleDateString()}</td>
                      <td>{v.weightKg ?? ""}</td>
                      <td>{v.heightCm ?? ""}</td>
                      <td>{v.bmi ?? ""}</td>
                      <td>{v.systolic && v.diastolic ? `${v.systolic}/${v.diastolic}` : ""}</td>
                      <td>{v.heartRateBpm ?? ""}</td>
                      <td>{v.bloodSugar ?? ""}</td>
                      <td>{v.ironLevel ?? ""}</td>
                      <td>{v.cholesterol ?? ""}</td>
                      <td>{v.notes ?? ""}</td>
                      <td className="actions">
                        <button className="btn-edit" onClick={() => editVital(v)} title="Edit">
                          ✏️ Edit
                        </button>
                        <button className="btn-delete" onClick={() => deleteVital(v._id)} title="Delete">
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Symptoms */}
        {tab === "symptoms" && (
          <section className="container hv-section">
            <form className="hv-form" onSubmit={submitSymptom}>
              <div className="row">
                <label>Date
                  <input type="date" value={symForm.date} onChange={e=>setSymForm({...symForm, date:e.target.value})} required max={new Date().toISOString().split('T')[0]} />
                </label>
                <label className="grow">Tags (comma-separated)
                  <input type="text" placeholder="headache, nausea" value={symForm.tags} onChange={e=>setSymForm({...symForm, tags:e.target.value})} />
                </label>
                <label>Severity
                  <input type="range" min="1" max="5" value={symForm.severity} onChange={e=>setSymForm({...symForm, severity:e.target.value})} />
                </label>
                <label className="grow">Notes
                  <input type="text" value={symForm.notes} onChange={e=>setSymForm({...symForm, notes:e.target.value})} />
                </label>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>

            <div className="hv-list">
              <div className="list-head">
                <h3>Symptom logs</h3>
                <button className="btn-ghost" onClick={()=>exportCSV(symptoms, "symptoms.csv")}>Export CSV</button>
              </div>
              <table>
                <thead>
                  <tr><th>Date</th><th>Tags</th><th>Severity</th><th>Notes</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {symptoms.length===0 && (<tr><td colSpan="5">No symptoms yet.</td></tr>)}
                  {symptoms.map(s => (
                    <tr key={s._id}>
                      <td>{new Date(s.date || s.createdAt).toLocaleDateString()}</td>
                      <td>{(s.tags || []).join(", ")}</td>
                      <td>{s.severity}</td>
                      <td>{s.notes}</td>
                      <td className="actions">
                        <button className="btn-edit" onClick={() => editSymptom(s)} title="Edit">
                          ✏️ Edit
                        </button>
                        <button className="btn-delete" onClick={() => deleteSymptom(s._id)} title="Delete">
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Vaccinations */}
        {tab === "vaccinations" && (
          <section className="container hv-section">
            <form className="hv-form" onSubmit={submitVacc}>
              <div className="row">
                <label>Name
                  <input type="text" value={vaccForm.name} onChange={e=>setVaccForm({...vaccForm, name:e.target.value})} required />
                </label>
                <label>Date
                  <input type="date" value={vaccForm.date} onChange={e=>setVaccForm({...vaccForm, date:e.target.value})} required max={new Date().toISOString().split('T')[0]} />
                </label>
                <label>Lot Number
                  <input type="text" value={vaccForm.lotNumber} onChange={e=>setVaccForm({...vaccForm, lotNumber:e.target.value})} />
                </label>
                <label>Provider
                  <input type="text" value={vaccForm.provider} onChange={e=>setVaccForm({...vaccForm, provider:e.target.value})} />
                </label>
                <label className="grow">Notes
                  <input type="text" value={vaccForm.notes} onChange={e=>setVaccForm({...vaccForm, notes:e.target.value})} />
                </label>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>

            <div className="hv-list">
              <div className="list-head">
                <h3>Vaccination history</h3>
                <button className="btn-ghost" onClick={()=>exportCSV(vaccs, "vaccinations.csv")}>Export CSV</button>
              </div>
              <table>
                <thead>
                  <tr><th>Date</th><th>Name</th><th>Lot</th><th>Provider</th><th>Notes</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {vaccs.length===0 && (<tr><td colSpan="6">No vaccinations yet.</td></tr>)}
                  {vaccs.map(v => (
                    <tr key={v._id}>
                      <td>{new Date(v.date || v.createdAt).toLocaleDateString()}</td>
                      <td>{v.name}</td>
                      <td>{v.lotNumber}</td>
                      <td>{v.provider}</td>
                      <td>{v.notes}</td>
                      <td className="actions">
                        <button className="btn-edit" onClick={() => editVaccination(v)} title="Edit">
                          ✏️ Edit
                        </button>
                        <button className="btn-delete" onClick={() => deleteVaccination(v._id)} title="Delete">
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Records */}
        {tab === "records" && (
          <section className="container hv-section">
            <form className="hv-form" onSubmit={submitRecord}>
              <div className="row">
                <label>Title
                  <input type="text" value={recForm.title} onChange={e=>setRecForm({...recForm, title:e.target.value})} required />
                </label>
                <label>Category
                  <select value={recForm.category} onChange={e=>setRecForm({...recForm, category:e.target.value})}>
                    <option value="lab">Lab result</option>
                    <option value="imaging">Imaging</option>
                    <option value="prescription">Prescription</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label>Date Taken
                  <input type="date" value={recForm.takenAt} onChange={e=>setRecForm({...recForm, takenAt:e.target.value})} max={new Date().toISOString().split('T')[0]} />
                </label>
                <label className="grow">File URL
                  <input type="text" value={recForm.fileUrl} onChange={e=>setRecForm({...recForm, fileUrl:e.target.value})} placeholder="https://..." />
                </label>
                <label className="grow">Notes
                  <input type="text" value={recForm.notes} onChange={e=>setRecForm({...recForm, notes:e.target.value})} />
                </label>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>

            <div className="hv-list">
              <div className="list-head">
                <h3>Medical records</h3>
                <button className="btn-ghost" onClick={()=>exportCSV(records, "records.csv")}>Export CSV</button>
              </div>
              <table>
                <thead>
                  <tr><th>Date</th><th>Title</th><th>Category</th><th>File</th><th>Notes</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {records.length===0 && (<tr><td colSpan="6">No records yet.</td></tr>)}
                  {records.map(r => (
                    <tr key={r._id}>
                      <td>{r.takenAt ? new Date(r.takenAt).toLocaleDateString() : ""}</td>
                      <td>{r.title}</td>
                      <td>{r.category}</td>
                      <td>{r.fileUrl ? <a href={r.fileUrl} target="_blank" rel="noreferrer">View</a> : ""}</td>
                      <td>{r.notes}</td>
                      <td className="actions">
                        <button className="btn-edit" onClick={() => editRecord(r)} title="Edit">
                          ✏️ Edit
                        </button>
                        <button className="btn-delete" onClick={() => deleteRecord(r._id)} title="Delete">
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Mood Logs */}
        {tab === "moodlogs" && (
          <section className="container hv-section">
            <div className="mood-header">
              <h3>Track your mood and symptoms</h3>
              <button className="chat-button" onClick={() => setChatOpen(true)} title="Chat about your mood">
                💬 Chat
              </button>
            </div>
            <form className="hv-form" onSubmit={submitMoodLog}>
              <div className="row">
                <label>Date
                  <input type="date" value={moodForm.date} onChange={e=>setMoodForm({...moodForm, date:e.target.value})} required max={new Date().toISOString().split('T')[0]} />
                </label>
                <label>Mood
                  <select value={moodForm.mood} onChange={e=>setMoodForm({...moodForm, mood:e.target.value})} required>
                    <option value="">Select Mood</option>
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
                <label className="grow">Symptoms (comma-separated)
                  <input type="text" placeholder="headache, fatigue, nausea" value={moodForm.symptoms} onChange={e=>setMoodForm({...moodForm, symptoms:e.target.value})} />
                </label>
                <label className="grow">Notes
                  <input type="text" value={moodForm.notes} onChange={e=>setMoodForm({...moodForm, notes:e.target.value})} />
                </label>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>

            {/* Mood Heatmap */}
            <div className="mood-heatmap">
              <h3>Mood Heatmap (Current Month)</h3>
              <div className="heatmap-grid">
                {Array.from({ length: 31 }, (_, i) => {
                  const day = i + 1;
                  const currentMonth = new Date().getMonth();
                  const currentYear = new Date().getFullYear();
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const log = moodLogs.find(l => new Date(l.date).toISOString().slice(0, 10) === dateStr);
                  let color = '#f0f0f0'; // default gray
                  if (log) {
                    switch (log.mood) {
                      case 'Happy': color = '#4CAF50'; break;
                      case 'Sad': color = '#2196F3'; break;
                      case 'Neutral': color = '#FF9800'; break;
                      case 'Anxious': color = '#F44336'; break;
                      case 'Angry': color = '#9C27B0'; break;
                      case 'Excited': color = '#FFEB3B'; break;
                      case 'Tired': color = '#607D8B'; break;
                      case 'Calm': color = '#00BCD4'; break;
                      default: color = '#f0f0f0';
                    }
                  }
                  return (
                    <div
                      key={day}
                      className="heatmap-day"
                      style={{ backgroundColor: color }}
                      title={log ? `${log.mood} - ${log.symptoms.join(', ')}` : `Day ${day}`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="hv-list">
              <div className="list-head">
                <h3>Mood logs</h3>
                <button className="btn-ghost" onClick={()=>exportCSV(moodLogs, "mood_logs.csv")}>Export CSV</button>
              </div>
              <table>
                <thead>
                  <tr><th>Date</th><th>Mood</th><th>Symptoms</th><th>Notes</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {moodLogs.length===0 && (<tr><td colSpan="5">No mood logs yet.</td></tr>)}
                  {moodLogs.map(m => (
                    <tr key={m._id}>
                      <td>{new Date(m.date || m.createdAt).toLocaleDateString()}</td>
                      <td>{m.mood}</td>
                      <td>{(m.symptoms || []).join(", ")}</td>
                      <td>{m.notes}</td>
                      <td className="actions">
                        <button className="btn-edit" onClick={() => editMoodLog(m)} title="Edit">
                          ✏️ Edit
                        </button>
                        <button className="btn-delete" onClick={() => deleteMoodLog(m._id)} title="Delete">
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Lifestyle */}
        {tab === "lifestyle" && (
          <section className="container hv-section">
            <h3>Lifestyle Tracking</h3>
            <p>Track your exercise, sleep, and nutrition habits.</p>

            {/* Exercise */}
            <div className="lifestyle-category">
              <div className="category-header" onClick={() => setLifestyleExpanded({...lifestyleExpanded, exercise: !lifestyleExpanded.exercise})}>
                <h4>🏃‍♀️ Exercise</h4>
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
                      <thead>
                        <tr><th>Date</th><th>Type</th><th>Duration</th><th>Intensity</th><th>Calories</th><th>Notes</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {exercises.length===0 && (<tr><td colSpan="7">No exercises yet.</td></tr>)}
                        {exercises.map(e => (
                          <tr key={e._id}>
                            <td>{new Date(e.date || e.createdAt).toLocaleDateString()}</td>
                            <td>{e.type}</td>
                            <td>{e.duration} min</td>
                            <td>{e.intensity}</td>
                            <td>{e.caloriesBurned || ""}</td>
                            <td>{e.notes}</td>
                            <td className="actions">
                              <button className="btn-edit" onClick={() => editExercise(e)} title="Edit">
                                ✏️ Edit
                              </button>
                              <button className="btn-delete" onClick={() => deleteExercise(e._id)} title="Delete">
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Sleep */}
            <div className="lifestyle-category">
              <div className="category-header" onClick={() => setLifestyleExpanded({...lifestyleExpanded, sleep: !lifestyleExpanded.sleep})}>
                <h4>😴 Sleep</h4>
                <span>{lifestyleExpanded.sleep ? '▼' : '▶'}</span>
              </div>
              {lifestyleExpanded.sleep && (
                <>
                  <form className="hv-form" onSubmit={submitSleep}>
                    <div className="row">
                      <label>Sleep Hours
                        <input type="number" step="0.5" value={sleepForm.sleepHours} onChange={e=>setSleepForm({...sleepForm, sleepHours:e.target.value})} required />
                      </label>
                      <label>Quality
                        <select value={sleepForm.quality} onChange={e=>setSleepForm({...sleepForm, quality:e.target.value})}>
                          <option value="Poor">Poor</option>
                          <option value="Fair">Fair</option>
                          <option value="Good">Good</option>
                          <option value="Excellent">Excellent</option>
                        </select>
                      </label>
                      <label>Bedtime
                        <div className="time-input-group">
                          <input type="number" min="1" max="12" placeholder="HH" value={sleepForm.bedtimeHour} onChange={e=>setSleepForm({...sleepForm, bedtimeHour:e.target.value})} />
                          <span>:</span>
                          <input type="number" min="0" max="59" placeholder="MM" value={sleepForm.bedtimeMinute} onChange={e=>setSleepForm({...sleepForm, bedtimeMinute:e.target.value})} />
                          <select value={sleepForm.bedtimeAmPm} onChange={e=>setSleepForm({...sleepForm, bedtimeAmPm:e.target.value})}>
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      </label>
                      <label>Wake Time
                        <div className="time-input-group">
                          <input type="number" min="1" max="12" placeholder="HH" value={sleepForm.wakeTimeHour} onChange={e=>setSleepForm({...sleepForm, wakeTimeHour:e.target.value})} />
                          <span>:</span>
                          <input type="number" min="0" max="59" placeholder="MM" value={sleepForm.wakeTimeMinute} onChange={e=>setSleepForm({...sleepForm, wakeTimeMinute:e.target.value})} />
                          <select value={sleepForm.wakeTimeAmPm} onChange={e=>setSleepForm({...sleepForm, wakeTimeAmPm:e.target.value})}>
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      </label>
                      <label>Date
                        <input type="date" value={sleepForm.date} onChange={e=>setSleepForm({...sleepForm, date:e.target.value})} required max={new Date().toISOString().split('T')[0]} />
                      </label>
                      <label className="grow">Notes
                        <input type="text" value={sleepForm.notes} onChange={e=>setSleepForm({...sleepForm, notes:e.target.value})} />
                      </label>
                      <button type="submit" className="btn-primary">Save</button>
                    </div>
                  </form>

                  <div className="hv-list">
                    <div className="list-head">
                      <h5>Sleep logs</h5>
                      <button className="btn-ghost" onClick={()=>exportCSV(sleepLogs, "sleep.csv")}>Export CSV</button>
                    </div>
                    <table>
                      <thead>
                        <tr><th>Date</th><th>Hours</th><th>Quality</th><th>Bedtime</th><th>Wake Time</th><th>Notes</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {sleepLogs.length===0 && (<tr><td colSpan="7">No sleep logs yet.</td></tr>)}
                        {sleepLogs.map(s => (
                          <tr key={s._id}>
                            <td>{new Date(s.date || s.createdAt).toLocaleDateString()}</td>
                            <td>{s.sleepHours}</td>
                            <td>{s.quality}</td>
                            <td>{formatTimeForDisplay(s.bedtime)}</td>
                            <td>{formatTimeForDisplay(s.wakeTime)}</td>
                            <td>{s.notes}</td>
                            <td className="actions">
                              <button className="btn-edit" onClick={() => editSleep(s)} title="Edit">
                                ✏️ Edit
                              </button>
                              <button className="btn-delete" onClick={() => deleteSleep(s._id)} title="Delete">
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Nutrition */}
            <div className="lifestyle-category">
              <div className="category-header" onClick={() => setLifestyleExpanded({...lifestyleExpanded, nutrition: !lifestyleExpanded.nutrition})}>
                <h4>🥗 Nutrition</h4>
                <span>{lifestyleExpanded.nutrition ? '▼' : '▶'}</span>
              </div>
              {lifestyleExpanded.nutrition && (
                <>
                  <form className="hv-form" onSubmit={submitNutrition}>
                    <div className="row">
                      <label>Meal
                        <select value={nutritionForm.meal} onChange={e=>setNutritionForm({...nutritionForm, meal:e.target.value})} required>
                          <option value="">Select Meal</option>
                          <option value="Breakfast">Breakfast</option>
                          <option value="Lunch">Lunch</option>
                          <option value="Dinner">Dinner</option>
                          <option value="Snacks">Snacks</option>
                        </select>
                      </label>
                      <label>Calories
                        <input type="number" value={nutritionForm.calories} onChange={e=>setNutritionForm({...nutritionForm, calories:e.target.value})} required />
                      </label>
                      <label>Protein (g)
                        <input type="number" step="0.1" value={nutritionForm.protein} onChange={e=>setNutritionForm({...nutritionForm, protein:e.target.value})} />
                      </label>
                      <label>Carbs (g)
                        <input type="number" step="0.1" value={nutritionForm.carbs} onChange={e=>setNutritionForm({...nutritionForm, carbs:e.target.value})} />
                      </label>
                      <label>Fat (g)
                        <input type="number" step="0.1" value={nutritionForm.fat} onChange={e=>setNutritionForm({...nutritionForm, fat:e.target.value})} />
                      </label>
                      <label>Hydration (ml)
                        <input type="number" value={nutritionForm.hydration} onChange={e=>setNutritionForm({...nutritionForm, hydration:e.target.value})} />
                      </label>
                      <label>Date
                        <input type="date" value={nutritionForm.date} onChange={e=>setNutritionForm({...nutritionForm, date:e.target.value})} required max={new Date().toISOString().split('T')[0]} />
                      </label>
                    </div>
                    <div className="row">
                      <label className="grow">Supplements
                        <input type="text" value={nutritionForm.supplements} onChange={e=>setNutritionForm({...nutritionForm, supplements:e.target.value})} placeholder="e.g., Vitamin D, Omega-3" />
                      </label>
                      <label className="grow">Notes
                        <input type="text" value={nutritionForm.notes} onChange={e=>setNutritionForm({...nutritionForm, notes:e.target.value})} />
                      </label>
                      <button type="submit" className="btn-primary">Save</button>
                    </div>
                  </form>

                  <div className="hv-list">
                    <div className="list-head">
                      <h5>Nutrition logs</h5>
                      <button className="btn-ghost" onClick={()=>exportCSV(nutritionLogs, "nutrition.csv")}>Export CSV</button>
                    </div>
                    <table>
                      <thead>
                        <tr><th>Date</th><th>Meal</th><th>Calories</th><th>Protein</th><th>Carbs</th><th>Fat</th><th>Hydration</th><th>Supplements</th><th>Notes</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {nutritionLogs.length===0 && (<tr><td colSpan="10">No nutrition logs yet.</td></tr>)}
                        {nutritionLogs.map(n => (
                          <tr key={n._id}>
                            <td>{new Date(n.date || n.createdAt).toLocaleDateString()}</td>
                            <td>{n.meal}</td>
                            <td>{n.calories}</td>
                            <td>{n.protein || ""}</td>
                            <td>{n.carbs || ""}</td>
                            <td>{n.fat || ""}</td>
                            <td>{n.hydration || ""}</td>
                            <td>{n.supplements || ""}</td>
                            <td>{n.notes}</td>
                            <td className="actions">
                              <button className="btn-edit" onClick={() => editNutrition(n)} title="Edit">
                                ✏️ Edit
                              </button>
                              <button className="btn-delete" onClick={() => deleteNutrition(n._id)} title="Delete">
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Charts and Insights */}
            <div className="lifestyle-category">
              <div className="category-header" onClick={() => setLifestyleExpanded({...lifestyleExpanded, charts: !lifestyleExpanded.charts})}>
                <h4>📊 Trends & Insights</h4>
                <span>{lifestyleExpanded.charts ? '▼' : '▶'}</span>
              </div>
              {lifestyleExpanded.charts && (
                <>
                  {/* Exercise Trends */}
                  <div className="chart-section">
                    <h5>Exercise Duration Trend (Last 30 Days)</h5>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={exercises.slice(-30)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                        <YAxis />
                        <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                        <Legend />
                        <Line type="monotone" dataKey="duration" stroke="#8884d8" name="Duration (min)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Sleep Quality Chart */}
                  <div className="chart-section">
                    <h5>Sleep Quality Distribution</h5>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={sleepLogs.slice(-30)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                        <YAxis />
                        <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                        <Legend />
                        <Bar dataKey="sleepHours" fill="#82ca9d" name="Sleep Hours" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Nutrition Calories Trend */}
                  <div className="chart-section">
                    <h5>Daily Calorie Intake Trend</h5>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={nutritionLogs.slice(-30)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                        <YAxis />
                        <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                        <Legend />
                        <Line type="monotone" dataKey="calories" stroke="#ff7300" name="Calories" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Insights */}
                  <div className="insights-section">
                    <h5>Health Insights</h5>
                    <div className="insights-grid">
                      <div className="insight-card">
                        <h6>💪 Exercise</h6>
                        <p>Average weekly exercise: {exercises.length > 0 ? (exercises.slice(-7).reduce((sum, ex) => sum + ex.duration, 0) / 7).toFixed(1) : 0} minutes</p>
                        <p>Most active day: {exercises.length > 0 ? new Date(exercises.reduce((max, ex) => ex.duration > max.duration ? ex : max, exercises[0]).date).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div className="insight-card">
                        <h6>😴 Sleep</h6>
                        <p>Average sleep: {sleepLogs.length > 0 ? (sleepLogs.slice(-7).reduce((sum, sl) => sum + sl.sleepHours, 0) / Math.min(7, sleepLogs.length)).toFixed(1) : 0} hours</p>
                        <p>Sleep quality: {sleepLogs.length > 0 ? (sleepLogs.slice(-7).filter(sl => sl.quality === 'good' || sl.quality === 'excellent').length / Math.min(7, sleepLogs.length) * 100).toFixed(0) : 0}% good/excellent</p>
                      </div>
                      <div className="insight-card">
                        <h6>🥗 Nutrition</h6>
                        <p>Average daily calories: {nutritionLogs.length > 0 ? (nutritionLogs.slice(-7).reduce((sum, nl) => sum + nl.calories, 0) / Math.min(7, nutritionLogs.length)).toFixed(0) : 0}</p>
                        <p>Protein intake: {nutritionLogs.length > 0 ? (nutritionLogs.slice(-7).reduce((sum, nl) => sum + (nl.protein || 0), 0) / Math.min(7, nutritionLogs.length)).toFixed(1) : 0}g average</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* Analytics & Insights */}
        {tab === "analytics" && (
          <section className="container hv-section">
            <h3>Analytics & Insights</h3>
            <p>Comprehensive overview and trends across all your health data.</p>

            {/* Vitals Trends */}
            <div className="chart-section">
              <h4>Weight Trend</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={vitals.slice(-30).sort((a,b) => new Date(a.recordedAt || a.createdAt) - new Date(b.recordedAt || b.createdAt))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="recordedAt" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <YAxis />
                  <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <Legend />
                  <Line type="monotone" dataKey="weightKg" stroke="#8884d8" name="Weight (kg)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-section">
              <h4>Blood Pressure Trend</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={vitals.slice(-30).sort((a,b) => new Date(a.recordedAt || a.createdAt) - new Date(b.recordedAt || b.createdAt))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="recordedAt" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <YAxis />
                  <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <Legend />
                  <Line type="monotone" dataKey="systolic" stroke="#ff7300" name="Systolic" />
                  <Line type="monotone" dataKey="diastolic" stroke="#82ca9d" name="Diastolic" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Symptoms Frequency */}
            <div className="chart-section">
              <h4>Symptoms Frequency</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={symptoms.slice(-30).sort((a,b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <YAxis />
                  <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <Legend />
                  <Bar dataKey="severity" fill="#ffc658" name="Severity" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Mood Trends */}
            <div className="chart-section">
              <h4>Mood Trends</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={moodLogs.slice(-30).sort((a,b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <YAxis type="category" dataKey="mood" />
                  <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <Legend />
                  <Bar dataKey="mood" fill="#8884d8" name="Mood" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Lifestyle Trends */}
            <div className="chart-section">
              <h4>Exercise Duration Trend</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={exercises.slice(-30).sort((a,b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <YAxis />
                  <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <Legend />
                  <Line type="monotone" dataKey="duration" stroke="#8884d8" name="Duration (min)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-section">
              <h4>Sleep Hours Trend</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sleepLogs.slice(-30).sort((a,b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <YAxis />
                  <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <Legend />
                  <Line type="monotone" dataKey="sleepHours" stroke="#82ca9d" name="Sleep Hours" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-section">
              <h4>Nutrition Calories Trend</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={nutritionLogs.slice(-30).sort((a,b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <YAxis />
                  <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <Legend />
                  <Line type="monotone" dataKey="calories" stroke="#ff7300" name="Calories" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Overall Insights */}
            <div className="insights-section">
              <h4>Health Insights</h4>
              <div className="insights-grid">
                <div className="insight-card">
                  <h5>💓 Vitals</h5>
                  <p>Average weight: {vitals.length > 0 ? (vitals.reduce((sum, v) => sum + (v.weightKg || 0), 0) / vitals.length).toFixed(1) : 0} kg</p>
                  <p>Latest BP: {vitals.length > 0 ? `${vitals[vitals.length - 1].systolic || ''}/${vitals[vitals.length - 1].diastolic || ''}` : 'N/A'}</p>
                </div>
                <div className="insight-card">
                  <h5>🤒 Symptoms</h5>
                  <p>Total symptoms logged: {symptoms.length}</p>
                  <p>Average severity: {symptoms.length > 0 ? (symptoms.reduce((sum, s) => sum + s.severity, 0) / symptoms.length).toFixed(1) : 0}</p>
                </div>
                <div className="insight-card">
                  <h5>😊 Mood</h5>
                  <p>Total mood logs: {moodLogs.length}</p>
                  <p>Most common mood: {moodLogs.length > 0 ? moodLogs.reduce((acc, log) => {
                    acc[log.mood] = (acc[log.mood] || 0) + 1;
                    return acc;
                  }, {}) && Object.keys(moodLogs.reduce((acc, log) => {
                    acc[log.mood] = (acc[log.mood] || 0) + 1;
                    return acc;
                  }, {})).reduce((a, b) => moodLogs.reduce((acc, log) => {
                    acc[log.mood] = (acc[log.mood] || 0) + 1;
                    return acc;
                  }, {})[a] > moodLogs.reduce((acc, log) => {
                    acc[log.mood] = (acc[log.mood] || 0) + 1;
                    return acc;
                  }, {})[b] ? a : b) : 'N/A'}</p>
                </div>
                <div className="insight-card">
                  <h5>🏃‍♀️ Exercise</h5>
                  <p>Total exercises: {exercises.length}</p>
                  <p>Average duration: {exercises.length > 0 ? (exercises.reduce((sum, e) => sum + e.duration, 0) / exercises.length).toFixed(1) : 0} min</p>
                </div>
                <div className="insight-card">
                  <h5>😴 Sleep</h5>
                  <p>Total sleep logs: {sleepLogs.length}</p>
                  <p>Average sleep: {sleepLogs.length > 0 ? (sleepLogs.reduce((sum, s) => sum + s.sleepHours, 0) / sleepLogs.length).toFixed(1) : 0} hours</p>
                </div>
                <div className="insight-card">
                  <h5>🥗 Nutrition</h5>
                  <p>Total nutrition logs: {nutritionLogs.length}</p>
                  <p>Average calories: {nutritionLogs.length > 0 ? (nutritionLogs.reduce((sum, n) => sum + n.calories, 0) / nutritionLogs.length).toFixed(0) : 0}</p>
                </div>
              </div>
            </div>
          </section>
        )}
        </main>
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
