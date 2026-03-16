export function generateCarePlan(userData = {}, weekData = {}) {
  const symptoms = Array.isArray(userData.symptoms)
    ? userData.symptoms.map((symptom) => String(symptom).toLowerCase())
    : [];

  const hasSymptom = (term) => symptoms.some((symptom) => symptom.includes(term));
  const bpHigh = Number(userData.bpSystolic) > 135 || Number(userData.bpDiastolic) > 85;
  const glucoseHigh = Number(userData.bloodSugar) > 120;
  const lowHemoglobin = Number(userData.hemoglobin) > 0 && Number(userData.hemoglobin) < 11;
  const lowWeightGain = Number(userData.weightGain) >= 0 && Number(userData.weightGain) < 5;
  const fatigue = hasSymptom("fatigue");
  const riskResults = Array.isArray(userData?.riskResult?.risks) ? userData.riskResult.risks : [];

  const plan = {
    healthGoals: [],
    nutrition: [],
    exercise: [],
    doctorAdvice: [],
    checklist: [],
    smartRecommendations: [],
    riskAlerts: [],
  };

  if (bpHigh) {
    plan.healthGoals.push("Monitor blood pressure daily and log readings.");
    plan.riskAlerts.push("Risk Alert: Blood pressure is elevated. Reduce salt and consult your doctor.");
  }

  if (fatigue) {
    plan.healthGoals.push("Ensure adequate rest and improve sleep quality.");
    plan.smartRecommendations.push("Fatigue detected: Increase iron-rich foods and maintain 7-9 hours sleep.");
  }

  if (glucoseHigh) {
    plan.healthGoals.push("Stabilize blood sugar with low glycemic meals.");
    plan.riskAlerts.push("Risk Alert: Blood sugar is above normal range. Discuss gestational diabetes screening.");
  }

  if (lowHemoglobin) {
    plan.healthGoals.push("Improve hemoglobin with iron and folate support.");
    plan.smartRecommendations.push("Anemia tendency: Pair iron foods with vitamin C for better absorption.");
  }

  if (lowWeightGain) {
    plan.healthGoals.push("Track healthy weekly weight gain with provider guidance.");
    plan.smartRecommendations.push("Low weight gain trend: Add calorie-dense healthy snacks and protein.");
  }

  riskResults.forEach((risk) => {
    if (risk.level === "High") {
      plan.riskAlerts.push(`Risk Alert: ${risk.label} risk is high. Contact your obstetrician.`);
    } else if (risk.level === "Medium") {
      plan.smartRecommendations.push(`Monitor ${risk.label} indicators closely this week.`);
    }
  });

  plan.nutrition = [
    "Iron rich foods such as spinach and lentils",
    "High protein foods such as eggs and yogurt",
    "Drink at least 2 liters of water daily",
    ...(Array.isArray(weekData?.tips) ? weekData.tips.slice(0, 2) : []),
  ];

  plan.exercise = [
    "Prenatal yoga (15-20 minutes)",
    "Light walking for 20 minutes",
    "Pelvic floor breathing exercises",
  ];

  plan.doctorAdvice = [
    "Attend regular prenatal checkups",
    "Monitor baby movements daily",
    "Review warning signs for urgent care",
  ];

  plan.checklist = [
    "Take prenatal vitamins",
    "Drink 2 liters of water",
    "20 minutes of walking",
    "Schedule/confirm doctor appointment",
  ];

  if (!plan.healthGoals.length) {
    plan.healthGoals.push("Maintain balanced nutrition, hydration, and stress control.");
  }

  if (!plan.smartRecommendations.length) {
    plan.smartRecommendations.push("No major symptom flags detected. Continue your current healthy routine.");
  }

  return plan;
}

export default generateCarePlan;
