import React, { useMemo, useState, useEffect } from "react";
import api from "../../services/api";
import {
  calculateHormonalBalance,
  getStoredLogs,
  getStoredReminders,
  determineStage,
} from "../../services/perimenopauseService";
import perimenopauseStages from "../../data/perimenopauseStages";
import { calculateMenopauseRisk } from "../../ai/menopausePredictor";
import AIHealthInsights from "../../components/AIHealthInsights";

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "No logs yet";
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
};

const resolveLastSymptom = (log = {}) => {
  if (!log || !Object.keys(log).length) return "No symptom logged";
  if ((Number(log.hotFlashIntensity) || 0) >= 6) return "Hot flash spike";
  if ((Number(log.sleepQuality) || 0) <= 2) return "Poor sleep quality";
  if (["anxious", "irritable", "sad"].includes(log.mood)) return "Mood instability";
  return "General symptom check-in";
};

export default function PerimenopauseOverview() {
  const [logs, setLogs] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [symptomRes, reminderRes] = await Promise.allSettled([
          api.get("/perimenopause/symptoms"),
          api.get("/perimenopause/reminders"),
        ]);
        const apiLogs =
          symptomRes.status === "fulfilled" && Array.isArray(symptomRes.value.data?.logs)
            ? symptomRes.value.data.logs
            : [];
        const apiReminders =
          reminderRes.status === "fulfilled" && Array.isArray(reminderRes.value.data?.reminders)
            ? reminderRes.value.data.reminders
            : [];
        const finalLogs = apiLogs.length ? apiLogs : getStoredLogs();
        const finalReminders = apiReminders.length ? apiReminders : getStoredReminders();
        setLogs(finalLogs);
        setReminders(finalReminders);
      } catch (error) {
        setLogs(getStoredLogs());
        setReminders(getStoredReminders());
      } finally {
        setLastUpdated(new Date());
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const hormonalBalanceIndex = useMemo(() => calculateHormonalBalance(logs), [logs]);
  const latestLog = useMemo(() => logs.slice().sort((a, b) => new Date(b.date) - new Date(a.date))[0], [logs]);
  const stage = useMemo(() => determineStage(logs, perimenopauseStages), [logs]);
  const nextAppointment = useMemo(() => {
    const next = reminders
      .filter((item) => String(item.category).toLowerCase() === "appointment")
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .find((item) => new Date(item.date) >= new Date());
    return next || null;
  }, [reminders]);

  const userAge = useMemo(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.age) return Number(user.age);
    if (user.dateOfBirth) {
      const dob = new Date(user.dateOfBirth);
      const age = new Date().getFullYear() - dob.getFullYear();
      return Number.isFinite(age) ? age : 44;
    }
    return 44;
  }, []);

  const riskData = useMemo(
    () =>
      calculateMenopauseRisk({
        age: userAge,
        mood: latestLog?.mood,
        sleepQuality: latestLog?.sleepQuality,
        hotFlashIntensity: latestLog?.hotFlashIntensity,
        cycleStatus: latestLog?.cycleStatus,
        weight: latestLog?.weight,
      }),
    [latestLog, userAge]
  );

  return (
    <div className="bg-gradient-to-br from-lavender-50 to-white rounded-2xl p-5">
      <div className="mb-5">
        <h2 className="text-3xl font-bold text-gray-800">Perimenopause Overview</h2>
        <p className="text-gray-600">Dynamic AI-assisted health snapshot</p>
        <small className="text-gray-400">Updated: {lastUpdated.toLocaleTimeString()}</small>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading overview...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <article className="bg-white border border-lavender-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500">Perimenopause Stage</p>
            <h3 className="text-xl font-semibold text-gray-800 mt-1">{stage.label}</h3>
            <p className="text-sm text-gray-600 mt-2">{stage.description}</p>
          </article>

          <article className="bg-white border border-lavender-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500">Hormonal Balance Index</p>
            <h3 className="text-2xl font-bold text-purple-700 mt-1">{hormonalBalanceIndex} / 100</h3>
            <div className="w-full h-2 mt-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400" style={{ width: `${hormonalBalanceIndex}%` }} />
            </div>
          </article>

          <article className="bg-white border border-lavender-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500">Last Logged Symptom</p>
            <h3 className="text-xl font-semibold text-gray-800 mt-1">{resolveLastSymptom(latestLog)}</h3>
            <p className="text-sm text-gray-600 mt-2">{formatTimestamp(latestLog?.date)}</p>
          </article>

          <article className="bg-white border border-lavender-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500">Next Appointment</p>
            <h3 className="text-xl font-semibold text-gray-800 mt-1">
              {nextAppointment?.title || "Not scheduled"}
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              {nextAppointment ? new Date(nextAppointment.date).toLocaleDateString() : "Add an appointment reminder"}
            </p>
          </article>
        </div>
      )}

      {!loading && (
        <article className="bg-white border border-lavender-200 rounded-xl p-4 shadow-sm mt-4">
          <p className="text-xs text-gray-500">AI Menopause Risk Predictor</p>
          <h3 className="text-xl font-semibold text-gray-800 mt-1">Risk: {riskData.riskScore}%</h3>
          <p
            className={`text-sm mt-1 font-medium ${
              riskData.riskLevel === "High"
                ? "text-red-600"
                : riskData.riskLevel === "Medium"
                ? "text-amber-600"
                : "text-green-600"
            }`}
          >
            {riskData.riskLevel} Risk
          </p>
          <div className="w-full h-3 mt-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                riskData.riskLevel === "High"
                  ? "bg-red-500"
                  : riskData.riskLevel === "Medium"
                  ? "bg-amber-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${riskData.riskScore}%` }}
            />
          </div>
        </article>
      )}

      {!loading && (
        <div className="mt-4">
          <AIHealthInsights logs={logs} title="AI Symptom Pattern Insights" maxItems={3} />
        </div>
      )}
    </div>
  );
}
