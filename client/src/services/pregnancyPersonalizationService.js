const toTrimester = (week) => {
  const safeWeek = Number(week) || 1;
  if (safeWeek <= 13) return 1;
  if (safeWeek <= 27) return 2;
  return 3;
};

const normalizeSymptoms = (symptoms) => {
  if (!Array.isArray(symptoms)) return [];
  return symptoms
    .map((item) => String(item?.name || item || "").toLowerCase().trim())
    .filter(Boolean);
};

const hasSymptom = (symptoms, term) =>
  symptoms.some((item) => item.includes(String(term).toLowerCase()));

export function getNutritionRecommendations(week, symptoms = []) {
  const trimester = toTrimester(week);
  const normalizedSymptoms = normalizeSymptoms(symptoms);

  const recommendations = [];
  const avoid = [];

  if (trimester === 1) {
    recommendations.push(
      "Prioritize folate-rich foods like spinach, lentils, and citrus.",
      "Use small frequent meals to stabilize nausea and energy."
    );
  } else if (trimester === 2) {
    recommendations.push(
      "Increase iron and protein intake to support rapid fetal growth.",
      "Include calcium-rich foods such as yogurt, milk, and sesame."
    );
  } else {
    recommendations.push(
      "Focus on hydration, fiber, and magnesium to reduce swelling and constipation.",
      "Choose protein-rich snacks to support third-trimester energy needs."
    );
  }

  if (hasSymptom(normalizedSymptoms, "nausea")) {
    recommendations.push("For nausea: prefer dry snacks, ginger tea, and bland meals.");
    avoid.push("Greasy, spicy, and heavily fried foods.");
  }

  if (hasSymptom(normalizedSymptoms, "fatigue")) {
    recommendations.push("For fatigue: add iron + vitamin C pairings (spinach + lemon).");
  }

  if (hasSymptom(normalizedSymptoms, "constipation")) {
    recommendations.push("For constipation: increase whole grains, fruits, and water.");
  }

  if (hasSymptom(normalizedSymptoms, "heartburn")) {
    recommendations.push("For heartburn: avoid large late-night meals and lie-down right after eating.");
    avoid.push("Acidic and very spicy meals close to bedtime.");
  }

  return {
    trimester,
    recommendations: [...new Set(recommendations)].slice(0, 6),
    avoid: [...new Set(avoid)].slice(0, 4),
  };
}

export function getExerciseRecommendations(week, healthData = {}) {
  const trimester = toTrimester(week);
  const systolic = Number(healthData?.systolic ?? healthData?.bloodPressure?.systolic) || 0;
  const diastolic = Number(healthData?.diastolic ?? healthData?.bloodPressure?.diastolic) || 0;
  const sleepHours = Number(healthData?.sleepHours) || 0;
  const restingHeartRate = Number(healthData?.heartRate) || 0;
  const normalizedSymptoms = normalizeSymptoms(healthData?.symptoms);

  const plan = [];
  const cautions = [];

  if (trimester === 1) {
    plan.push("Walking 20-25 minutes", "Prenatal mobility + breathing 10-15 minutes");
  } else if (trimester === 2) {
    plan.push(
      "Walking 25-35 minutes",
      "Prenatal yoga 15-20 minutes",
      "Pelvic floor exercises 8-10 minutes"
    );
  } else {
    plan.push(
      "Gentle walking 15-25 minutes",
      "Light stretching + breathing 10-15 minutes",
      "Pelvic floor and posture work 8-10 minutes"
    );
  }

  if (systolic > 140 || diastolic > 90) {
    cautions.push("Blood pressure appears elevated. Avoid high-intensity workouts today.");
    plan.push("Focus on guided breathing and short low-intensity walks.");
  }

  if (sleepHours > 0 && sleepHours < 6) {
    cautions.push("Low sleep detected. Keep activity gentle and prioritize recovery.");
  }

  if (restingHeartRate > 110) {
    cautions.push("Heart rate trend is high. Avoid overexertion and hydrate well.");
  }

  if (hasSymptom(normalizedSymptoms, "dizziness")) {
    cautions.push("Dizziness reported. Exercise seated or supported, and stop if symptoms return.");
  }

  if (hasSymptom(normalizedSymptoms, "pelvic pain") || hasSymptom(normalizedSymptoms, "cramp")) {
    cautions.push("Pelvic discomfort reported. Reduce impact activities and consult your provider.");
  }

  return {
    trimester,
    plan: [...new Set(plan)].slice(0, 5),
    cautions: [...new Set(cautions)].slice(0, 5),
  };
}

export function getMentalHealthAdvice(mood) {
  const normalizedMood = String(mood || "").toLowerCase();

  if (normalizedMood.includes("great") || normalizedMood.includes("happy")) {
    return {
      tone: "positive",
      advice: [
        "Keep your momentum with a short gratitude journal today.",
        "Add one calming routine tonight to protect sleep quality.",
      ],
    };
  }

  if (normalizedMood.includes("good") || normalizedMood.includes("neutral") || normalizedMood.includes("okay")) {
    return {
      tone: "steady",
      advice: [
        "Take one mindful pause (5-10 minutes) in the afternoon.",
        "Stay connected with a trusted person and share how you feel.",
      ],
    };
  }

  if (normalizedMood.includes("low") || normalizedMood.includes("stressed") || normalizedMood.includes("struggling") || normalizedMood.includes("tired")) {
    return {
      tone: "support-needed",
      advice: [
        "Try paced breathing: inhale 4s, hold 2s, exhale 6s for 5 rounds.",
        "Reduce overload: complete only top-priority tasks today.",
        "If this mood persists for several days, contact your healthcare provider.",
      ],
    };
  }

  return {
    tone: "general",
    advice: [
      "Check in with your emotions once today and log your mood.",
      "Use gentle movement, hydration, and early bedtime for emotional balance.",
    ],
  };
}

export default {
  getNutritionRecommendations,
  getExerciseRecommendations,
  getMentalHealthAdvice,
};
