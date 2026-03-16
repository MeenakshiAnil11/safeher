const TRIMESTER_CONFIG = {
  first: {
    weekRange: "Weeks 1-12",
    nutritionFocus: "Folate, hydration, and nausea-friendly meals",
    foods: [
      { icon: "🥬", title: "Leafy Greens", subtitle: "Folate support for neural development" },
      { icon: "🍊", title: "Citrus Fruits", subtitle: "Vitamin C and hydration" },
      { icon: "🥣", title: "Whole Grains", subtitle: "Steady energy through the day" },
      { icon: "🥚", title: "Eggs", subtitle: "Protein and choline support" },
      { icon: "🫘", title: "Lentils", subtitle: "Iron and plant-based protein" },
      { icon: "🥛", title: "Yogurt", subtitle: "Calcium and gut support" },
    ],
    avoidFoods: [
      "Raw or undercooked meat",
      "Unpasteurized dairy",
      "High-mercury fish",
      "Alcohol",
      "Raw sprouts",
      "Excess caffeine (>200mg/day)",
    ],
    exercises: [
      { emoji: "🚶", name: "Brisk Walking", duration: "20-25 minutes", desc: "Gentle cardio and circulation support" },
      { emoji: "🧘", name: "Prenatal Stretching", duration: "10-15 minutes", desc: "Relieves stiffness and supports posture" },
      { emoji: "💪", name: "Pelvic Floor Practice", duration: "5-10 minutes", desc: "Builds core and pelvic support" },
    ],
    exerciseTips: [
      "Start slow and build consistency",
      "Stop if you feel dizzy or unwell",
      "Hydrate before and after workouts",
    ],
    supportCards: [
      {
        icon: "💗",
        title: "Early-Stage Reassurance",
        points: ["Mood swings are common in early pregnancy", "Focus on rest and hydration", "Track small daily wins"],
      },
      {
        icon: "🌤️",
        title: "Stress Regulation",
        points: ["Practice 4-7-8 breathing twice daily", "Limit doom-scrolling", "Take short mindful breaks"],
      },
    ],
  },
  second: {
    weekRange: "Weeks 13-26",
    nutritionFocus: "Iron, protein, omega-3, and balanced energy",
    foods: [
      { icon: "🐟", title: "Low-Mercury Fish", subtitle: "Omega-3 for brain development" },
      { icon: "🥬", title: "Spinach", subtitle: "Iron and folate support" },
      { icon: "🍠", title: "Sweet Potatoes", subtitle: "Vitamin A and fiber" },
      { icon: "🥜", title: "Nuts & Seeds", subtitle: "Healthy fats and minerals" },
      { icon: "🍗", title: "Lean Protein", subtitle: "Supports rapid growth" },
      { icon: "🫐", title: "Berries", subtitle: "Antioxidants and fiber" },
    ],
    avoidFoods: [
      "Deli meats unless heated",
      "Raw eggs",
      "High-mercury fish",
      "Alcohol",
      "Unwashed produce",
      "Excessive caffeine",
    ],
    exercises: [
      { emoji: "🚶", name: "Walking", duration: "25-35 minutes", desc: "Maintains stamina and circulation" },
      { emoji: "🏊", name: "Swimming", duration: "20-30 minutes", desc: "Low-impact full body movement" },
      { emoji: "🧘", name: "Prenatal Yoga", duration: "20 minutes", desc: "Mobility, breathing, and stress relief" },
    ],
    exerciseTips: [
      "Avoid lying flat on your back for long periods",
      "Use supportive shoes and clothing",
      "Prioritize controlled breathing during activity",
    ],
    supportCards: [
      {
        icon: "😊",
        title: "Confidence Building",
        points: ["Celebrate physical and emotional progress", "Maintain healthy routines", "Share concerns with your support system"],
      },
      {
        icon: "🧘",
        title: "Mental Calm",
        points: ["Practice daily grounding exercises", "Create a simple sleep ritual", "Use journaling to track patterns"],
      },
    ],
  },
  third: {
    weekRange: "Weeks 27-40",
    nutritionFocus: "Protein, hydration, and digestion-friendly meals",
    foods: [
      { icon: "🍗", title: "Lean Protein", subtitle: "Supports late-stage fetal growth" },
      { icon: "🥛", title: "Dairy", subtitle: "Calcium and bone support" },
      { icon: "🥑", title: "Avocado", subtitle: "Healthy fats and potassium" },
      { icon: "🍌", title: "Banana", subtitle: "Energy and cramp support" },
      { icon: "🥣", title: "Fiber-Rich Grains", subtitle: "Digestive support" },
      { icon: "🥕", title: "Colorful Vegetables", subtitle: "Micronutrient density" },
    ],
    avoidFoods: [
      "Very spicy late-night meals if causing heartburn",
      "High-mercury fish",
      "Alcohol",
      "Raw seafood",
      "Unpasteurized products",
      "Too much caffeine",
    ],
    exercises: [
      { emoji: "🚶", name: "Gentle Walking", duration: "15-25 minutes", desc: "Keeps body active without overexertion" },
      { emoji: "🧘", name: "Breath-Focused Yoga", duration: "15-20 minutes", desc: "Supports labor readiness and calmness" },
      { emoji: "💪", name: "Pelvic Floor Exercises", duration: "8-12 minutes", desc: "Supports delivery and recovery" },
    ],
    exerciseTips: [
      "Choose low-impact movement and frequent breaks",
      "Focus on breathing and mobility over intensity",
      "Consult your provider before trying new workouts",
    ],
    supportCards: [
      {
        icon: "💞",
        title: "Preparation Mindset",
        points: ["Practice calming breathwork", "Review your birth plan", "Ask for practical help when needed"],
      },
      {
        icon: "🌙",
        title: "Sleep & Comfort",
        points: ["Use pregnancy pillows for side sleeping", "Limit late heavy meals", "Keep evening routines simple"],
      },
    ],
  },
};

const trimesterForWeek = (week) => {
  if (week <= 12) return "first";
  if (week <= 26) return "second";
  return "third";
};

const clampWeek = (week) => {
  const parsed = Number(week);
  if (!Number.isFinite(parsed)) return 20;
  return Math.min(40, Math.max(1, Math.round(parsed)));
};

const buildMealSuggestions = (week, trimesterLabel) => [
  {
    day: "Monday",
    breakfast: `${trimesterLabel} protein bowl (Week ${week})`,
    lunch: "Mixed grain salad with seasonal vegetables",
    dinner: "Lean protein + veggies + whole grain",
    snack: "Fruit + nuts",
  },
  {
    day: "Tuesday",
    breakfast: "Whole grain toast with egg and fruit",
    lunch: "Lentil soup with side salad",
    dinner: "Baked fish/tofu with roasted vegetables",
    snack: "Yogurt with seeds",
  },
  {
    day: "Wednesday",
    breakfast: "Oats with berries and chia",
    lunch: "Quinoa bowl with greens and beans",
    dinner: "Chicken/chickpea stir fry with brown rice",
    snack: "Banana with peanut butter",
  },
];

export const getPregnancyWeekContent = (weekInput) => {
  const week = clampWeek(weekInput);
  const trimester = trimesterForWeek(week);
  const cfg = TRIMESTER_CONFIG[trimester];

  return {
    week,
    trimester,
    babyGrowth: {
      bodyChanges: [
        {
          title: "Energy & Recovery",
          text: `During week ${week}, focus on paced activity and restorative breaks.`,
          tone: "pink",
        },
        {
          title: "Posture & Back Support",
          text: "Use supportive seating and gentle stretching to reduce discomfort.",
          tone: "rose",
        },
        {
          title: "Hydration Needs",
          text: "Fluid requirements increase as pregnancy progresses.",
          tone: "cyan",
        },
        {
          title: "Sleep Quality",
          text: "Consistent bedtime routines improve sleep depth and recovery.",
          tone: "blue",
        },
      ],
      expectations: [
        `Week ${week} often brings noticeable day-to-day body changes.`,
        "Gentle movement and hydration help manage discomfort.",
        "Symptom intensity can vary; track patterns and discuss concerns.",
        "Prioritize regular prenatal follow-ups.",
      ],
      healthTips: [
        { icon: "💧", title: "Hydration", text: "Aim for frequent water intake throughout the day." },
        { icon: "🥗", title: "Balanced Plate", text: cfg.nutritionFocus },
        { icon: "🧘", title: "Mindful Breathing", text: "Use short breathing sessions for stress regulation." },
      ],
    },
    nutrition: {
      aiRecommendation: `Week ${week}: focus on ${cfg.nutritionFocus.toLowerCase()} and consistent meal timing.`,
      recommendedFoods: cfg.foods,
      avoidFoods: cfg.avoidFoods,
      mealSuggestions: buildMealSuggestions(week, cfg.weekRange),
    },
    exercise: {
      exercises: cfg.exercises,
      breathing: [
        {
          title: "Deep Belly Breathing",
          steps: [
            "Sit comfortably with shoulders relaxed",
            "Inhale through nose for 4 counts",
            "Exhale slowly for 6 counts",
            "Repeat 8-10 cycles",
          ],
        },
        {
          title: "Rhythmic Labor Prep Breathing",
          steps: [
            "Inhale gently through nose",
            "Exhale with long, steady release",
            "Keep jaw and shoulders relaxed",
            "Repeat for 5 minutes",
          ],
        },
      ],
      tips: cfg.exerciseTips,
    },
    emotional: {
      supportCards: cfg.supportCards,
      moodOptions: ["😊 Great", "🙂 Good", "😐 Okay", "😔 Low", "😟 Struggling"],
      warningSigns: [
        "Persistent anxiety",
        "Low mood for multiple days",
        "Sleep disruption affecting daily life",
        "Loss of interest in usual activities",
      ],
    },
  };
};

export default getPregnancyWeekContent;
