import React, { useMemo, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Label,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import api from "../../services/api";
import { pregnancyWeeks } from "../../data/pregnancyWeeks";
import PregnancyRiskGraph from "../../components/pregnancy/PregnancyRiskGraph";
import "./PregnancyHealthLog.css";

export default function PregnancyHealthLog({ currentWeek = 20 }) {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("log");
  const [symptomSeverity, setSymptomSeverity] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [uploadedScan, setUploadedScan] = useState(null);
  const [scanPreview, setScanPreview] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    symptoms: [],
    mood: "calm",
    weight: "145",
    bloodPressureSystolic: "120",
    bloodPressureDiastolic: "80",
    bloodSugar: "95",
    notes: '',
    heartRate: "75",
    temperature: "98.6",
    sleepHours: "7.5",
    stressLevel: "low",
  });

  // Available options
  const symptomOptions = [
    'Nausea',
    'Fatigue',
    'Back Pain',
    'Headache',
    'Heartburn',
    'Swelling',
    'Leg Cramps',
    'Dizziness'
  ];

  // Load logs on component mount and when date changes
  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    return () => {
      if (scanPreview) {
        URL.revokeObjectURL(scanPreview);
      }
    };
  }, [scanPreview]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pregnancy/logs?limit=100');
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Create pregnancy log entry
      const logData = {
        week: calculateWeek(formData.date),
        date: formData.date,
        symptoms: formData.symptoms,
        mood: formData.mood,
        weightKg: formData.weight || null,
        notes: formData.notes || ''
      };

      if (formData.bloodPressureSystolic || formData.bloodPressureDiastolic) {
        logData.bloodPressure = {
          systolic: formData.bloodPressureSystolic || null,
          diastolic: formData.bloodPressureDiastolic || null
        };
      }

      if (formData.bloodSugar) {
        logData.bloodSugar = formData.bloodSugar;
      }

      await api.post('/pregnancy/logs', logData);
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        symptoms: [],
        mood: "calm",
        weight: "145",
        bloodPressureSystolic: "120",
        bloodPressureDiastolic: "80",
        bloodSugar: "95",
        notes: '',
        heartRate: "75",
        temperature: "98.6",
        sleepHours: "7.5",
        stressLevel: "low",
      });
      
      // Reload logs
      await loadLogs();
      
      alert('Health log saved successfully!');
    } catch (error) {
      console.error('Error saving log:', error);
      alert('Failed to save health log');
    } finally {
      setLoading(false);
    }
  };

  const calculateWeek = (date) => {
    // This is a simplified calculation
    // In a real app, you'd calculate based on LMP or conception date
    const today = new Date();
    const selectedDate = new Date(date);
    const diffTime = today - selectedDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    return Math.max(1, Math.min(40, weeks));
  };

  const handleSymptomToggle = (symptom) => {
    const symptoms = formData.symptoms.includes(symptom)
      ? formData.symptoms.filter(s => s !== symptom)
      : [...formData.symptoms, symptom];
    if (!symptoms.includes(symptom)) {
      setSymptomSeverity((prev) => {
        const next = { ...prev };
        delete next[symptom];
        return next;
      });
    }
    setFormData({ ...formData, symptoms });
  };

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateSymptomSeverity = (symptom, value) => {
    setSymptomSeverity((prev) => ({ ...prev, [symptom]: Number(value) }));
  };

  const toNum = (value) => Number(value || 0);

  const getStatusClass = (status) => {
    if (status === "High Risk" || status === "High") return "high";
    if (status === "Warning") return "warning";
    return "normal";
  };

  const getBPStatus = (sys, dia) => {
    if (sys > 140 || dia > 90) return "High";
    if (sys > 130 || dia > 85) return "Warning";
    return "Normal";
  };

  const getBloodSugarStatus = (sugar) => {
    if (sugar > 140) return "High Risk";
    if (sugar > 110) return "Warning";
    return "Healthy";
  };

  const getHeartRateStatus = (rate) => {
    if (rate > 110 || rate < 55) return "High Risk";
    if (rate > 95 || rate < 60) return "Warning";
    return "Normal";
  };

  const getTemperatureStatus = (temp) => {
    if (temp >= 100.4 || temp < 96.5) return "High Risk";
    if (temp >= 99.5) return "Warning";
    return "Normal";
  };

  const getSleepStatus = (sleepHours) => {
    if (sleepHours < 5) return "High Risk";
    if (sleepHours < 7) return "Warning";
    return "Good";
  };

  const calculateHealthScore = (healthData) => {
    let score = 100;
    const bpStatus = getBPStatus(healthData.sys, healthData.dia);
    const sugarStatus = getBloodSugarStatus(healthData.sugar);
    const hrStatus = getHeartRateStatus(healthData.heartRate);
    const tempStatus = getTemperatureStatus(healthData.temperature);
    const sleepStatus = getSleepStatus(healthData.sleepHours);
    const stress = String(healthData.stressLevel || "");

    const penalties = {
      Normal: 0,
      Healthy: 0,
      Good: 0,
      Warning: 8,
      High: 14,
      "High Risk": 18,
    };

    score -= penalties[bpStatus] || 0;
    score -= penalties[sugarStatus] || 0;
    score -= penalties[hrStatus] || 0;
    score -= penalties[tempStatus] || 0;
    score -= penalties[sleepStatus] || 0;

    if (stress === "very-high") score -= 12;
    else if (stress === "high") score -= 8;
    else if (stress === "moderate") score -= 4;

    const severeSymptoms = Object.values(symptomSeverity).filter((v) => Number(v) >= 4).length;
    score -= severeSymptoms * 3;

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const getTodayMetrics = () => {
    const sys = toNum(formData.bloodPressureSystolic);
    const dia = toNum(formData.bloodPressureDiastolic);
    const sugar = toNum(formData.bloodSugar);
    const heartRate = toNum(formData.heartRate);
    const temperature = toNum(formData.temperature);
    const sleepHours = toNum(formData.sleepHours);
    const weight = toNum(formData.weight);

    const bpStatus = getBPStatus(sys, dia);
    const sugarStatus = getBloodSugarStatus(sugar);
    const heartRateStatus = getHeartRateStatus(heartRate);
    const temperatureStatus = getTemperatureStatus(temperature);
    const sleepStatus = getSleepStatus(sleepHours);
    const healthScore = calculateHealthScore({
      sys,
      dia,
      sugar,
      heartRate,
      temperature,
      sleepHours,
      stressLevel: formData.stressLevel,
    });

    return {
      sys,
      dia,
      sugar,
      heartRate,
      temperature,
      sleepHours,
      weight,
      bpStatus,
      sugarStatus,
      heartRateStatus,
      temperatureStatus,
      sleepStatus,
      healthScore,
    };
  };

  const normalizeDateLabel = (dateValue) =>
    new Date(dateValue).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const handleScanFile = (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    const accepted = ["png", "jpg", "jpeg", "dcm", "dicom"];
    if (!accepted.includes(ext)) {
      alert("Unsupported file format. Please upload PNG, JPG, or DICOM.");
      return;
    }
    setUploadedScan(file);
    if (["png", "jpg", "jpeg"].includes(ext)) {
      const previewUrl = URL.createObjectURL(file);
      setScanPreview(previewUrl);
    } else {
      setScanPreview("");
    }
  };

  const recentLogs = logs.slice(0, 5);

  const stressLevels = ["very-low", "low", "moderate", "high", "very-high"];
  const stressLabels = {
    "very-low": "😌 Very Low",
    low: "🙂 Low",
    moderate: "😐 Moderate",
    high: "😟 High",
    "very-high": "😫 Very High",
  };

  const todayMetrics = useMemo(() => getTodayMetrics(), [formData, symptomSeverity]);
  const weekTip = useMemo(
    () => pregnancyWeeks[currentWeek]?.tips?.[0] || "Prioritize hydration, balanced meals, and regular prenatal monitoring.",
    [currentWeek]
  );
  const consistency = useMemo(() => {
    const last7 = new Set();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 6);
    logs.forEach((log) => {
      const d = new Date(log.date);
      if (!Number.isNaN(d.getTime()) && d >= cutoff) {
        last7.add(d.toISOString().split("T")[0]);
      }
    });
    return Math.min(7, last7.size);
  }, [logs]);

  const healthAlerts = useMemo(() => {
    const alerts = [];
    if (todayMetrics.bpStatus === "High" || todayMetrics.bpStatus === "Warning") {
      alerts.push("High Blood Pressure: Monitor BP daily and reduce sodium intake.");
    }
    if (todayMetrics.sleepStatus === "High Risk" || todayMetrics.sleepStatus === "Warning") {
      alerts.push("Poor Sleep Quality: Follow a regular sleep routine and reduce screen time before bed.");
    }
    if (todayMetrics.sugarStatus === "High Risk" || todayMetrics.sugarStatus === "Warning") {
      alerts.push("Blood Sugar Alert: Focus on balanced meals and discuss glucose checks with your doctor.");
    }
    if (todayMetrics.heartRateStatus === "High Risk") {
      alerts.push("Heart Rate Alert: Rest and seek medical guidance if symptoms persist.");
    }
    return alerts;
  }, [todayMetrics]);

  const aiInsight = useMemo(() => {
    if (!healthAlerts.length) {
      return "Your blood pressure, blood sugar, and heart rate are within healthy ranges. Continue hydration, prenatal vitamins, and light exercise.";
    }
    return `⚠ ${healthAlerts[0]}`;
  }, [healthAlerts]);
  const getAlertLevel = (alertText) => {
    const text = String(alertText).toLowerCase();
    if (text.includes("high") || text.includes("alert")) return "high";
    if (text.includes("poor") || text.includes("monitor")) return "medium";
    return "low";
  };

  const trendRows = useMemo(() => {
    const rows = logs
      .slice(0, 7)
      .reverse()
      .map((log) => ({
        label: normalizeDateLabel(log.date),
        systolic: Number(log.bloodPressure?.systolic) || null,
        diastolic: Number(log.bloodPressure?.diastolic) || null,
        weight: Number(log.weightKg) || null,
        heartRate: Number(log.heartRate || log.vitals?.heartRate) || null,
      }));

    rows.push({
      label: "Today",
      systolic: todayMetrics.sys || null,
      diastolic: todayMetrics.dia || null,
      weight: todayMetrics.weight || null,
      heartRate: todayMetrics.heartRate || null,
    });
    return rows;
  }, [logs, todayMetrics]);

  const miniCharts = [
    { title: "Heart Rate Trend", keyA: "heartRate", colorA: "#ef4444" },
    { title: "Weight Trend", keyA: "weight", colorA: "#ec4899" },
  ];
  const currentRiskHealthData = useMemo(
    () => ({
      systolic: todayMetrics.sys,
      diastolic: todayMetrics.dia,
      bloodSugar: todayMetrics.sugar,
      hemoglobin: Number(logs?.[0]?.hemoglobin ?? logs?.[0]?.hb) || 11.5,
      weightGain: Number(logs?.[0]?.weightGain) || 0,
      sleepHours: todayMetrics.sleepHours,
      symptoms: formData.symptoms,
    }),
    [todayMetrics, logs, formData.symptoms]
  );

  const renderBloodPressureChart = (height = 220) => (
    <div className="trend-card bp-trend-card">
      <h4>Blood Pressure Trend</h4>
      <div className="trend-canvas">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={trendRows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1e8ff" />
            <XAxis dataKey="label">
              <Label value="Date" offset={-4} position="insideBottom" />
            </XAxis>
            <YAxis domain={[50, 180]}>
              <Label value="Blood Pressure (mmHg)" angle={-90} position="insideLeft" />
            </YAxis>
            <Tooltip formatter={(value) => [`${value} mmHg`, "Value"]} />
            <Legend />
            <Line
              type="monotone"
              dataKey="systolic"
              name="Systolic"
              stroke="#ef4444"
              strokeWidth={2.6}
              dot={{ r: 3 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="diastolic"
              name="Diastolic"
              stroke="#3b82f6"
              strokeWidth={2.6}
              dot={{ r: 3 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <section className="preg-health-page">
      <div className="preg-health-header">
        <h1>Health & Symptom Tracker</h1>
        <p>Log your daily health metrics and symptoms</p>
      </div>
      <div className="preg-health-tabs">
        <button className={activeTab === "log" ? "active" : ""} onClick={() => setActiveTab("log")}>Log Health Data</button>
        <button className={activeTab === "history" ? "active" : ""} onClick={() => setActiveTab("history")}>Health History</button>
        <button className={activeTab === "trends" ? "active" : ""} onClick={() => setActiveTab("trends")}>Trends & Charts</button>
      </div>

      {activeTab === "log" ? (
        <div className="log-sections">
          <article className="overview-card section-block">
            <div>
              <h3>Today's Health Overview</h3>
              <p>Smart maternal health summary for today.</p>
            </div>
            <div className="overview-grid">
              <div className="overview-metric">
                <span className="overview-icon">🩸</span>
                <small>Blood Pressure</small>
                <p>{todayMetrics.bpStatus}</p>
              </div>
              <div className="overview-metric">
                <span className="overview-icon">🧪</span>
                <small>Blood Sugar</small>
                <p>{todayMetrics.sugarStatus}</p>
              </div>
              <div className="overview-metric">
                <span className="overview-icon">💓</span>
                <small>Heart Rate</small>
                <p>{todayMetrics.heartRateStatus}</p>
              </div>
              <div className="overview-metric">
                <span className="overview-icon">🌙</span>
                <small>Sleep</small>
                <p>{todayMetrics.sleepStatus}</p>
              </div>
              <div className="overview-score">
                <small>Overall Health Score</small>
                <strong>{todayMetrics.healthScore} / 100</strong>
              </div>
            </div>
          </article>

          <article className="health-metrics-card section-block">
            <h3>Daily Health Metrics</h3>
            <div className="metrics-grid metric-cards-grid">
              <div className="metric-card">
                <label><span className="metric-icon">🩸</span><span>Blood Pressure</span></label>
                <span className={`status-chip ${getStatusClass(todayMetrics.bpStatus)}`}>{todayMetrics.bpStatus}</span>
                <div className="pair">
                  <input type="number" min="70" max="220" placeholder="Systolic" value={formData.bloodPressureSystolic} onChange={(e) => updateFormData("bloodPressureSystolic", e.target.value)} />
                  <input type="number" min="40" max="140" placeholder="Diastolic" value={formData.bloodPressureDiastolic} onChange={(e) => updateFormData("bloodPressureDiastolic", e.target.value)} />
                </div>
                <small>mmHg (e.g., 120/80)</small>
              </div>
              <div className="metric-card">
                <label><span className="metric-icon">🧪</span><span>Blood Sugar</span></label>
                <span className={`status-chip ${getStatusClass(todayMetrics.sugarStatus)}`}>{todayMetrics.sugarStatus}</span>
                <input type="number" min="40" max="260" value={formData.bloodSugar} onChange={(e) => updateFormData("bloodSugar", e.target.value)} />
                <small>mg/dL</small>
              </div>
              <div className="metric-card">
                <label><span className="metric-icon">🌡️</span><span>Temperature</span></label>
                <span className={`status-chip ${getStatusClass(todayMetrics.temperatureStatus)}`}>{todayMetrics.temperatureStatus}</span>
                <input type="number" step="0.1" min="94" max="106" value={formData.temperature} onChange={(e) => updateFormData("temperature", e.target.value)} />
                <small>°F</small>
              </div>
              <div className="metric-card">
                <label><span className="metric-icon">❤️</span><span>Heart Rate</span></label>
                <span className={`status-chip ${getStatusClass(todayMetrics.heartRateStatus)}`}>{todayMetrics.heartRateStatus}</span>
                <input type="number" min="40" max="180" value={formData.heartRate} onChange={(e) => updateFormData("heartRate", e.target.value)} />
                <small>bpm</small>
              </div>
              <div className="metric-card">
                <label><span className="metric-icon">⚖️</span><span>Weight</span></label>
                <span className="status-chip normal">Track Daily</span>
                <input type="number" min="60" max="350" value={formData.weight} onChange={(e) => updateFormData("weight", e.target.value)} />
                <small>lbs</small>
              </div>
              <div className="metric-card">
                <label><span className="metric-icon">😴</span><span>Sleep Hours</span></label>
                <span className={`status-chip ${getStatusClass(todayMetrics.sleepStatus)}`}>{todayMetrics.sleepStatus}</span>
                <input type="number" step="0.5" min="0" max="16" value={formData.sleepHours} onChange={(e) => updateFormData("sleepHours", e.target.value)} />
                <small>hours</small>
              </div>
            </div>

            <div className="stress-row">
              <label>Stress Level</label>
              <div className="stress-options">
                {stressLevels.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={formData.stressLevel === s ? "active" : ""}
                    onClick={() => updateFormData("stressLevel", s)}
                  >
                    {stressLabels[s]}
                  </button>
                ))}
              </div>
            </div>
          </article>

          <article className="symptoms-card section-block">
            <h3>Symptoms Today</h3>
            <div className="symptoms-grid">
              {symptomOptions.map((symptom) => (
                <div key={symptom} className="symptom-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.symptoms.includes(symptom)}
                      onChange={() => handleSymptomToggle(symptom)}
                    />
                    <span>{symptom}</span>
                  </label>
                  {formData.symptoms.includes(symptom) ? (
                    <div className="symptom-severity">
                      <small>Severity: {symptomSeverity[symptom] || 0} / 5</small>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        value={symptomSeverity[symptom] || 0}
                        onChange={(e) => updateSymptomSeverity(symptom, e.target.value)}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </article>

          <article className="ai-insight-card section-block">
            <h3>AI Health Insight</h3>
            <p>{aiInsight}</p>
          </article>

          <PregnancyRiskGraph currentHealthData={currentRiskHealthData} logs={logs} />

          <article className="alerts-card section-block">
            <h3>Health Alerts</h3>
            {healthAlerts.length ? (
              <ul>
                {healthAlerts.map((alert) => (
                  <li key={alert}>
                    <span className={`alert-level ${getAlertLevel(alert)}`}>{getAlertLevel(alert).toUpperCase()}</span>
                    <span>⚠ {alert}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No critical alerts right now. Keep tracking daily.</p>
            )}
          </article>

          <article className="mini-trends-card section-block">
            <h3>Mini Health Trend Charts</h3>
            <div className="mini-chart-grid">
              {renderBloodPressureChart(180)}
              {miniCharts.map((chart) => (
                <div className="trend-card" key={chart.title}>
                  <h4>{chart.title}</h4>
                  <div className="trend-canvas">
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={trendRows}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1e8ff" />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        {chart.keyB ? <Legend /> : null}
                        <Line type="monotone" dataKey={chart.keyA} stroke={chart.colorA} strokeWidth={2.5} dot={{ r: 3 }} />
                        {chart.keyB ? (
                          <Line type="monotone" dataKey={chart.keyB} stroke={chart.colorB} strokeWidth={2.5} dot={{ r: 3 }} />
                        ) : null}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="upload-card section-block">
            <h3>Upload Ultrasound Scan (Optional)</h3>
            <div
              className={`upload-box ${dragActive ? "drag-active" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                handleScanFile(e.dataTransfer.files?.[0]);
              }}
            >
              <span>Drag & drop scan here</span>
              <small>Supported: PNG, JPG, DICOM</small>
              <label className="upload-browse">
                Browse File
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.dcm,.dicom"
                  onChange={(e) => handleScanFile(e.target.files?.[0])}
                  hidden
                />
              </label>
              {uploadedScan ? <p className="upload-file-name">{uploadedScan.name}</p> : null}
              {scanPreview ? <img src={scanPreview} alt="Ultrasound preview" className="scan-preview" /> : null}
            </div>
          </article>

          <div className="health-extra-grid">
            <article className="reminders-card">
              <h3>Today's Health Reminders</h3>
              <ul>
                <li>💧 Drink 2L water</li>
                <li>🍎 Take prenatal vitamins</li>
                <li>🏋️ 20 minutes walking</li>
                <li>📝 Log health metrics</li>
              </ul>
            </article>

            <article className="consistency-card">
              <h3>Weekly Health Consistency</h3>
              <p>Logged data: {consistency} / 7 days</p>
              <div className="consistency-track">
                <div className="consistency-fill" style={{ width: `${(consistency / 7) * 100}%` }} />
              </div>
            </article>
          </div>

          <article className="preg-week-tip-card section-block">
            <h3>Week {currentWeek} Health Tip</h3>
            <p>💡 {weekTip}</p>
          </article>

          <div className="save-row">
            <button className="save-btn" type="button" onClick={handleSubmit}>Save Health Log</button>
          </div>
        </div>
      ) : null}

      {activeTab === "history" ? (
        <article className="history-card">
          <h3>Health History</h3>
          <div className="history-list">
            {recentLogs.map((log) => (
              <div className="history-row" key={log._id}>
                <div>
                  <strong>
                    {new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </strong>
                </div>
                <div>
                  <small>Blood Pressure</small>
                  <p>{log.bloodPressure?.systolic && log.bloodPressure?.diastolic ? `${log.bloodPressure.systolic}/${log.bloodPressure.diastolic}` : "--"}</p>
                </div>
                <div>
                  <small>Blood Sugar</small>
                  <p>{log.bloodSugar || "--"} mg/dL</p>
                </div>
                <div>
                  <small>Weight</small>
                  <p>{log.weightKg || "--"} lbs</p>
                </div>
                <div>
                  <small>Symptoms</small>
                  <p>{log.symptoms?.length ? log.symptoms.slice(0, 2).join(", ").toLowerCase() : "None"}</p>
                </div>
                <span className="pulse">〽</span>
              </div>
            ))}
          </div>
        </article>
      ) : null}

      {activeTab === "trends" ? (
        <div className="trends-wrap">
          {renderBloodPressureChart(220)}
          {miniCharts.map((chart) => (
            <div className="trend-card" key={chart.title}>
              <h4>{chart.title}</h4>
              <div className="trend-canvas">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trendRows}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1e8ff" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    {chart.keyB ? <Legend /> : null}
                    <Line type="monotone" dataKey={chart.keyA} stroke={chart.colorA} strokeWidth={2.5} dot={{ r: 4 }} />
                    {chart.keyB ? (
                      <Line type="monotone" dataKey={chart.keyB} stroke={chart.colorB} strokeWidth={2.5} dot={{ r: 4 }} />
                    ) : null}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {loading ? (
        <div className="preg-health-loading">
          <div className="loader" />
          <span>Processing...</span>
        </div>
      ) : null}
    </section>
  );
}
