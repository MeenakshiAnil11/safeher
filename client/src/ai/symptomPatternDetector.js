const moodScoreMap = {
  happy: 4,
  energetic: 4,
  calm: 3.5,
  neutral: 3,
  tired: 2.5,
  anxious: 2,
  irritable: 1.8,
  sad: 1.5,
};

const average = (list = []) => (list.length ? list.reduce((sum, value) => sum + value, 0) / list.length : 0);

const stdDev = (list = []) => {
  if (!list.length) return 0;
  const mean = average(list);
  const variance = average(list.map((value) => (value - mean) ** 2));
  return Math.sqrt(variance);
};

const toDate = (value) => new Date(value).getTime();

const filterLastDays = (logs = [], days = 7) => {
  const end = Date.now();
  const start = end - days * 24 * 60 * 60 * 1000;
  return logs.filter((log) => {
    const time = toDate(log.date);
    return time >= start && time <= end;
  });
};

export function detectPatterns(logs = []) {
  const normalized = [...logs].sort((a, b) => toDate(a.date) - toDate(b.date));
  const last7Days = filterLastDays(normalized, 7);
  const last30Days = filterLastDays(normalized, 30);

  const insights = [];
  if (!last7Days.length && !last30Days.length) {
    return [
      {
        id: "no-data",
        title: "No insight yet",
        message: "Start logging symptoms daily to generate AI trend analysis.",
        severity: "info",
      },
    ];
  }

  const hotFlash7 = average(last7Days.map((log) => Number(log.hotFlashIntensity) || 0));
  const hotFlash30 = average(last30Days.map((log) => Number(log.hotFlashIntensity) || 0));
  if (hotFlash7 > 5) {
    insights.push({
      id: "hot-flash-increase",
      title: "Hot flash trend alert",
      message: "Hot flashes have increased over the past week.",
      severity: "high",
      prediction:
        hotFlash7 > hotFlash30
          ? "If this trend continues, vasomotor symptoms may intensify next week. Consider hydration and cooling routines."
          : undefined,
    });
  }

  const sleep7 = average(last7Days.map((log) => Number(log.sleepQuality) || 0));
  const sleep30 = average(last30Days.map((log) => Number(log.sleepQuality) || 0));
  if (sleep7 < 3) {
    insights.push({
      id: "sleep-low",
      title: "Sleep quality insight",
      message: "Sleep quality is below optimal levels in the last 7 days.",
      severity: "medium",
      prediction:
        sleep7 < sleep30
          ? "Persisting low sleep may worsen mood and fatigue. Prioritize sleep hygiene and stress control."
          : undefined,
    });
  }

  const moodSeries7 = last7Days.map((log) => moodScoreMap[String(log.mood || "").toLowerCase()] ?? 3);
  const moodVar7 = stdDev(moodSeries7);
  if (moodVar7 >= 0.9) {
    insights.push({
      id: "mood-instability",
      title: "Mood stability insight",
      message: "Mood fluctuations are significant during the past week.",
      severity: "medium",
      prediction: "Mood volatility may continue without recovery routines. Add short breathing breaks and activity scheduling.",
    });
  }

  const weight7 = last7Days.map((log) => Number(log.weight)).filter((value) => Number.isFinite(value));
  const weight30 = last30Days.map((log) => Number(log.weight)).filter((value) => Number.isFinite(value));
  if (weight7.length >= 3) {
    const weekRange = Math.max(...weight7) - Math.min(...weight7);
    const monthRange = weight30.length >= 3 ? Math.max(...weight30) - Math.min(...weight30) : weekRange;
    if (weekRange >= 1.5 || monthRange >= 3) {
      insights.push({
        id: "weight-fluctuation",
        title: "Weight fluctuation insight",
        message: "Weight is fluctuating noticeably in recent logs.",
        severity: "medium",
        prediction:
          weekRange >= 1.5 ? "If this fluctuation continues, energy and symptom stability may be affected." : undefined,
      });
    }
  }

  if (!insights.length) {
    insights.push({
      id: "stable",
      title: "Stable symptom pattern",
      message: "Recent symptom trends look stable. Continue your current wellness routine.",
      severity: "low",
    });
  }

  return insights;
}

export default detectPatterns;
