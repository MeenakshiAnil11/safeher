const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const levelFromScore = (score) => {
  if (score >= 70) return "High";
  if (score >= 35) return "Medium";
  return "Low";
};

const normalizeSymptoms = (symptoms = []) => {
  if (!Array.isArray(symptoms)) return [];
  return symptoms.map((symptom) => String(symptom?.name || symptom).toLowerCase());
};

export function calculatePregnancyRisks(input = {}) {
  const systolic = Number(input?.systolic) || 0;
  const diastolic = Number(input?.diastolic) || 0;
  const bloodSugar = Number(input?.bloodSugar) || 0;
  const hemoglobin = Number(input?.hemoglobin) || 0;
  const weightGain = Number(input?.weightGain) || 0;
  const sleepHours = Number(input?.sleepHours) || 0;
  const symptoms = normalizeSymptoms(input?.symptoms);

  const symptomHas = (key) => symptoms.some((symptom) => symptom.includes(key));

  let diabetesScore = 20;
  if (bloodSugar > 140) diabetesScore += 55;
  else if (bloodSugar > 120) diabetesScore += 35;
  else if (bloodSugar > 100) diabetesScore += 15;
  if (symptomHas("excessive thirst") || symptomHas("frequent urination")) diabetesScore += 10;

  let preeclampsiaScore = 20;
  if (systolic > 160 || diastolic > 110) preeclampsiaScore += 65;
  else if (systolic > 140 || diastolic > 90) preeclampsiaScore += 40;
  else if (systolic > 130 || diastolic > 85) preeclampsiaScore += 20;
  if (symptomHas("swelling") || symptomHas("headache") || symptomHas("vision")) preeclampsiaScore += 12;

  let anemiaScore = 15;
  if (hemoglobin > 0 && hemoglobin < 9) anemiaScore += 65;
  else if (hemoglobin > 0 && hemoglobin < 11) anemiaScore += 45;
  else if (hemoglobin > 0 && hemoglobin < 12) anemiaScore += 20;
  if (symptomHas("fatigue") || symptomHas("dizziness")) anemiaScore += 10;

  let pretermScore = 20;
  if (weightGain > 0 && weightGain < 5) pretermScore += 35;
  else if (weightGain > 20) pretermScore += 20;
  if (symptomHas("contraction") || symptomHas("pelvic pressure")) pretermScore += 18;
  if (systolic > 140 || diastolic > 90) pretermScore += 12;
  if (sleepHours > 0 && sleepHours < 6) pretermScore += 10;

  if (sleepHours > 0 && sleepHours < 6) {
    diabetesScore += 6;
    preeclampsiaScore += 6;
  }

  const risks = [
    {
      key: "gestationalDiabetes",
      label: "Gestational Diabetes",
      score: clamp(Math.round(diabetesScore), 0, 100),
    },
    {
      key: "preeclampsia",
      label: "Preeclampsia",
      score: clamp(Math.round(preeclampsiaScore), 0, 100),
    },
    {
      key: "anemia",
      label: "Anemia",
      score: clamp(Math.round(anemiaScore), 0, 100),
    },
    {
      key: "pretermBirth",
      label: "Preterm Birth",
      score: clamp(Math.round(pretermScore), 0, 100),
    },
  ].map((risk) => ({
    ...risk,
    percentage: risk.score,
    level: levelFromScore(risk.score),
  }));

  const highRisk = risks.some((risk) => risk.level === "High");
  const riskPercentages = risks.reduce((acc, risk) => {
    acc[risk.key] = risk.percentage;
    return acc;
  }, {});

  return {
    risks,
    riskPercentages,
    highRisk,
  };
}

export default calculatePregnancyRisks;
