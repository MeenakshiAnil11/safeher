// backend/controllers/wellnessController.js

// Get wellness data for a specific week
export const getWellnessData = async (req, res) => {
  try {
    const { week } = req.params;
    const weekNum = parseInt(week) || 16;

    // Generate wellness data based on week
    const wellnessData = generateWellnessData(weekNum);

    res.json({ success: true, wellness: wellnessData });
  } catch (error) {
    console.error("Get wellness data error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch wellness data" });
  }
};

// Helper function to generate wellness data for a specific week
function generateWellnessData(week) {
  // Determine trimester
  const trimester = week <= 12 ? 'first' : week <= 28 ? 'second' : 'third';

  const baseNutrition = {
    foodsToEat: [
      "🍎 Fruits and vegetables (at least 5 servings daily)",
      "🥛 Dairy products for calcium (yogurt, cheese, milk)",
      "🥩 Lean proteins (chicken, fish, beans, eggs)",
      "🌾 Whole grains (brown rice, whole wheat bread)",
      "🥜 Healthy fats (avocado, nuts, olive oil)",
      "💧 Plenty of water (8-10 glasses daily)"
    ],
    foodsToAvoid: [
      "🐟 High-mercury fish (shark, tilefish, king mackerel)",
      "🥚 Raw or undercooked eggs and meat",
      "🧀 Soft cheeses (feta, brie, blue cheese unless pasteurized)",
      "☕ Excess caffeine (limit to 200mg per day)",
      "🍷 Alcohol (completely avoid)",
      "🍣 Raw sushi and sashimi"
    ],
    tips: []
  };

  const baseExercises = {
    safeExercises: [
      {
        name: "Walking",
        description: "Low-impact cardio that's safe throughout pregnancy",
        duration: "20-30 minutes daily",
        benefits: "Improves cardiovascular health, maintains fitness"
      },
      {
        name: "Prenatal Yoga",
        description: "Gentle stretches and poses designed for pregnancy",
        duration: "30-45 minutes, 3-4 times per week",
        benefits: "Increases flexibility, reduces stress, prepares for labor"
      },
      {
        name: "Swimming",
        description: "Excellent full-body workout with minimal joint stress",
        duration: "20-30 minutes, 2-3 times per week",
        benefits: "Improves circulation, reduces swelling, maintains fitness"
      }
    ],
    exercisesToAvoid: [],
    tips: []
  };

  // Adjust content based on trimester
  if (trimester === 'first') {
    baseNutrition.tips = [
      "Eat small, frequent meals to manage morning sickness",
      "Focus on folate-rich foods like leafy greens for baby's neural development",
      "Stay hydrated throughout the day",
      "Include ginger tea or ginger ale to help with nausea",
      "Take prenatal vitamins daily"
    ];
    baseExercises.tips = [
      "Start with gentle activities if you're new to exercise",
      "Avoid overheating - your baby's temperature should stay regulated",
      "Stay hydrated before, during, and after exercise"
    ];
  } else if (trimester === 'second') {
    baseNutrition.tips = [
      "Increase calories by about 300-350 per day",
      "Focus on iron-rich foods to prevent anemia",
      "Include omega-3 fatty acids for baby's brain development",
      "Continue taking prenatal vitamins",
      "Eat fiber-rich foods to prevent constipation"
    ];
    baseExercises.tips = [
      "This is the perfect time for regular exercise",
      "Listen to your body and adjust intensity as needed",
      "Avoid exercises that require lying flat on your back",
      "Include strength training for maintaining muscle tone"
    ];
  } else {
    baseNutrition.tips = [
      "Focus on nutrient-dense foods for maximum benefit",
      "Continue staying hydrated to prevent dehydration and premature contractions",
      "Eat smaller, more frequent meals to avoid heartburn",
      "Include protein with every meal for baby's growth",
      "Get plenty of fiber to manage constipation"
    ];
    baseExercises.tips = [
      "Reduce intensity as you approach your due date",
      "Focus on gentle movements and stretching",
      "Practice pelvic floor exercises daily",
      "Avoid high-impact activities that could cause injury"
    ];
  }

  return {
    nutrition: baseNutrition,
    exercises: baseExercises,
    mentalHealth: {
      tips: [
        {
          title: "Practice Stress Management",
          description: "Try deep breathing exercises, progressive muscle relaxation, or guided meditation",
          emoji: "🧘"
        },
        {
          title: "Maintain Social Connections",
          description: "Stay in touch with friends and family for emotional support",
          emoji: "👥"
        },
        {
          title: "Express Your Feelings",
          description: "Talk openly about your emotions with your partner or a trusted friend",
          emoji: "💭"
        },
        {
          title: "Practice Self-Compassion",
          description: "Be kind to yourself - pregnancy brings many changes and that's okay",
          emoji: "❤️"
        }
      ],
      warningSigns: [
        "Persistent feelings of sadness or anxiety",
        "Difficulty sleeping or eating",
        "Loss of interest in activities you normally enjoy",
        "Excessive worry about the baby"
      ]
    },
    meditation: {
      guidedMeditations: [
        {
          title: "Morning Mindfulness",
          duration: "10 minutes",
          description: "Start your day with peaceful awareness",
          steps: [
            "Find a comfortable seated position",
            "Close your eyes and take three deep breaths",
            "Bring awareness to your breath",
            "Notice any thoughts without judgment",
            "Return to your breath whenever your mind wanders"
          ]
        },
        {
          title: "Pregnancy Body Scan",
          duration: "15 minutes",
          description: "Connect with your changing body",
          steps: [
            "Lie down comfortably with pillows for support",
            "Take deep, slow breaths",
            "Bring attention to your feet and work your way up",
            "Notice any sensations in each body part",
            "Acknowledge your growing baby with love"
          ]
        }
      ],
      breathingTechniques: [
        {
          name: "4-7-8 Breathing",
          description: "Calming technique for stress relief",
          steps: "Inhale for 4 counts, hold for 7 counts, exhale for 8 counts. Repeat 4 times."
        },
        {
          name: "Deep Belly Breathing",
          description: "Connect with your baby",
          steps: "Place hands on your belly, inhale deeply expanding your belly, exhale slowly. Repeat for 5 minutes."
        }
      ]
    },
    sleepHygiene: {
      tips: [
        {
          title: "Sleep on Your Left Side",
          description: "Improves circulation to your baby and prevents back pain",
          emoji: "💤"
        },
        {
          title: "Use Pregnancy Pillows",
          description: "Support your belly, back, and knees for maximum comfort",
          emoji: "🛏️"
        },
        {
          title: "Avoid Screens Before Bed",
          description: "No phones, tablets, or TV for at least 1 hour before sleep",
          emoji: "📱"
        }
      ],
      commonSleepIssues: [
        {
          issue: "Frequent Urination",
          solution: "Limit fluids 2 hours before bed, but stay hydrated during the day"
        },
        {
          issue: "Heartburn",
          solution: "Avoid spicy or acidic foods before bed, sleep with head elevated"
        }
      ]
    }
  };
}

// Get all wellness tips
export const getAllWellnessTips = async (req, res) => {
  try {
    const tips = [];
    for (let week = 1; week <= 40; week++) {
      tips.push({
        week,
        wellness: generateWellnessData(week)
      });
    }
    
    res.json({ success: true, tips });
  } catch (error) {
    console.error("Get all wellness tips error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch wellness tips" });
  }
};
