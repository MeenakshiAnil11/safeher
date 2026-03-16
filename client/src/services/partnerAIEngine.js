import { partnerAIKnowledge } from "../data/partnerAIKnowledge";

const getTrimesterKey = (week = 20) => {
  const safeWeek = Number(week) || 20;
  if (safeWeek <= 12) return "trimester1";
  if (safeWeek <= 27) return "trimester2";
  return "trimester3";
};

const detectTopic = (text = "") => {
  const normalized = String(text).toLowerCase();
  if (/(back pain|backache|lower back|pain)/.test(normalized)) return "backPain";
  if (/(emotional|mood|stress|anxious|support emotionally|feelings)/.test(normalized)) {
    return "emotionalSupport";
  }
  if (/(labor|delivery|hospital bag|birth plan|prepare before delivery)/.test(normalized)) {
    return "laborPreparation";
  }
  if (/(exercise|walk|workout|fitness|stretch)/.test(normalized)) return "exercise";
  if (/(nutrition|diet|food|meal|vitamin|hydration|water)/.test(normalized)) return "nutrition";
  if (/(week|what should i do)/.test(normalized)) return "weekSpecific";
  return "emotionalSupport";
};

const normalizeSymptoms = (healthData = {}) =>
  Array.isArray(healthData?.symptoms)
    ? healthData.symptoms.map((item) => String(item?.name || item || "").toLowerCase()).filter(Boolean)
    : [];

export function getPartnerAIResponse(question = "", pregnancyWeek = 20, healthData = {}) {
  const topic = detectTopic(question);
  const trimesterKey = getTrimesterKey(pregnancyWeek);
  const knowledge = partnerAIKnowledge[topic] || partnerAIKnowledge.emotionalSupport;
  const tips = [
    ...(knowledge?.[trimesterKey] || []),
    ...(knowledge?.all || []),
  ];

  const systolic = Number(healthData?.systolic ?? healthData?.bloodPressure?.systolic) || 0;
  const diastolic = Number(healthData?.diastolic ?? healthData?.bloodPressure?.diastolic) || 0;
  const symptoms = normalizeSymptoms(healthData);
  const contextTips = [];

  if (systolic >= 140 || diastolic >= 90) {
    contextTips.push(
      "Recent blood pressure appears elevated, so support low-salt meals and regular BP tracking."
    );
  }

  if (symptoms.some((sym) => sym.includes("fatigue"))) {
    contextTips.push("Fatigue is present, so prioritize rest windows and reduce physical overload.");
  }

  if (symptoms.some((sym) => sym.includes("nausea"))) {
    contextTips.push("For nausea, support small frequent meals and hydration reminders.");
  }

  const title = `Week ${Number(pregnancyWeek) || 20} Advice`;
  const trimesterLabel =
    trimesterKey === "trimester1" ? "first" : trimesterKey === "trimester2" ? "second" : "third";
  const contextLine = `Your partner is currently in Week ${Number(pregnancyWeek) || 20}, which is the ${trimesterLabel} trimester.`;

  return {
    title,
    tips: [contextLine, ...tips, ...contextTips].filter(Boolean).slice(0, 7),
  };
}

export function getPartnerAIAdvice(week = 20, healthData = {}) {
  const safeWeek = Number(week) || 20;
  const advice = [];
  const systolic = Number(healthData?.systolic ?? healthData?.bloodPressure?.systolic) || 0;
  const diastolic = Number(healthData?.diastolic ?? healthData?.bloodPressure?.diastolic) || 0;
  const symptoms = Array.isArray(healthData?.symptoms)
    ? healthData.symptoms.map((item) => String(item?.name || item).toLowerCase())
    : [];

  if (safeWeek >= 20) {
    advice.push("Attend the upcoming anatomy scan together.");
    advice.push("Learn about baby movement patterns.");
  }

  if (safeWeek >= 28) {
    advice.push("Help prepare the hospital bag.");
    advice.push("Practice breathing techniques together.");
  }

  if (systolic >= 140 || diastolic >= 90) {
    advice.push("Support blood pressure tracking and reduce high-sodium meals.");
  }

  if (symptoms.some((sym) => sym.includes("back pain"))) {
    advice.push("Offer posture support and reduce physical strain at home.");
  }

  if (!advice.length) {
    advice.push("Join prenatal visits and ask your partner what support helps most this week.");
  }

  return [...new Set(advice)];
}

export default getPartnerAIAdvice;
