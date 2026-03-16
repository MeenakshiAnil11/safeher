export const phaseExercises = {
  menstrual: {
    energy: "Low",
    intensity: "Very Light",
    recommended: ["Stretching", "Gentle Yoga", "Walking", "Breathing Exercises"],
    avoid: ["High intensity workouts", "Heavy lifting"],
    videos: [
      {
        title: "Gentle Yoga for Menstrual Phase",
        duration: "15 min",
        url: "https://www.youtube.com/embed/hJbRpHZr_d0?rel=0",
      },
      {
        title: "Calming Stretch and Recovery",
        duration: "12 min",
        url: "https://www.youtube.com/embed/SEfs5TJZ6Nk?rel=0",
      },
    ],
    audios: [
      {
        title: "Guided Breathing Exercise",
        description: "A short breathing flow to ease cramps and improve calm.",
        file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      },
    ],
    exerciseCards: [
      {
        title: "Gentle Yoga Flow",
        difficulty: "Easy",
        duration: "20 min",
        calories: "70 kcal",
        steps: [
          "Start with 2 minutes of deep breathing.",
          "Move through seated cat-cow and child's pose.",
          "Hold each stretch for 30-40 seconds.",
          "Finish with a 3 minute relaxation.",
        ],
      },
      {
        title: "Comfort Walk",
        difficulty: "Easy",
        duration: "20 min",
        calories: "90 kcal",
        steps: [
          "Begin with a slow 3 minute warmup.",
          "Walk at comfortable pace for 15 minutes.",
          "Keep shoulders relaxed and posture upright.",
          "End with gentle calf and hamstring stretches.",
        ],
      },
    ],
  },
  follicular: {
    energy: "Medium to High",
    intensity: "Moderate",
    recommended: ["Strength Training", "Cardio", "Cycling", "Pilates"],
    avoid: ["Skipping warm-up", "Overtraining without recovery"],
    videos: [
      {
        title: "Strength Training Workout",
        duration: "20 min",
        url: "https://www.youtube.com/embed/U0bhE67HuDY?rel=0",
      },
      {
        title: "Cardio and Core Session",
        duration: "18 min",
        url: "https://www.youtube.com/embed/ml6cT4AZdqI?rel=0",
      },
    ],
    audios: [
      {
        title: "Guided Dynamic Warmup",
        description: "Prepare joints and muscles for medium-high intensity sessions.",
        file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      },
    ],
    exerciseCards: [
      {
        title: "Full Body Strength Circuit",
        difficulty: "Medium",
        duration: "25 min",
        calories: "140 kcal",
        steps: [
          "Warm up with 5 minutes of brisk marching.",
          "Complete squats, lunges, and push variations.",
          "Perform 3 rounds with 45 second work intervals.",
          "Cool down with hip and shoulder mobility.",
        ],
      },
      {
        title: "Pilates Power Core",
        difficulty: "Medium",
        duration: "20 min",
        calories: "110 kcal",
        steps: [
          "Start with controlled breathing in neutral spine.",
          "Perform dead bugs and glute bridge sets.",
          "Add side planks for trunk stability.",
          "Finish with spinal decompression stretches.",
        ],
      },
    ],
  },
  ovulation: {
    energy: "Peak",
    intensity: "High",
    recommended: ["HIIT", "Running", "Power Workouts", "Strength Training"],
    avoid: ["Poor hydration", "Improper form at high speed"],
    videos: [
      {
        title: "HIIT Full Body Challenge",
        duration: "20 min",
        url: "https://www.youtube.com/embed/cZnsLVArIt8?rel=0",
      },
      {
        title: "Power Cardio Run Session",
        duration: "22 min",
        url: "https://www.youtube.com/embed/UBMk30rjy0o?rel=0",
      },
    ],
    audios: [
      {
        title: "Performance Focus Audio",
        description: "Mental focus and pacing cues for peak-energy workouts.",
        file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      },
    ],
    exerciseCards: [
      {
        title: "HIIT Blast",
        difficulty: "Hard",
        duration: "20 min",
        calories: "180 kcal",
        steps: [
          "Warm up with 5 minutes dynamic drills.",
          "Alternate 40 seconds work and 20 seconds rest.",
          "Include jump squats, mountain climbers, and burpees.",
          "Cool down with breathing and lower-body stretches.",
        ],
      },
      {
        title: "Power Strength Session",
        difficulty: "Hard",
        duration: "30 min",
        calories: "210 kcal",
        steps: [
          "Start with mobility and activation bands.",
          "Perform compound lifts or bodyweight alternatives.",
          "Use controlled reps and strong core engagement.",
          "Finish with cooldown and hydration reset.",
        ],
      },
    ],
  },
  luteal: {
    energy: "Medium to Low",
    intensity: "Light to Moderate",
    recommended: ["Light Strength Training", "Pilates", "Moderate Cardio", "Yoga Recovery"],
    avoid: ["Very high intensity every day", "Long sessions without rest"],
    videos: [
      {
        title: "Luteal Phase Pilates Flow",
        duration: "20 min",
        url: "https://www.youtube.com/embed/lCg_gh_fppI?rel=0",
      },
      {
        title: "Yoga Recovery Session",
        duration: "18 min",
        url: "https://www.youtube.com/embed/4C-gxOE0j7s?rel=0",
      },
    ],
    audios: [
      {
        title: "Recovery and Relaxation Audio",
        description: "Guided cooldown and breath rhythm for luteal balance.",
        file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      },
    ],
    exerciseCards: [
      {
        title: "Moderate Cardio Reset",
        difficulty: "Medium",
        duration: "22 min",
        calories: "120 kcal",
        steps: [
          "Begin with easy marching for 3 minutes.",
          "Alternate brisk pace and moderate pace every 2 minutes.",
          "Keep breathing steady and avoid sprint efforts.",
          "Finish with gentle full-body stretches.",
        ],
      },
      {
        title: "Yoga Recovery Routine",
        difficulty: "Easy",
        duration: "18 min",
        calories: "80 kcal",
        steps: [
          "Settle into diaphragmatic breathing for 2 minutes.",
          "Flow through cat-cow, low lunge, and forward fold.",
          "Hold restorative poses for deeper release.",
          "End with a 2 minute mindfulness cooldown.",
        ],
      },
    ],
  },
};

export default phaseExercises;
