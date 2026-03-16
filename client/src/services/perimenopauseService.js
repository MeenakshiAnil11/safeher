const LOGS_KEY = "perimenopause_logs_v2";
const REMINDERS_KEY = "perimenopause_reminders_v2";

const moodToScore = {
  happy: 92,
  energetic: 88,
  calm: 80,
  neutral: 65,
  tired: 52,
  anxious: 40,
  irritable: 34,
  sad: 28,
};

const cycleToScore = {
  regular: 90,
  irregular: 52,
  missed: 35,
  heavy: 48,
};

export const normalizeLog = (log = {}) => ({
  date: log.date || new Date().toISOString(),
  mood: String(log.mood || "neutral").toLowerCase(),
  hotFlashIntensity: Math.max(0, Math.min(10, Number(log.hotFlashIntensity) || 0)),
  sleepQuality: Math.max(1, Math.min(5, Number(log.sleepQuality) || 3)),
  cycleStatus: String(log.cycleStatus || "regular").toLowerCase(),
  weight: log.weight === "" || log.weight == null ? null : Number(log.weight),
  notes: String(log.notes || ""),
});

export const getStoredLogs = () => {
  const raw = JSON.parse(localStorage.getItem(LOGS_KEY) || "[]");
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeLog).sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const appendLog = (log) => {
  const next = [...getStoredLogs(), normalizeLog(log)];
  localStorage.setItem(LOGS_KEY, JSON.stringify(next));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("perimenopause-logs-updated", { detail: { count: next.length } }));
  }
  return next;
};

export const setStoredReminders = (reminders = []) => {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
};

export const getStoredReminders = () => {
  const raw = JSON.parse(localStorage.getItem(REMINDERS_KEY) || "[]");
  return Array.isArray(raw) ? raw : [];
};

export const average = (values = []) => {
  if (!values.length) return 0;
  return values.reduce((sum, item) => sum + item, 0) / values.length;
};

export const calculateHormonalBalance = (logs = []) => {
  if (!logs.length) return 0;
  const recent = logs.slice(-7);
  const moodScore = average(recent.map((item) => moodToScore[item.mood] ?? 60));
  const sleepScore = average(recent.map((item) => (Number(item.sleepQuality) || 3) * 20));
  const hotFlashScore = average(recent.map((item) => 100 - ((Number(item.hotFlashIntensity) || 0) / 10) * 100));
  const cycleScore = average(recent.map((item) => cycleToScore[item.cycleStatus] ?? 60));
  const weighted = moodScore * 0.3 + sleepScore * 0.3 + hotFlashScore * 0.25 + cycleScore * 0.15;
  return Math.max(0, Math.min(100, Math.round(weighted)));
};

export const calculateSleepMoodCorrelation = (logs = []) => {
  const recent = logs.slice(-14);
  if (recent.length < 3) return 0;
  const x = recent.map((item) => Number(item.sleepQuality) || 0);
  const y = recent.map((item) => (moodToScore[item.mood] ?? 60) / 20);
  const xMean = average(x);
  const yMean = average(y);
  const numerator = recent.reduce((sum, _, idx) => sum + (x[idx] - xMean) * (y[idx] - yMean), 0);
  const xDen = Math.sqrt(recent.reduce((sum, _, idx) => sum + (x[idx] - xMean) ** 2, 0));
  const yDen = Math.sqrt(recent.reduce((sum, _, idx) => sum + (y[idx] - yMean) ** 2, 0));
  if (!xDen || !yDen) return 0;
  return Number((numerator / (xDen * yDen)).toFixed(2));
};

export const detectPatterns = (logs = []) => {
  const recent = logs.slice(-7);
  const prev = logs.slice(-14, -7);
  const warnings = [];
  if (!recent.length) return warnings;
  const recentHotFlash = average(recent.map((item) => Number(item.hotFlashIntensity) || 0));
  const prevHotFlash = average(prev.map((item) => Number(item.hotFlashIntensity) || 0));
  if (recentHotFlash >= 6 && recentHotFlash > prevHotFlash + 1) {
    warnings.push("Hot flash intensity is increasing over the last week.");
  }
  const recentSleep = average(recent.map((item) => Number(item.sleepQuality) || 0));
  if (recentSleep <= 2.2) {
    warnings.push("Sleep quality has remained low in recent logs.");
  }
  const anxiousDays = recent.filter((item) => ["anxious", "irritable", "sad"].includes(item.mood)).length;
  if (anxiousDays >= 4) {
    warnings.push("Mood pattern indicates elevated emotional stress this week.");
  }
  return warnings;
};

export const determineStage = (logs = [], stages = {}) => {
  const recent = logs.slice(-30);
  const cycleIrregularRatio = recent.length
    ? recent.filter((item) => item.cycleStatus !== "regular").length / recent.length
    : 0;
  const hotFlashAvg = average(recent.map((item) => Number(item.hotFlashIntensity) || 0));
  if (cycleIrregularRatio >= 0.6 || hotFlashAvg >= 7) return stages.late || { key: "late", label: "Late Stage" };
  if (cycleIrregularRatio >= 0.3 || hotFlashAvg >= 4) return stages.mid || { key: "mid", label: "Mid Stage" };
  return stages.early || { key: "early", label: "Early Stage" };
};

export const groupLogsByLastDays = (logs = [], days = 7) => {
  const now = new Date();
  const rows = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dayKey = d.toISOString().slice(0, 10);
    const dayLogs = logs.filter((item) => String(item.date).slice(0, 10) === dayKey);
    rows.push({
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: dayKey,
      mood: average(dayLogs.map((item) => (moodToScore[item.mood] ?? 60) / 20)),
      sleepQuality: average(dayLogs.map((item) => Number(item.sleepQuality) || 0)),
      hotFlashIntensity: average(dayLogs.map((item) => Number(item.hotFlashIntensity) || 0)),
      weight: average(dayLogs.map((item) => Number(item.weight)).filter((num) => !Number.isNaN(num))),
      count: dayLogs.length,
    });
  }
  return rows;
};

export const filterLogsByDate = (logs = [], startDate, endDate) => {
  const start = startDate ? new Date(startDate).getTime() : null;
  const end = endDate ? new Date(endDate).getTime() : null;
  return logs.filter((item) => {
    const t = new Date(item.date).getTime();
    if (start && t < start) return false;
    if (end && t > end) return false;
    return true;
  });
};

export default {
  LOGS_KEY,
  REMINDERS_KEY,
  normalizeLog,
  getStoredLogs,
  appendLog,
  setStoredReminders,
  getStoredReminders,
  calculateHormonalBalance,
  calculateSleepMoodCorrelation,
  detectPatterns,
  determineStage,
  groupLogsByLastDays,
  filterLogsByDate,
};
