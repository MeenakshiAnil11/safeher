import { pregnancyKnowledge } from "../data/pregnancyKnowledge";
import { pregnancyWeeks } from "../data/pregnancyWeeks";

const includesAny = (text, words = []) => words.some((word) => text.includes(word));

export function getPregnancyAnswer(question = "", pregnancyWeek = 20, healthData = {}) {
  const normalizedQuestion = String(question).toLowerCase().trim();
  if (!normalizedQuestion) {
    return "Please type your question and I will try to help with pregnancy guidance.";
  }

  const knowledgeMatch = pregnancyKnowledge.find((entry) =>
    includesAny(normalizedQuestion, entry.keywords || [])
  );

  let response =
    knowledgeMatch?.answer ||
    "I'm not fully sure about that. Please consult your healthcare provider for medical advice.";

  const week = Math.min(40, Math.max(1, Number(pregnancyWeek) || 20));
  const weekData = pregnancyWeeks?.[week];

  if (includesAny(normalizedQuestion, ["baby size", "baby development", "growth", "baby week"])) {
    const developmentText = weekData?.development || "development changes every week.";
    response += ` In week ${week}, your baby's development includes: ${developmentText}`;
  }

  const systolic = Number(healthData?.systolic ?? healthData?.bloodPressure?.systolic) || 0;
  const diastolic = Number(healthData?.diastolic ?? healthData?.bloodPressure?.diastolic) || 0;
  const bloodSugar = Number(healthData?.bloodSugar) || 0;
  const sleepHours = Number(healthData?.sleepHours) || 0;
  const weightGain = Number(healthData?.weightGain) || 0;
  const symptoms = Array.isArray(healthData?.symptoms)
    ? healthData.symptoms.map((item) => String(item?.name || item).toLowerCase())
    : [];

  const personalizedNotes = [];
  if (systolic > 140 || diastolic > 90) {
    personalizedNotes.push(
      "Your recent blood pressure appears elevated. Please monitor regularly and consult your doctor if it remains high."
    );
  }
  if (bloodSugar > 120) {
    personalizedNotes.push(
      "Your recent blood sugar reading is above ideal range. Prefer balanced low-glycemic meals and discuss this with your provider."
    );
  }
  if (sleepHours > 0 && sleepHours < 6) {
    personalizedNotes.push(
      "Your sleep duration seems low. Aim for 7-9 hours and use a calming bedtime routine."
    );
  }
  if (weightGain > 0 && weightGain < 5 && week > 20) {
    personalizedNotes.push(
      "Your weight gain trend appears low for this stage. Review nutrition targets with your prenatal care team."
    );
  }
  if (symptoms.some((sym) => sym.includes("dizziness"))) {
    personalizedNotes.push(
      "Since you reported dizziness, hydrate well and avoid sudden posture changes."
    );
  }

  if (personalizedNotes.length) {
    response += ` ${personalizedNotes[0]}`;
  }

  return response;
}

export default getPregnancyAnswer;
