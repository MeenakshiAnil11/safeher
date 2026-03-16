export const getCyclePhase = (cycleDay) => {
  const day = Number(cycleDay);

  if (day >= 1 && day <= 5) return "Menstrual";
  if (day >= 6 && day <= 13) return "Follicular";
  if (day === 14) return "Ovulation";
  return "Luteal";
};

export const getExerciseRecommendations = (phase) => {
  const recommendationsByPhase = {
    Menstrual: [
      "Light yoga",
      "Gentle stretching",
      "Walking",
      "Breathing exercises",
    ],
    Follicular: [
      "Cardio workouts",
      "Jogging",
      "Strength training",
      "Dance workouts",
    ],
    Ovulation: [
      "HIIT workouts",
      "Running",
      "Cycling",
      "Strength training",
    ],
    Luteal: [
      "Pilates",
      "Yoga",
      "Swimming",
      "Light strength training",
    ],
  };

  return recommendationsByPhase[phase] || recommendationsByPhase.Follicular;
};
