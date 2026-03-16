export const generateAIInsights = (data = {}) => {
  const insights = [];

  const cycleDay = Number(data.cycleDay) || 1;
  const cyclePhase = String(data.cyclePhase || "").toLowerCase();
  const ovulationDay = Number(data.ovulationDay) || 14;
  const fertileWindowStart = Number(data.fertileWindowStart) || 12;
  const fertileWindowEnd = Number(data.fertileWindowEnd) || 16;
  const daysUntilOvulation = Number(data.daysUntilOvulation);
  const fertilityScore = Number(data.fertilityScore) || 0;
  const temperature = Number(data.temperature);

  const symptoms = Array.isArray(data.symptoms)
    ? data.symptoms
        .map((item) => (typeof item === "string" ? item : item?.name))
        .filter(Boolean)
        .map((item) => String(item).trim().toLowerCase())
    : [];

  if (!Number.isNaN(daysUntilOvulation) && daysUntilOvulation <= 3) {
    insights.push("Your fertile window begins soon. This may be a favorable time to plan for conception.");
  }

  if (cycleDay === ovulationDay) {
    insights.push("Today may be your ovulation day, when the chances of conception are highest.");
  }

  if (symptoms.includes("cervical mucus")) {
    insights.push("Cervical mucus detected. This is a common indicator of approaching ovulation.");
  }

  if (fertilityScore >= 70) {
    insights.push("Your fertility score is currently high, suggesting favorable conditions for conception.");
  }

  if (!Number.isNaN(temperature) && temperature >= 36.5) {
    insights.push("Basal body temperature indicates possible ovulation phase.");
  }

  if (cyclePhase === "follicular") {
    insights.push("Energy levels may be increasing. Moderate exercise and balanced nutrition may support fertility.");
  } else if (cyclePhase === "ovulation") {
    insights.push("This phase often has peak fertility. Maintain hydration and healthy sleep.");
  } else if (cyclePhase === "luteal") {
    insights.push("Focus on stress reduction and light exercise to support hormonal balance.");
  }

  if (!insights.length) {
    insights.push("Continue logging your cycle and daily wellness data to unlock deeper personalized fertility insights.");
  }

  return insights.slice(0, 5);
};

export const generateAIInsightCards = (data = {}) => {
  const cycleDay = Number(data.cycleDay) || 1;
  const cyclePhase = String(data.cyclePhase || "follicular");
  const ovulationDay = Number(data.ovulationDay) || 14;
  const fertileWindowStart = Number(data.fertileWindowStart) || 12;
  const fertileWindowEnd = Number(data.fertileWindowEnd) || 16;
  const daysUntilOvulation = Number(data.daysUntilOvulation);
  const fertilityScore = Number(data.fertilityScore) || 0;
  const temperature = Number(data.temperature);
  const ovulationDate = data.ovulationDate ? new Date(data.ovulationDate) : null;
  const fertileStartDateObj = data.fertileStartDate ? new Date(data.fertileStartDate) : null;
  const fertileEndDateObj = data.fertileEndDate ? new Date(data.fertileEndDate) : null;
  const ovulationDateLabel =
    ovulationDate && !Number.isNaN(ovulationDate.getTime())
      ? ovulationDate.toLocaleDateString(undefined, { month: "long", day: "numeric" })
      : `Cycle Day ${ovulationDay}`;
  const fertileWindowLabel =
    fertileStartDateObj &&
    fertileEndDateObj &&
    !Number.isNaN(fertileStartDateObj.getTime()) &&
    !Number.isNaN(fertileEndDateObj.getTime())
      ? `${fertileStartDateObj.toLocaleDateString()} - ${fertileEndDateObj.toLocaleDateString()}`
      : `Day ${fertileWindowStart} - Day ${fertileWindowEnd}`;
  const logsCount = Number(data.logsCount) || 0;
  const logsThisWeek = Number(data.logsThisWeek) || 0;

  const normalizedSymptoms = Array.isArray(data.symptoms)
    ? data.symptoms
        .map((item) => (typeof item === "string" ? item : item?.name))
        .filter(Boolean)
        .map((item) => String(item).trim().toLowerCase())
    : [];

  const daysToFertileStart = Math.max(0, fertileWindowStart - cycleDay);
  const fertilityInsightExplanation =
    daysToFertileStart > 0
      ? `Your fertile window begins in ${daysToFertileStart} day${daysToFertileStart === 1 ? "" : "s"}. Ovulation is expected on ${ovulationDateLabel}. This phase typically has the highest chance of conception.`
      : `You are in your fertile window now. Ovulation is expected on ${ovulationDateLabel}. This phase typically has the highest chance of conception.`;

  const symptomTitle = normalizedSymptoms.length
    ? "Body Signals Recorded"
    : "Body Signals Pending";
  const defaultInterpretation = normalizedSymptoms.includes("mild cramps")
    ? "This symptom can sometimes occur before ovulation due to hormonal fluctuations."
    : normalizedSymptoms.includes("fatigue")
      ? "Fatigue can occur during hormonal transitions across the cycle."
      : normalizedSymptoms.includes("mood changes")
        ? "Mood changes may reflect expected hormonal variation through your cycle."
        : "No strong pre-ovulation body signals were detected today.";
  const symptomExplanation = normalizedSymptoms.includes("cervical mucus")
    ? "Cervical mucus has been recorded in today's log. This symptom often appears before ovulation and may indicate increasing fertility."
    : normalizedSymptoms.length
      ? `Recent symptoms logged: ${normalizedSymptoms.join(", ")}. Continue consistent tracking to improve cycle predictions.`
      : "No body-signal symptoms were logged today. Add symptoms in Daily Log for more personalized fertility insights.";

  const scoreLevel =
    fertilityScore >= 70 ? "high probability" : fertilityScore >= 40 ? "moderate probability" : "lower probability";
  const scoreExplanation = `Your Daily Fertility Score is ${fertilityScore} / 100. This indicates a ${scoreLevel} of conception today.`;

  const tempExplanation =
    !Number.isNaN(temperature)
      ? `Today's basal body temperature is ${temperature}°C. Temperature changes may indicate hormonal activity during ovulation.`
      : "No basal body temperature was logged today. Add temperature in Daily Log to strengthen ovulation insights.";
  const tempDetail =
    !Number.isNaN(temperature)
      ? "Basal temperature usually rises slightly after ovulation due to progesterone levels."
      : "Log morning temperature daily to detect subtle post-ovulation shifts.";

  const normalizedPhase = cyclePhase.toLowerCase();
  let lifestyleExplanation = "Focus on hydration, regular sleep, and gentle activity to support reproductive wellness.";
  let recommendedActivities = ["Walking", "Stretching", "Breathing exercises"];
  if (normalizedPhase === "follicular") {
    lifestyleExplanation = "Energy levels may be increasing. Moderate cardio exercise and balanced nutrition may support fertility.";
    recommendedActivities = ["Light cardio", "Yoga", "Walking"];
  } else if (normalizedPhase === "ovulation") {
    lifestyleExplanation = "This phase is associated with peak fertility. Maintain hydration and healthy sleep.";
    recommendedActivities = ["Hydration walks", "Mobility work", "Light strength"];
  } else if (normalizedPhase === "luteal") {
    lifestyleExplanation = "Focus on stress reduction and light exercise such as yoga.";
    recommendedActivities = ["Yoga", "Light stretching", "Short walks"];
  }

  let conceptionReadinessMessage = "Based on your current metrics, fertility conditions are building gradually.";
  if (fertilityScore >= 70) {
    conceptionReadinessMessage = "Based on your fertility score and cycle phase, today's probability of conception is high. This is a favorable time for conception planning.";
  } else if (fertilityScore >= 40) {
    conceptionReadinessMessage = `Based on your fertility score and cycle phase, today's probability of conception is moderate. Your most fertile window is expected in about ${Math.max(0, daysUntilOvulation)} day(s).`;
  } else {
    conceptionReadinessMessage = `Based on your fertility score and cycle phase, today's probability of conception is low. Your most fertile days are expected in about ${Math.max(0, daysUntilOvulation)} day(s).`;
  }

  let confidenceLevel = "Low";
  if (logsCount >= 14) confidenceLevel = "High";
  else if (logsCount >= 7) confidenceLevel = "Medium";

  const confidenceMessage =
    confidenceLevel === "High"
      ? "Excellent consistency. Your cycle predictions are becoming more reliable."
      : confidenceLevel === "Medium"
        ? "More daily logs will improve cycle prediction accuracy."
        : "Start logging every day to improve confidence in fertility predictions.";

  return {
    todayOverview: {
      cycleDay,
      currentPhase: cyclePhase,
      daysUntilOvulation: Math.max(0, daysUntilOvulation),
      fertileWindowRange: fertileWindowLabel,
      helper: "Tracking symptoms during this phase helps improve ovulation predictions.",
    },
    fertility: {
      title: "Fertility Timing Insight",
      explanation: fertilityInsightExplanation,
      meta: `Cycle Day ${cycleDay} • Window Day ${fertileWindowStart}-${fertileWindowEnd}`,
    },
    symptom: {
      title: symptomTitle,
      explanation: symptomExplanation,
      recentSymptoms: normalizedSymptoms,
      interpretation: defaultInterpretation,
    },
    score: {
      title: "Daily Fertility Score Insight",
      explanation: scoreExplanation,
      score: fertilityScore,
    },
    temperature: {
      title: "Temperature Pattern Insight",
      explanation: tempExplanation,
      detail: tempDetail,
      value: Number.isNaN(temperature) ? null : temperature,
    },
    lifestyle: {
      title: "Lifestyle Recommendation",
      explanation: lifestyleExplanation,
      activities: recommendedActivities,
    },
    conceptionReadiness: {
      title: "Conception Readiness",
      message: conceptionReadinessMessage,
    },
    predictionConfidence: {
      title: "Prediction Confidence",
      level: confidenceLevel,
      message: confidenceMessage,
    },
    upcomingEvent: {
      title: "Upcoming Fertility Event",
      fertileWindow: fertileWindowLabel,
      ovulationDay: ovulationDateLabel,
    },
    nutrition: {
      title: "Nutrition Insight",
      explanation: "Iron and folate support reproductive health.",
      foods: ["Spinach", "Lentils", "Avocado", "Whole grains"],
    },
    trackingConsistency: {
      title: "Tracking Consistency",
      message: `You have logged fertility data ${logsThisWeek} day${logsThisWeek === 1 ? "" : "s"} this week. Regular tracking improves prediction accuracy.`,
    },
    didYouKnow: {
      title: "Did You Know?",
      message: "Ovulation typically occurs about 14 days before the next menstrual cycle.",
    },
    fertilityLevel: fertilityScore >= 70 ? "High Fertility" : fertilityScore >= 40 ? "Medium Fertility" : "Low Fertility",
    quickInsights: generateAIInsights(data),
    daysUntilOvulation,
  };
};

export default generateAIInsights;
