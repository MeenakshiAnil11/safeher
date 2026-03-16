import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import UserSidebar from "../components/UserSidebar";
import Footer from "../components/Footer";
import { getUser } from "../services/auth";
import api from "../services/api";
import locationService from "../services/locationService";
import { reverseGeocode, formatAddress } from "../utils/geocoding";
import "./dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [lastSOS, setLastSOS] = useState(null);
  const [sleepLogs, setSleepLogs] = useState([]);
  const [exerciseLogs, setExerciseLogs] = useState([]);
  const [symptomLogs, setSymptomLogs] = useState([]);
  const [smartwatchData, setSmartwatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      navigate("/login");
      return;
    }
    
    // Check if user is admin - redirect to admin dashboard
    const role = u.role || localStorage.getItem("role");
    if (role === "admin" || role === "superadmin") {
      navigate("/admin/dashboard");
      return;
    }
    
    // Only proceed if user is not an admin
    setUser(u);
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        vitalsRes,
        periodsRes,
        sosRes,
        smartwatchRes,
        sleepRes,
        exercisesRes,
        symptomsRes,
      ] = await Promise.all([
        api.get("/health/vitals"),
        api.get("/periods/history"),
        api.get("/sos"),
        api.get("/health/smartwatch-data").catch(() => ({ data: null })),
        api.get("/health/sleep").catch(() => ({ data: { items: [] } })),
        api.get("/health/exercises").catch(() => ({ data: { items: [] } })),
        api.get("/health/symptoms").catch(() => ({ data: { items: [] } })),
      ]);

      const vitalsItems = vitalsRes.data.items || [];
      setVitalsHistory(vitalsItems);
      setPeriods(periodsRes.data.cycles || []);
      setSmartwatchData(smartwatchRes.data || null);
      setSleepLogs(sleepRes.data.items || []);
      setExerciseLogs(exercisesRes.data.items || []);
      setSymptomLogs(symptomsRes.data.items || []);

      const sortedSOS = (sosRes.data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setLastSOS(sortedSOS.length ? sortedSOS[0] : null);

      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getNextPeriodInfo = () => {
    if (!periods.length) {
      return { nextPeriodDate: null, daysUntilNext: null };
    }
    const lastPeriod = periods[0];
    const avgCycleLength = 28;
    const lastStartDate = new Date(lastPeriod.startDate);
    const nextPeriodDate = new Date(lastStartDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + avgCycleLength);

    const today = new Date();
    const diffTime = nextPeriodDate - today;
    const daysUntilNext = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { nextPeriodDate, daysUntilNext };
  };

  const { nextPeriodDate, daysUntilNext } = getNextPeriodInfo();
  const latestVital = vitalsHistory[0] || null;
  const previousVital = vitalsHistory[1] || null;

  const cycleInfo = (() => {
    const day =
      periods.length > 0 && periods[0]?.startDate
        ? Math.max(
            1,
            Math.ceil(
              (Date.now() - new Date(periods[0].startDate).getTime()) /
                (1000 * 60 * 60 * 24)
            ) + 1
          )
        : null;
    let phase = "Unknown";
    if (day !== null) {
      if (day <= 5) phase = "Menstrual";
      else if (day <= 13) phase = "Follicular";
      else if (day <= 16) phase = "Ovulation";
      else phase = "Luteal";
    }
    const energyLevel =
      phase === "Ovulation"
        ? "High"
        : phase === "Follicular"
          ? "Moderate-High"
          : phase === "Luteal"
            ? "Moderate"
            : "Low-Moderate";
    const activities =
      phase === "Menstrual"
        ? ["Gentle stretching", "Hydration focus", "Mood journaling"]
        : phase === "Follicular"
          ? ["Cardio", "Strength training", "Creative tasks"]
          : phase === "Ovulation"
            ? ["HIIT / running", "Team workouts", "Long walks"]
            : ["Moderate yoga", "Sleep recovery", "Stress reduction"];

    return { cycleDay: day, phase, energyLevel, activities };
  })();

  const formatLastSOS = () => {
    if (!lastSOS) return "No alerts yet";
    const date = new Date(lastSOS.createdAt);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const handleSOS = async () => {
    // Show confirmation modal with countdown
    const confirmed = await new Promise((resolve) => {
      let seconds = 3;
      const modal = document.createElement("div");
      modal.style.position = "fixed";
      modal.style.inset = "0";
      modal.style.background = "rgba(0,0,0,0.7)";
      modal.style.display = "flex";
      modal.style.alignItems = "center";
      modal.style.justifyContent = "center";
      modal.style.zIndex = 9999;

      const box = document.createElement("div");
      box.style.background = "#fff";
      box.style.padding = "32px";
      box.style.borderRadius = "20px";
      box.style.width = "min(450px, 92%)";
      box.style.textAlign = "center";
      box.style.boxShadow = "0 20px 40px rgba(15,23,42,0.15)";
      box.style.border = "2px solid #ef4444";

      const title = document.createElement("h3");
      title.textContent = "🚨 Emergency SOS Alert";
      title.style.color = "#ef4444";
      title.style.marginBottom = "12px";
      title.style.fontSize = "1.5rem";
      title.style.fontWeight = "700";

      const subtitle = document.createElement("p");
      subtitle.textContent = "This will send your location to all emergency contacts";
      subtitle.style.color = "#6b7280";
      subtitle.style.marginBottom = "20px";
      subtitle.style.fontSize = "0.95rem";

      const countdownP = document.createElement("p");
      countdownP.textContent = `SOS will be sent in ${seconds}s...`;
      countdownP.style.margin = "0";
      countdownP.style.fontSize = "1.1rem";
      countdownP.style.fontWeight = "600";
      countdownP.style.color = "#ef4444";

      const btnRow = document.createElement("div");
      btnRow.style.display = "flex";
      btnRow.style.gap = "16px";
      btnRow.style.justifyContent = "center";
      btnRow.style.marginTop = "24px";

      const cancelBtn = document.createElement("button");
      cancelBtn.style.background = "#f3f4f6";
      cancelBtn.style.color = "#374151";
      cancelBtn.style.border = "none";
      cancelBtn.style.padding = "12px 24px";
      cancelBtn.style.borderRadius = "8px";
      cancelBtn.style.fontWeight = "600";
      cancelBtn.style.cursor = "pointer";
      cancelBtn.textContent = "Cancel";
      cancelBtn.onclick = () => {
        cleanup();
        resolve(false);
      };

      const sendBtn = document.createElement("button");
      sendBtn.style.background = "#ef4444";
      sendBtn.style.color = "white";
      sendBtn.style.border = "none";
      sendBtn.style.padding = "12px 24px";
      sendBtn.style.borderRadius = "8px";
      sendBtn.style.fontWeight = "600";
      sendBtn.style.cursor = "pointer";
      sendBtn.textContent = "Send Now";
      sendBtn.onclick = () => {
        cleanup();
        resolve(true);
      };

      btnRow.appendChild(cancelBtn);
      btnRow.appendChild(sendBtn);
      box.appendChild(title);
      box.appendChild(subtitle);
      box.appendChild(countdownP);
      box.appendChild(btnRow);
      modal.appendChild(box);
      document.body.appendChild(modal);

      const timer = setInterval(() => {
        seconds -= 1;
        countdownP.textContent = `SOS will be sent in ${seconds}s...`;
        if (seconds <= 0) {
          clearInterval(timer);
          cleanup();
          resolve(true);
        }
      }, 1000);

      function cleanup() {
        clearInterval(timer);
        modal.remove();
      }
    });

    if (!confirmed) return;

    // Show loading state
    const loadingModal = document.createElement("div");
    loadingModal.style.position = "fixed";
    loadingModal.style.inset = "0";
    loadingModal.style.background = "rgba(0,0,0,0.7)";
    loadingModal.style.display = "flex";
    loadingModal.style.alignItems = "center";
    loadingModal.style.justifyContent = "center";
    loadingModal.style.zIndex = 9999;

    const loadingBox = document.createElement("div");
    loadingBox.style.background = "#fff";
    loadingBox.style.padding = "32px";
    loadingBox.style.borderRadius = "20px";
    loadingBox.style.textAlign = "center";
    loadingBox.style.boxShadow = "0 20px 40px rgba(15,23,42,0.15)";

    const loadingText = document.createElement("p");
    loadingText.textContent = "🚨 Sending SOS Alert...";
    loadingText.style.fontSize = "1.2rem";
    loadingText.style.fontWeight = "600";
    loadingText.style.color = "#ef4444";
    loadingText.style.margin = "0";

    loadingBox.appendChild(loadingText);
    loadingModal.appendChild(loadingBox);
    document.body.appendChild(loadingModal);

    try {
      // Get current location with high accuracy
      console.log("📍 Getting current location for SOS...");
      const location = await locationService.requestLocationPermission();
      
      if (!location) {
        throw new Error("Unable to get current location. Please enable location permissions.");
      }

      console.log("📍 Location obtained:", location);

      // Get address details for better context
      let addressDetails = null;
      try {
        addressDetails = await reverseGeocode(location.latitude, location.longitude);
        console.log("📍 Address resolved:", addressDetails);
      } catch (error) {
        console.warn("Failed to get address details:", error);
      }

      // Prepare SOS data with enhanced information
      const sosData = {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: location.timestamp,
        message: "Emergency SOS triggered from dashboard",
        address: addressDetails ? formatAddress(addressDetails) : null,
        source: "dashboard"
      };

      console.log("🚨 Sending SOS with data:", sosData);

      // Send SOS alert to backend using the new /send endpoint
      const response = await api.post("/sos/send", sosData);
      
      console.log("✅ SOS sent successfully:", response.data);

      // Remove loading modal
      loadingModal.remove();

      // Show success message
      const successModal = document.createElement("div");
      successModal.style.position = "fixed";
      successModal.style.inset = "0";
      successModal.style.background = "rgba(0,0,0,0.7)";
      successModal.style.display = "flex";
      successModal.style.alignItems = "center";
      successModal.style.justifyContent = "center";
      successModal.style.zIndex = 9999;

      const successBox = document.createElement("div");
      successBox.style.background = "#fff";
      successBox.style.padding = "32px";
      successBox.style.borderRadius = "20px";
      successBox.style.textAlign = "center";
      successBox.style.boxShadow = "0 20px 40px rgba(15,23,42,0.15)";
      successBox.style.border = "2px solid #10b981";

      const successTitle = document.createElement("h3");
      successTitle.textContent = "✅ SOS Alert Sent Successfully!";
      successTitle.style.color = "#10b981";
      successTitle.style.marginBottom = "16px";
      successTitle.style.fontSize = "1.3rem";
      successTitle.style.fontWeight = "700";

      const successDetails = document.createElement("div");
      successDetails.style.textAlign = "left";
      successDetails.style.background = "#f0fdf4";
      successDetails.style.padding = "16px";
      successDetails.style.borderRadius = "8px";
      successDetails.style.marginBottom = "20px";

      const locationInfo = document.createElement("p");
        locationInfo.innerHTML = `
          <strong>📍 Location:</strong> ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}<br>
          <strong>🎯 Accuracy:</strong> ±${Math.round(location.accuracy)}m<br>
          <strong>📱 Contacts Notified:</strong> ${response.data?.data?.contactsNotified?.total || response.data?.contactsNotified?.total || 'Multiple'}<br>
          <strong>🔥 FCM Notifications Sent:</strong> ${response.data?.data?.contactsNotified?.fcm || 0}<br>
          <strong>⚠️ FCM Failed:</strong> ${response.data?.data?.contactsNotified?.fcmFailed || 0}
        `;
      locationInfo.style.margin = "0";
      locationInfo.style.fontSize = "0.9rem";
      locationInfo.style.color = "#374151";

      const closeBtn = document.createElement("button");
      closeBtn.style.background = "#10b981";
      closeBtn.style.color = "white";
      closeBtn.style.border = "none";
      closeBtn.style.padding = "12px 24px";
      closeBtn.style.borderRadius = "8px";
      closeBtn.style.fontWeight = "600";
      closeBtn.style.cursor = "pointer";
      closeBtn.textContent = "Close";
      closeBtn.onclick = () => {
        successModal.remove();
        fetchDashboardData(); // Refresh dashboard data
      };

      successDetails.appendChild(locationInfo);
      successBox.appendChild(successTitle);
      successBox.appendChild(successDetails);
      successBox.appendChild(closeBtn);
      successModal.appendChild(successBox);
      document.body.appendChild(successModal);

      // Auto-close after 10 seconds
      setTimeout(() => {
        if (document.body.contains(successModal)) {
          successModal.remove();
          fetchDashboardData();
        }
      }, 10000);

    } catch (error) {
      console.error("❌ SOS Error:", error);
      
      // Remove loading modal
      loadingModal.remove();

      // Show error message
      const errorModal = document.createElement("div");
      errorModal.style.position = "fixed";
      errorModal.style.inset = "0";
      errorModal.style.background = "rgba(0,0,0,0.7)";
      errorModal.style.display = "flex";
      errorModal.style.alignItems = "center";
      errorModal.style.justifyContent = "center";
      errorModal.style.zIndex = 9999;

      const errorBox = document.createElement("div");
      errorBox.style.background = "#fff";
      errorBox.style.padding = "32px";
      errorBox.style.borderRadius = "20px";
      errorBox.style.textAlign = "center";
      errorBox.style.boxShadow = "0 20px 40px rgba(15,23,42,0.15)";
      errorBox.style.border = "2px solid #ef4444";

      const errorTitle = document.createElement("h3");
      errorTitle.textContent = "❌ SOS Alert Failed";
      errorTitle.style.color = "#ef4444";
      errorTitle.style.marginBottom = "16px";
      errorTitle.style.fontSize = "1.3rem";
      errorTitle.style.fontWeight = "700";

      const errorMessage = document.createElement("p");
      errorMessage.textContent = error.message || "Failed to send SOS alert. Please try again or call emergency services directly.";
      errorMessage.style.color = "#6b7280";
      errorMessage.style.marginBottom = "20px";

      const retryBtn = document.createElement("button");
      retryBtn.style.background = "#ef4444";
      retryBtn.style.color = "white";
      retryBtn.style.border = "none";
      retryBtn.style.padding = "12px 24px";
      retryBtn.style.borderRadius = "8px";
      retryBtn.style.fontWeight = "600";
      retryBtn.style.cursor = "pointer";
      retryBtn.style.marginRight = "12px";
      retryBtn.textContent = "Try Again";
      retryBtn.onclick = () => {
        errorModal.remove();
        handleSOS(); // Retry
      };

      const closeBtn = document.createElement("button");
      closeBtn.style.background = "#f3f4f6";
      closeBtn.style.color = "#374151";
      closeBtn.style.border = "none";
      closeBtn.style.padding = "12px 24px";
      closeBtn.style.borderRadius = "8px";
      closeBtn.style.fontWeight = "600";
      closeBtn.style.cursor = "pointer";
      closeBtn.textContent = "Close";
      closeBtn.onclick = () => {
        errorModal.remove();
      };

      errorBox.appendChild(errorTitle);
      errorBox.appendChild(errorMessage);
      errorBox.appendChild(retryBtn);
      errorBox.appendChild(closeBtn);
      errorModal.appendChild(errorBox);
      document.body.appendChild(errorModal);
    }
  };

  if (!user) return null;
  if (loading) return <div className="dashboard-loading">Loading dashboard...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;

  const friendlyName = user.name?.split(" ")[0] || "Explorer";
  const nextPeriodLabel = () => {
    if (daysUntilNext === null) return "Log your cycle";
    if (daysUntilNext <= 0) return "Due now";
    if (daysUntilNext === 1) return "In 1 day";
    return `In ${daysUntilNext} days`;
  };

  const nextPeriodDateText = nextPeriodDate
    ? nextPeriodDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "Keep tracking to refine predictions";

  const getTrend = (currentValue, previousValue) => {
    const current = Number(currentValue);
    const previous = Number(previousValue);
    if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) {
      return { direction: "flat", percentage: 0, label: "No trend yet" };
    }
    const change = ((current - previous) / Math.abs(previous)) * 100;
    const direction = change > 0 ? "up" : change < 0 ? "down" : "flat";
    return {
      direction,
      percentage: Math.abs(change).toFixed(1),
      label: `${change > 0 ? "+" : ""}${change.toFixed(1)}% vs previous`,
    };
  };

  const heartTrend = getTrend(latestVital?.heartRateBpm, previousVital?.heartRateBpm);
  const bmiTrend = getTrend(latestVital?.bmi, previousVital?.bmi);
  const weightTrend = getTrend(latestVital?.weightKg, previousVital?.weightKg);
  const bpCurrent = latestVital?.systolic && latestVital?.diastolic ? latestVital.systolic + latestVital.diastolic : null;
  const bpPrevious = previousVital?.systolic && previousVital?.diastolic ? previousVital.systolic + previousVital.diastolic : null;
  const bpTrend = getTrend(bpCurrent, bpPrevious);

  const healthScore = (() => {
    let score = 50;
    const hr = Number(smartwatchData?.heartRate || latestVital?.heartRateBpm || 0);
    if (hr >= 60 && hr <= 100) score += 12;
    else if (hr > 0) score += 4;

    const bmi = Number(smartwatchData?.bmi || latestVital?.bmi || 0);
    if (bmi >= 18.5 && bmi <= 24.9) score += 12;
    else if (bmi > 0) score += 5;

    const sleepAvg = sleepLogs.length
      ? sleepLogs.slice(0, 7).reduce((sum, item) => sum + Number(item.sleepHours || 0), 0) /
        Math.min(7, sleepLogs.length)
      : 0;
    if (sleepAvg >= 7 && sleepAvg <= 9) score += 12;
    else if (sleepAvg > 0) score += 6;

    const steps = Number(smartwatchData?.stepsToday || 0);
    if (steps >= 8000) score += 14;
    else if (steps > 0) score += Math.min(12, Math.round(steps / 800));

    return Math.max(0, Math.min(100, Math.round(score)));
  })();

  const riskAlerts = (() => {
    const alerts = [];
    const hr = Number(smartwatchData?.heartRate || latestVital?.heartRateBpm || 0);
    if (hr > 100) alerts.push("Elevated heart rate detected");
    if (Number(latestVital?.systolic || 0) >= 140 || Number(latestVital?.diastolic || 0) >= 90) {
      alerts.push("Blood pressure above healthy range");
    }
    const spo2 = Number(smartwatchData?.spo2 || 0);
    if (spo2 > 0 && spo2 < 95) alerts.push("Low oxygen saturation trend");
    if (daysUntilNext !== null && daysUntilNext <= 0) alerts.push("Period is due now");
    return alerts;
  })();

  const getMetricSeries = (key, mapper = (v) => v?.[key]) =>
    vitalsHistory
      .slice(0, 7)
      .reverse()
      .map((item) => Number(mapper(item) || 0));

  const metrics = [
    {
      key: "cycle",
      title: "Next Period",
      value: nextPeriodLabel(),
      note: nextPeriodDate ? `Expected ${nextPeriodDateText}` : nextPeriodDateText,
      accent: "pink",
      icon: "🌸",
      trend: { direction: "flat", label: `Cycle day ${cycleInfo.cycleDay || "-"}` },
      series: getMetricSeries("bmi"),
    },
    {
      key: "heart",
      title: "Heart Rate",
      value: latestVital?.heartRateBpm ? `${latestVital.heartRateBpm} bpm` : "Track now",
      note: "Resting goal 60-100 bpm",
      accent: "orange",
      icon: "❤️",
      trend: heartTrend,
      series: getMetricSeries("heartRateBpm"),
    },
    {
      key: "bp",
      title: "Blood Pressure",
      value: latestVital ? `${latestVital.systolic || "--"}/${latestVital.diastolic || "--"}` : "Add vitals",
      note: "Keep it near 120/80",
      accent: "teal",
      icon: "🩺",
      trend: bpTrend,
      series: vitalsHistory
        .slice(0, 7)
        .reverse()
        .map((v) => Number(v?.systolic || 0)),
    },
    {
      key: "bmi",
      title: "BMI",
      value: latestVital?.bmi ?? "Add vitals",
      note: "Updated from your latest entry",
      accent: "blue",
      icon: "⚖️",
      trend: bmiTrend,
      series: getMetricSeries("bmi"),
    },
    {
      key: "weight",
      title: "Weight",
      value: latestVital?.weightKg ? `${latestVital.weightKg} kg` : "Log weight",
      note: "Track trends weekly",
      accent: "green",
      icon: "🏋️",
      trend: weightTrend,
      series: getMetricSeries("weightKg"),
    },
  ];

  const aiSummary = {
    sleep:
      sleepLogs.length > 0
        ? `Average sleep is ${(
            sleepLogs.slice(0, 7).reduce((sum, item) => sum + Number(item.sleepHours || 0), 0) /
            Math.min(7, sleepLogs.length)
          ).toFixed(1)} hrs this week.`
        : "No recent sleep logs. Add entries for better recovery insights.",
    activity:
      Number(smartwatchData?.stepsToday || 0) > 0
        ? `Today's steps: ${Number(smartwatchData.stepsToday).toLocaleString()} with ${healthScore >= 75 ? "strong" : "moderate"} activity rhythm.`
        : "Connect smartwatch to track live activity and trend accuracy.",
    heart:
      latestVital?.heartRateBpm
        ? `Heart rate is ${latestVital.heartRateBpm} bpm; ${heartTrend.direction === "up" ? "slightly rising" : heartTrend.direction === "down" ? "stabilizing downward" : "stable"} vs previous record.`
        : "No heart-rate data available yet.",
    recommendation:
      healthScore >= 80
        ? "Keep consistency: hydration + sleep + daily movement."
        : "Focus today on hydration, 20-30 min walk, and symptom/mood logging.",
  };

  const wellnessTasks = [
    { label: "Drink 8-10 glasses of water", done: false, icon: "💧" },
    {
      label: `Walk ${Math.max(1000, 10000 - Number(smartwatchData?.stepsToday || 0)).toLocaleString()} more steps`,
      done: Number(smartwatchData?.stepsToday || 0) >= 10000,
      icon: "🚶",
    },
    { label: "Track mood check-in", done: false, icon: "🧠" },
    { label: "Log symptoms before bedtime", done: false, icon: "📝" },
  ];

  const safetyStatus = {
    trustedContacts: user?.emergencyContacts?.length || 0,
    locationTracking: "Enabled",
    sosReadiness: lastSOS ? `Last used ${formatLastSOS()}` : "Ready",
  };

  const activityTimeline = [
    latestVital?.recordedAt
      ? { icon: "❤️", text: "Logged heart rate and vitals", time: new Date(latestVital.recordedAt).toLocaleString() }
      : null,
    symptomLogs[0]?.date
      ? { icon: "🩹", text: "Updated cycle symptoms", time: new Date(symptomLogs[0].date).toLocaleString() }
      : null,
    periods[0]?.startDate
      ? { icon: "📅", text: "Cycle history synced", time: new Date(periods[0].startDate).toLocaleDateString() }
      : null,
    smartwatchData?.lastSyncAt
      ? { icon: "⌚", text: "Smartwatch data synced", time: new Date(smartwatchData.lastSyncAt).toLocaleString() }
      : null,
  ].filter(Boolean);

  const smartNotifications = [
    { type: "reminder", text: "Log mood before 9 PM today." },
    { type: "reminder", text: "Track symptoms to improve cycle prediction accuracy." },
    { type: "hydration", text: "Hydration alert: drink water now." },
  ];

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-container page-with-header">
      <UserHeader onSidebarToggle={handleSidebarToggle} />
      <div className="dashboard-body">
        <UserSidebar className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`} />
        <main className="dashboard-main">
          <section className="dashboard-hero soft-surface">
            <div className="hero-text">
              <span className="hero-badge">{getGreeting()}, {friendlyName}</span>
              <h1>
                Your wellbeing summary <span>🌱</span>
              </h1>
              <p>
                Stay on top of your cycle, health vitals, and emergency readiness
                with a calm, soft interface crafted just for you.
              </p>
              <div className="hero-meta">
                <div className="meta-pill">Next period: {nextPeriodLabel()}</div>
                <div className="meta-pill">Last SOS: {formatLastSOS()}</div>
              </div>
              <div className="hero-health-grid">
                <article className="hero-health-card">
                  <span>Health Score</span>
                  <strong>{healthScore}/100</strong>
                  <small>{healthScore >= 80 ? "Excellent trend" : healthScore >= 65 ? "Good with room to improve" : "Needs attention"}</small>
                </article>
                <article className="hero-health-card">
                  <span>Cycle Status</span>
                  <strong>{cycleInfo.phase}</strong>
                  <small>Day {cycleInfo.cycleDay || "-"} • Energy {cycleInfo.energyLevel}</small>
                </article>
                <article className="hero-health-card">
                  <span>Risk Alerts</span>
                  <strong>{riskAlerts.length}</strong>
                  <small>{riskAlerts.length ? riskAlerts[0] : "No critical alerts"}</small>
                </article>
              </div>
            </div>
            <div className="hero-actions">
              <button className="sos-button" onClick={handleSOS}>
                <span className="sos-icon">🚨</span>
                <span className="sos-label">Send SOS Alert</span>
              </button>
              <p className="sos-hint">
                We will notify your trusted contacts instantly with your exact location.
              </p>
              <div className="sos-features">
                <div className="feature-item">
                  <span className="feature-icon">📍</span>
                  <span className="feature-text">GPS Location</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📧</span>
                  <span className="feature-text">Email Alert</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📱</span>
                  <span className="feature-text">SMS Alert</span>
                </div>
              </div>
            </div>
          </section>

          <section className="metrics-section">
            <div className="section-heading">
              <div>
                <h2>Health Snapshot</h2>
                <p>Key indicators from your latest entries.</p>
              </div>
              <button className="section-cta" onClick={() => navigate("/health")}>Update vitals</button>
            </div>
            <div className="metrics-grid">
              {metrics.map((metric) => (
                <article key={metric.key} className={`metric soft-tile ${metric.accent}`}>
                  <div className="metric-icon" aria-hidden="true">
                    {metric.icon}
                  </div>
                  <div className="metric-content">
                    <h4>{metric.title}</h4>
                    <p>{metric.value}</p>
                    <span className="metric-note">{metric.note}</span>
                    <div className={`metric-trend ${metric.trend.direction}`}>
                      <span>{metric.trend.direction === "up" ? "▲" : metric.trend.direction === "down" ? "▼" : "•"}</span>
                      <span>{metric.trend.label}</span>
                    </div>
                    <MiniSparkline points={metric.series} />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="dashboard-widgets-grid">
            <article className="widget-card">
              <h3>AI Health Summary</h3>
              <p><strong>Sleep:</strong> {aiSummary.sleep}</p>
              <p><strong>Activity:</strong> {aiSummary.activity}</p>
              <p><strong>Heart:</strong> {aiSummary.heart}</p>
              <p className="widget-reco"><strong>Recommendation:</strong> {aiSummary.recommendation}</p>
            </article>

            <article className="widget-card">
              <h3>Today's Wellness Plan</h3>
              <ul className="wellness-list">
                {wellnessTasks.map((task, idx) => (
                  <li key={idx} className={task.done ? "done" : ""}>
                    <span>{task.icon}</span>
                    <span>{task.label}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="widget-card">
              <h3>Cycle Insights</h3>
              <div className="cycle-grid">
                <div><span>Cycle Day</span><strong>{cycleInfo.cycleDay || "-"}</strong></div>
                <div><span>Phase</span><strong>{cycleInfo.phase}</strong></div>
                <div><span>Energy</span><strong>{cycleInfo.energyLevel}</strong></div>
              </div>
              <p className="widget-sub">Recommended activities:</p>
              <div className="chips-row">
                {cycleInfo.activities.map((item) => (
                  <span className="widget-chip" key={item}>{item}</span>
                ))}
              </div>
            </article>

            <article className="widget-card">
              <h3>Telehealth Quick Access</h3>
              <div className="quick-btns">
                <button onClick={() => navigate("/telehealth")} className="quick-btn">Ask AI Doctor</button>
                <button onClick={() => navigate("/telehealth/doctors")} className="quick-btn">Book Consultation</button>
                <button onClick={() => navigate("/telehealth/doctors")} className="quick-btn">Doctors Directory</button>
              </div>
            </article>

            <article className="widget-card">
              <h3>Safety Status</h3>
              <p><strong>Trusted contacts:</strong> {safetyStatus.trustedContacts}</p>
              <p><strong>Location tracking:</strong> {safetyStatus.locationTracking}</p>
              <p><strong>SOS readiness:</strong> {safetyStatus.sosReadiness}</p>
              <button className="quick-btn danger" onClick={handleSOS}>Test SOS</button>
            </article>

            <article className="widget-card">
              <h3>Smart Notifications</h3>
              <ul className="notify-list">
                {smartNotifications.map((notification, idx) => (
                  <li key={idx}>{notification.text}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="dashboard-widgets-grid">
            <article className="widget-card span-2">
              <h3>Health Analytics Preview</h3>
              <div className="analytics-mini-grid">
                <div>
                  <span>Weekly Steps</span>
                  <MiniSparkline points={exerciseLogs.slice(0, 7).reverse().map((item) => Number(item?.steps || item?.duration * 90 || 0))} />
                </div>
                <div>
                  <span>Weekly Sleep</span>
                  <MiniSparkline points={sleepLogs.slice(0, 7).reverse().map((item) => Number(item?.sleepHours || 0))} />
                </div>
                <div>
                  <span>Heart Rate</span>
                  <MiniSparkline points={vitalsHistory.slice(0, 7).reverse().map((item) => Number(item?.heartRateBpm || 0))} />
                </div>
              </div>
            </article>

            <article className="widget-card">
              <h3>Activity Timeline</h3>
              <ul className="dashboard-timeline-list">
                {activityTimeline.length === 0 ? (
                  <li>No recent health activities.</li>
                ) : (
                  activityTimeline.map((event, idx) => (
                    <li key={idx}>
                      <span className="dashboard-timeline-icon">{event.icon}</span>
                      <div>
                        <strong>{event.text}</strong>
                        <small>{event.time}</small>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </article>
          </section>

          <section className="quick-actions-section">
            <div className="section-heading">
              <div>
                <h2>Continue your journey</h2>
                <p>Shortcuts to keep caring for your mind and body.</p>
              </div>
            </div>
            <div className="quick-actions">
              <Link to="/health" className="action-card soft-surface green">
                <span className="icon">💗</span>
                <h3>Health Vitals</h3>
                <p>Log your daily health metrics</p>
                <span className="action-arrow">→</span>
              </Link>
              <Link to="/period-tracker" className="action-card soft-surface purple">
                <span className="icon">📅</span>
                <h3>Period Tracker</h3>
                <p>Track your cycle and symptoms</p>
                <span className="action-arrow">→</span>
              </Link>
              <Link to="/my-contacts" className="action-card soft-surface red">
                <span className="icon">🛡️</span>
                <h3>My Emergency Contacts</h3>
                <p>Manage trusted contacts</p>
                <span className="action-arrow">→</span>
              </Link>
              <Link to="/telehealth" className="action-card soft-surface purple">
                <span className="icon">🩺</span>
                <h3>Telehealth</h3>
                <p>Consult doctors and manage appointments</p>
                <span className="action-arrow">→</span>
              </Link>
              <Link to="/resources" className="action-card soft-surface blue">
                <span className="icon">📚</span>
                <h3>Resource Hub</h3>
                <p>Browse health &amp; safety resources</p>
                <span className="action-arrow">→</span>
              </Link>
              <Link to="/helplines" className="action-card soft-surface orange">
                <span className="icon">📞</span>
                <h3>Helplines</h3>
                <p>Quick access to emergency support</p>
                <span className="action-arrow">→</span>
              </Link>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}

function MiniSparkline({ points = [] }) {
  const safePoints = points.filter((point) => Number.isFinite(point));
  if (safePoints.length < 2) {
    return <div className="sparkline-empty" />;
  }
  const width = 120;
  const height = 32;
  const min = Math.min(...safePoints);
  const max = Math.max(...safePoints);
  const range = max - min || 1;

  const coordinates = safePoints.map((point, index) => {
    const x = (index / (safePoints.length - 1)) * width;
    const y = height - ((point - min) / range) * height;
    return `${x},${y}`;
  });

  return (
    <svg className="mini-sparkline" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline points={coordinates.join(" ")} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
