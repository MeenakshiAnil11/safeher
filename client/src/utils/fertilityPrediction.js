const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const calculateCycleDay = (lastPeriodStartDate, cycleLength = 28, todayInput = new Date()) => {
  const today = new Date(todayInput);
  const lastStart = new Date(lastPeriodStartDate);
  if (Number.isNaN(today.getTime()) || Number.isNaN(lastStart.getTime())) return 1;

  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfLast = new Date(lastStart.getFullYear(), lastStart.getMonth(), lastStart.getDate());
  const daysDiff = Math.floor((startOfToday - startOfLast) / MS_PER_DAY);

  const normalizedCycleLength = Math.max(21, Number(cycleLength) || 28);
  const moduloDay = ((daysDiff % normalizedCycleLength) + normalizedCycleLength) % normalizedCycleLength;
  return moduloDay + 1;
};

export const getCyclePhase = (cycleDay) => {
  const day = Number(cycleDay) || 1;
  if (day >= 1 && day <= 5) return "Menstrual";
  if (day >= 6 && day <= 13) return "Follicular";
  if (day === 14) return "Ovulation";
  return "Luteal";
};

export const calculateOvulationDay = (cycleLength = 28) => {
  const normalizedCycleLength = Math.max(21, Number(cycleLength) || 28);
  return Math.max(1, normalizedCycleLength - 14);
};

export const calculateFertileWindow = (ovulationDay, cycleLength = 28) => {
  const normalizedCycleLength = Math.max(21, Number(cycleLength) || 28);
  const fertileWindowStart = Math.max(1, ovulationDay - 2);
  const fertileWindowEnd = Math.min(normalizedCycleLength, ovulationDay + 2);
  return { fertileWindowStart, fertileWindowEnd };
};

export const getFertilityStatus = (cycleDay, fertileWindowStart, fertileWindowEnd) => {
  const day = Number(cycleDay) || 1;
  if (day >= fertileWindowStart && day <= fertileWindowEnd) return "High Fertility";
  if (day >= Math.max(1, fertileWindowStart - 3) && day < fertileWindowStart) return "Medium Fertility";
  return "Low Fertility";
};

export const getFertilityProbability = (cycleDay, fertileStart, fertileEnd) => {
  const day = Number(cycleDay) || 1;
  const start = Number(fertileStart) || 1;
  const end = Number(fertileEnd) || start;

  if (day >= start && day <= end) {
    return { level: "High", percentage: 90 };
  }

  if (day >= Math.max(1, start - 3) && day < start) {
    return { level: "Medium", percentage: 60 };
  }

  return { level: "Low", percentage: 20 };
};

export const getPhaseScore = (phase) => {
  const normalized = String(phase || "").toLowerCase();
  if (normalized === "ovulation") return 50;
  if (normalized === "fertile window") return 40;
  if (normalized === "follicular") return 25;
  if (normalized === "luteal") return 10;
  return 10;
};

export const getSymptomScore = (symptoms) => {
  if (!Array.isArray(symptoms)) return 0;

  let score = 0;
  const normalizedSymptoms = symptoms
    .map((item) => (typeof item === "string" ? item : item?.name))
    .filter(Boolean)
    .map((item) => String(item).trim().toLowerCase());

  if (normalizedSymptoms.includes("cervical mucus")) score += 15;
  if (normalizedSymptoms.includes("mild cramps")) score += 5;
  if (normalizedSymptoms.includes("increased energy")) score += 5;

  return score;
};

export const getTemperatureScore = (temp) => {
  const value = Number(temp);
  if (Number.isNaN(value)) return 10;
  return value >= 36.5 && value <= 37 ? 25 : 10;
};

export const calculateFertilityScore = (phase, symptoms, temp) => {
  const phaseScore = getPhaseScore(phase);
  const symptomScore = getSymptomScore(symptoms);
  const tempScore = getTemperatureScore(temp);
  const total = phaseScore + symptomScore + tempScore;
  return Math.max(0, Math.min(100, total));
};

export const getFertilityStatusFromScore = (score) => {
  const value = Number(score) || 0;
  if (value >= 70) return "High Fertility";
  if (value >= 40) return "Moderate Fertility";
  return "Low Fertility";
};

export const getRecommendation = (score) => {
  const status = getFertilityStatusFromScore(score);
  if (status === "High Fertility") {
    return "Best time to try for pregnancy. Maintain healthy nutrition and moderate activity.";
  }
  if (status === "Moderate Fertility") {
    return "Fertility is increasing. Maintain healthy lifestyle habits.";
  }
  return "Low fertility today. Focus on wellness and cycle tracking.";
};

export const getDailyFertilityScoreData = ({
  phase,
  symptoms,
  temp,
}) => {
  const fertilityScore = calculateFertilityScore(phase, symptoms, temp);
  const fertilityStatus = getFertilityStatusFromScore(fertilityScore);
  const recommendation = getRecommendation(fertilityScore);

  return {
    fertilityScore,
    fertilityStatus,
    recommendation,
  };
};

export const getExerciseRecommendations = (phase) => {
  const normalizedPhase = String(phase || "").toLowerCase();
  if (normalizedPhase === "menstrual") {
    return ["Light yoga", "Gentle stretching", "Walking"];
  }
  if (normalizedPhase === "follicular") {
    return ["Cardio workouts", "Jogging", "Strength training"];
  }
  if (normalizedPhase === "ovulation") {
    return ["HIIT workouts", "Cycling", "Running"];
  }
  return ["Pilates", "Yoga", "Light strength training"];
};

export const getHealthTip = (phase) => {
  const normalizedPhase = String(phase || "").toLowerCase();
  if (normalizedPhase === "menstrual") {
    return "Rest and light stretching can help reduce cramps.";
  }
  if (normalizedPhase === "follicular") {
    return "Your energy is rising. This is a good time for productive workouts.";
  }
  if (normalizedPhase === "ovulation") {
    return "You may experience peak energy. Maintain hydration and balanced nutrition.";
  }
  return "Gentle exercise and stress reduction may support hormonal balance.";
};

export const getHealthIntelligenceData = ({
  lastPeriodStartDate,
  cycleLength = 28,
  today = new Date(),
}) => {
  const base = getFertilityPrediction({ lastPeriodStartDate, cycleLength, today });
  return {
    cycleDay: base.cycleDay,
    phase: base.phase,
    fertilityStatus: base.fertilityStatus,
    ovulationDay: base.ovulationDay,
    fertileWindowStart: base.fertileWindowStart,
    fertileWindowEnd: base.fertileWindowEnd,
    exercises: getExerciseRecommendations(base.phase),
    healthTip: getHealthTip(base.phase),
  };
};

export const getFertilityPrediction = ({
  lastPeriodStartDate,
  cycleLength = 28,
  today = new Date(),
}) => {
  const cycleDay = calculateCycleDay(lastPeriodStartDate, cycleLength, today);
  const phase = getCyclePhase(cycleDay);
  const ovulationDay = calculateOvulationDay(cycleLength);
  const { fertileWindowStart, fertileWindowEnd } = calculateFertileWindow(ovulationDay, cycleLength);

  const rawDaysUntilOvulation = ovulationDay - cycleDay;
  const daysUntilOvulation =
    rawDaysUntilOvulation >= 0 ? rawDaysUntilOvulation : rawDaysUntilOvulation + Math.max(21, Number(cycleLength) || 28);

  const fertilityStatus = getFertilityStatus(cycleDay, fertileWindowStart, fertileWindowEnd);

  return {
    cycleDay,
    phase,
    ovulationDay,
    fertileWindowStart,
    fertileWindowEnd,
    daysUntilOvulation,
    fertilityStatus,
  };
};

export default getFertilityPrediction;
