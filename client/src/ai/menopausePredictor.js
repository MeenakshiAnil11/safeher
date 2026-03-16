const moodRiskMap = {
  happy: 8,
  energetic: 12,
  calm: 18,
  neutral: 28,
  tired: 45,
  anxious: 60,
  irritable: 64,
  sad: 70,
};

const cycleRiskMap = {
  regular: 10,
  irregular: 55,
  missed: 75,
  heavy: 50,
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const safeNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

export function calculateMenopauseRisk(data = {}) {
  const age = safeNumber(data.age, 44);
  const mood = String(data.mood || "neutral").toLowerCase();
  const sleepQuality = clamp(safeNumber(data.sleepQuality, 3), 1, 5);
  const hotFlashIntensity = clamp(safeNumber(data.hotFlashIntensity, 0), 0, 10);
  const cycleStatus = String(data.cycleStatus || "regular").toLowerCase();
  const weight = safeNumber(data.weight, 64);

  const ageRisk = clamp((age - 35) * 2.4, 0, 35);
  const moodRisk = moodRiskMap[mood] ?? 30;
  const sleepRisk = clamp((5 - sleepQuality) * 12, 0, 48);
  const hotFlashRisk = hotFlashIntensity * 6;
  const cycleRisk = cycleRiskMap[cycleStatus] ?? 25;
  const weightRisk = weight > 85 ? 14 : weight < 48 ? 10 : 4;

  const weightedScore =
    ageRisk * 0.22 +
    moodRisk * 0.15 +
    sleepRisk * 0.16 +
    hotFlashRisk * 0.25 +
    cycleRisk * 0.17 +
    weightRisk * 0.05;

  const riskScore = clamp(Math.round(weightedScore), 0, 100);
  const riskLevel = riskScore >= 70 ? "High" : riskScore >= 40 ? "Medium" : "Low";

  return { riskScore, riskLevel };
}

export default calculateMenopauseRisk;
