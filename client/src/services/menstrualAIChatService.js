import { menstrualAIKnowledge } from "../data/menstrualAIKnowledge";

const phaseContextAdvice = {
  menstrual:
    "You are currently in the menstrual phase, so lower energy and cramping can be more common. Gentle movement, hydration, and heat therapy may help.",
  follicular:
    "You are in the follicular phase, where energy often starts increasing. This can be a good time for progressive training and consistent routines.",
  ovulation:
    "You are near or in ovulation phase, when many people feel stronger and more energetic. Maintain hydration and avoid overtraining.",
  luteal:
    "You are in the luteal phase, where PMS symptoms like fatigue, mood shifts, and bloating are more likely. Recovery-focused habits can be helpful.",
};

function getBestKnowledgeMatch(question) {
  const text = String(question || "").toLowerCase().trim();
  if (!text) return null;

  let bestEntry = null;
  let bestScore = 0;

  menstrualAIKnowledge.forEach((entry) => {
    let score = 0;
    entry.keywords.forEach((keyword) => {
      const key = keyword.toLowerCase();
      if (text.includes(key)) {
        score += key.length > 8 ? 2 : 1;
      }
    });
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  });

  return bestScore > 0 ? bestEntry : null;
}

export function getMenstrualAIResponse(question, cycleContext = {}) {
  const normalizedQuestion = String(question || "").trim();
  if (!normalizedQuestion) {
    return "Please share your question so I can help with cycle and menstrual health information.";
  }

  const match = getBestKnowledgeMatch(normalizedQuestion);
  const baseAnswer =
    match?.medicalExplanation ||
    "I can help with menstrual health topics such as periods, ovulation, PMS, cramps, and cycle irregularity. Please share more details so I can give a clearer educational answer.";

  const phase = String(cycleContext.phase || "").toLowerCase();
  const phaseAdvice = phaseContextAdvice[phase] || "";

  const dayInfo =
    Number(cycleContext.cycleDay) > 0
      ? ` Based on your current cycle day (${cycleContext.cycleDay}), symptom tracking can improve personalized care discussions with your doctor.`
      : "";

  return `${baseAnswer}${phaseAdvice ? ` ${phaseAdvice}` : ""}${dayInfo}`.trim();
}

export default getMenstrualAIResponse;
