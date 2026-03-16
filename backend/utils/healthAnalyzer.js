// Health Analysis Utility Functions

/**
 * Calculate health risk score based on vitals
 */
export function calculateHealthRisk(vitals) {
  let riskScore = 0;
  const warnings = [];
  
  // Check recent vitals (last 5 entries)
  const recentVitals = vitals.slice(-5);
  
  if (recentVitals.length === 0) {
    return { score: 0, level: "info", message: "No data available" };
  }

  // Analyze BMI
  const avgBMI = recentVitals
    .filter(v => v.bmi)
    .reduce((sum, v) => sum + v.bmi, 0) / recentVitals.filter(v => v.bmi).length;
  
  if (avgBMI > 25) {
    riskScore += 30;
    warnings.push("High BMI detected - consider weight management");
  }
  
  // Analyze Blood Pressure
  const avgSystolic = recentVitals
    .filter(v => v.systolic)
    .reduce((sum, v) => sum + v.systolic, 0) / recentVitals.filter(v => v.systolic).length;
  
  const avgDiastolic = recentVitals
    .filter(v => v.diastolic)
    .reduce((sum, v) => sum + v.diastolic, 0) / recentVitals.filter(v => v.diastolic).length;
  
  if (avgSystolic > 130 || avgDiastolic > 85) {
    riskScore += 40;
    warnings.push("Elevated blood pressure - monitor closely");
  } else if (avgSystolic > 120 || avgDiastolic > 80) {
    riskScore += 20;
    warnings.push("Blood pressure slightly elevated");
  }
  
  // Analyze Blood Sugar
  const recentBloodSugar = recentVitals.filter(v => v.bloodSugar);
  if (recentBloodSugar.length > 0) {
    const avgBloodSugar = recentBloodSugar.reduce((sum, v) => sum + v.bloodSugar, 0) / recentBloodSugar.length;
    if (avgBloodSugar > 140) {
      riskScore += 50;
      warnings.push("High blood sugar detected - consult doctor");
    } else if (avgBloodSugar > 100) {
      riskScore += 30;
      warnings.push("Blood sugar above normal");
    }
  }
  
  // Determine risk level
  let level = "low";
  let message = "Your health metrics look good!";
  
  if (riskScore >= 70) {
    level = "high";
    message = "⚠️ High risk detected - please consult a healthcare provider";
  } else if (riskScore >= 40) {
    level = "moderate";
    message = "⚠️ Some health concerns detected - monitor your vitals";
  } else if (riskScore > 0) {
    level = "low";
    message = "✅ Generally healthy with minor areas to watch";
  } else {
    level = "excellent";
    message = "🎉 Excellent health metrics!";
  }
  
  return {
    score: riskScore,
    level,
    message,
    warnings,
    recommendations: generateRecommendations(level, warnings)
  };
}

function generateRecommendations(level, warnings) {
  const recommendations = [];
  
  if (warnings.some(w => w.includes("BMI"))) {
    recommendations.push("Consider regular exercise and a balanced diet");
  }
  
  if (warnings.some(w => w.includes("blood pressure"))) {
    recommendations.push("Reduce sodium intake, exercise regularly, and manage stress");
  }
  
  if (warnings.some(w => w.includes("blood sugar"))) {
    recommendations.push("Monitor carbohydrate intake and consider dietary changes");
  }
  
  if (level === "high") {
    recommendations.unshift("Consult with a healthcare provider for a comprehensive evaluation");
  }
  
  return recommendations;
}

/**
 * Detect correlations between different health metrics
 */
export function detectCorrelations(symptoms, sleepLogs, exercises, moodLogs) {
  const correlations = [];
  
  // Sleep and Mood Correlation
  if (sleepLogs.length > 5 && moodLogs.length > 5) {
    const recentSleep = sleepLogs.slice(-7);
    const recentMood = moodLogs.slice(-7);
    
    const goodSleepDays = recentSleep.filter(s => 
      s.quality === 'excellent' || s.quality === 'good'
    ).length;
    
    const positiveMoodDays = recentMood.filter(m => 
      m.mood === 'Happy' || m.mood === 'Calm' || m.mood === 'Excited'
    ).length;
    
    if (goodSleepDays >= 5 && positiveMoodDays >= 4) {
      correlations.push({
        type: "positive",
        metric1: "Sleep Quality",
        metric2: "Mood",
        strength: "strong",
        message: "You have better mood on days with quality sleep",
        details: `${goodSleepDays} good sleep days out of ${recentSleep.length}`
      });
    }
  }
  
  // Exercise and Sleep Correlation
  if (exercises.length > 5 && sleepLogs.length > 5) {
    const exerciseDays = exercises.slice(-7).map(e => e.date);
    const sleepAfterExercise = sleepLogs.filter(s => 
      exerciseDays.includes(s.date)
    );
    
    const avgSleepHours = sleepAfterExercise.reduce((sum, s) => sum + s.sleepHours, 0) / sleepAfterExercise.length;
    const avgSleepAll = sleepLogs.reduce((sum, s) => sum + s.sleepHours, 0) / sleepLogs.length;
    
    if (avgSleepHours > avgSleepAll + 0.5) {
      correlations.push({
        type: "positive",
        metric1: "Exercise",
        metric2: "Sleep Duration",
        strength: "moderate",
        message: "You sleep better on days you exercise",
        details: `${avgSleepHours.toFixed(1)}h vs ${avgSleepAll.toFixed(1)}h average`
      });
    }
  }
  
  // Symptoms and Lifestyle Correlation
  if (symptoms.length > 5) {
    const recentSymptoms = symptoms.slice(-7);
    const avgSeverity = recentSymptoms.reduce((sum, s) => sum + s.severity, 0) / recentSymptoms.length;
    
    if (avgSeverity > 3.5) {
      correlations.push({
        type: "negative",
        metric1: "Symptoms",
        metric2: "Lifestyle",
        strength: "moderate",
        message: "Higher symptom severity detected - consider consulting a doctor",
        details: `Average severity: ${avgSeverity.toFixed(1)}/5`
      });
    }
  }
  
  return correlations;
}

/**
 * Generate AI insights based on health data
 */
export function generateAIInsights(vitals, symptoms, exercise, sleep, nutrition, moodLogs) {
  const insights = [];
  
  // Trend analysis
  if (vitals.length > 3) {
    const weightTrend = analyzeWeightTrend(vitals);
    if (weightTrend) {
      insights.push(weightTrend);
    }
  }
  
  // Exercise pattern
  if (exercise.length > 10) {
    const exercisePattern = analyzeExercisePattern(exercise);
    if (exercisePattern) {
      insights.push(exercisePattern);
    }
  }
  
  // Sleep quality trend
  if (sleep.length > 7) {
    const sleepTrend = analyzeSleepTrend(sleep);
    if (sleepTrend) {
      insights.push(sleepTrend);
    }
  }
  
  // Nutrition balance
  if (nutrition.length > 7) {
    const nutritionInsight = analyzeNutrition(nutrition);
    if (nutritionInsight) {
      insights.push(nutritionInsight);
    }
  }
  
  return insights;
}

function analyzeWeightTrend(vitals) {
  const recentWeights = vitals.slice(-5).map(v => v.weightKg).filter(w => w);
  if (recentWeights.length < 3) return null;
  
  const first = recentWeights[0];
  const last = recentWeights[recentWeights.length - 1];
  const change = last - first;
  const percentChange = ((change / first) * 100).toFixed(1);
  
  if (Math.abs(change) > 2) {
    const direction = change > 0 ? "increased" : "decreased";
    return {
      type: "trend",
      category: "weight",
      title: `Weight ${direction} by ${Math.abs(change).toFixed(1)} kg`,
      message: `Your weight has ${direction} by ${percentChange}% over recent entries`,
      icon: change > 0 ? "📈" : "📉",
      severity: Math.abs(change) > 5 ? "high" : "moderate"
    };
  }
  return null;
}

function analyzeExercisePattern(exercises) {
  const recentExercises = exercises.slice(-14); // last 2 weeks
  const workoutFrequency = recentExercises.length;
  const avgDuration = recentExercises.reduce((sum, e) => sum + e.duration, 0) / recentExercises.length;
  
  if (workoutFrequency >= 5 && avgDuration >= 30) {
    return {
      type: "pattern",
      category: "exercise",
      title: "Consistent Exercise Pattern",
      message: `You've exercised ${workoutFrequency} times in the last 2 weeks with an average of ${avgDuration.toFixed(0)} min per session`,
      icon: "💪",
      severity: "positive"
    };
  } else if (workoutFrequency < 3) {
    return {
      type: "recommendation",
      category: "exercise",
      title: "Increase Exercise Frequency",
      message: "Consider exercising more regularly for better health",
      icon: "🏃‍♀️",
      severity: "moderate"
    };
  }
  return null;
}

function analyzeSleepTrend(sleep) {
  const recentSleep = sleep.slice(-7);
  const avgSleep = recentSleep.reduce((sum, s) => sum + s.sleepHours, 0) / recentSleep.length;
  const goodSleepDays = recentSleep.filter(s => s.quality === 'excellent' || s.quality === 'good').length;
  
  if (avgSleep < 7 && goodSleepDays < 4) {
    return {
      type: "warning",
      category: "sleep",
      title: "Sleep Quality Needs Attention",
      message: `Your average sleep is ${avgSleep.toFixed(1)}h with only ${goodSleepDays} good quality days`,
      icon: "😴",
      severity: "moderate",
      recommendation: "Aim for 7-9 hours of quality sleep"
    };
  } else if (avgSleep >= 7.5 && goodSleepDays >= 5) {
    return {
      type: "positive",
      category: "sleep",
      title: "Excellent Sleep Habits",
      message: `You're maintaining ${avgSleep.toFixed(1)}h average with ${goodSleepDays} quality sleep days`,
      icon: "😴✅",
      severity: "positive"
    };
  }
  return null;
}

function analyzeNutrition(nutrition) {
  const recentNutrition = nutrition.slice(-7);
  const avgCalories = recentNutrition.reduce((sum, n) => sum + n.calories, 0) / recentNutrition.length;
  const avgProtein = recentNutrition.reduce((sum, n) => sum + (n.protein || 0), 0) / recentNutrition.length;
  
  if (avgCalories < 1200) {
    return {
      type: "warning",
      category: "nutrition",
      title: "Low Calorie Intake",
      message: `Your average intake is ${avgCalories.toFixed(0)} calories - may be too low`,
      icon: "🍽️",
      severity: "moderate",
      recommendation: "Ensure adequate nutrition for your activity level"
    };
  } else if (avgProtein < 30) {
    return {
      type: "recommendation",
      category: "nutrition",
      title: "Consider More Protein",
      message: `Your average protein intake is ${avgProtein.toFixed(1)}g - consider increasing for better health`,
      icon: "🥩",
      severity: "low"
    };
  }
  return null;
}

