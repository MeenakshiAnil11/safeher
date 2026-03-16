// backend/controllers/perimenopauseController.js
import PerimenopauseLog from "../models/PerimenopauseLog.js";

// Get perimenopause logs for a user
export const getPerimenopauseLogs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { user: req.userId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const logs = await PerimenopauseLog.find(query)
      .sort({ date: -1 })
      .lean();
    
    res.json({ success: true, logs });
  } catch (error) {
    console.error("Get perimenopause logs error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch perimenopause logs" });
  }
};

// Create or update perimenopause log
export const createPerimenopauseLog = async (req, res) => {
  try {
    const {
      date,
      cycleLength,
      periodLength,
      periodFlow,
      cycleIrregularity,
      hotFlashes,
      nightSweats,
      moodSwings,
      irritability,
      anxiety,
      depression,
      fatigue,
      sleepProblems,
      memoryIssues,
      concentrationProblems,
      weightGain,
      jointPain,
      headaches,
      breastTenderness,
      vaginalDryness,
      decreasedLibido,
      urinaryProblems,
      symptomIntensity,
      hotFlashCount,
      hotFlashDuration,
      sleepHours,
      sleepQuality,
      sleepInterruptions,
      mood,
      energy,
      stress,
      weight,
      weightChange,
      exercise,
      exerciseType,
      exerciseDuration,
      activityLevel,
      mealsEaten,
      waterIntake,
      supplements,
      caffeineIntake,
      medications,
      hormoneTherapy,
      alternativeTreatments,
      doctorVisit,
      bloodTest,
      notes
    } = req.body;

    // Check if log already exists for this date
    const existingLog = await PerimenopauseLog.findOne({
      user: req.userId,
      date: new Date(date)
    });

    let log;
    if (existingLog) {
      // Update existing log
      log = await PerimenopauseLog.findByIdAndUpdate(
        existingLog._id,
        {
          cycleLength,
          periodLength,
          periodFlow,
          cycleIrregularity,
          hotFlashes,
          nightSweats,
          moodSwings,
          irritability,
          anxiety,
          depression,
          fatigue,
          sleepProblems,
          memoryIssues,
          concentrationProblems,
          weightGain,
          jointPain,
          headaches,
          breastTenderness,
          vaginalDryness,
          decreasedLibido,
          urinaryProblems,
          symptomIntensity,
          hotFlashCount,
          hotFlashDuration,
          sleepHours,
          sleepQuality,
          sleepInterruptions,
          mood,
          energy,
          stress,
          weight,
          weightChange,
          exercise,
          exerciseType,
          exerciseDuration,
          activityLevel,
          mealsEaten,
          waterIntake,
          supplements,
          caffeineIntake,
          medications,
          hormoneTherapy,
          alternativeTreatments,
          doctorVisit,
          bloodTest,
          notes
        },
        { new: true }
      );
    } else {
      // Create new log
      log = await PerimenopauseLog.create({
        user: req.userId,
        date: new Date(date),
        cycleLength,
        periodLength,
        periodFlow,
        cycleIrregularity,
        hotFlashes,
        nightSweats,
        moodSwings,
        irritability,
        anxiety,
        depression,
        fatigue,
        sleepProblems,
        memoryIssues,
        concentrationProblems,
        weightGain,
        jointPain,
        headaches,
        breastTenderness,
        vaginalDryness,
        decreasedLibido,
        urinaryProblems,
        symptomIntensity,
        hotFlashCount,
        hotFlashDuration,
        sleepHours,
        sleepQuality,
        sleepInterruptions,
        mood,
        energy,
        stress,
        weight,
        weightChange,
        exercise,
        exerciseType,
        exerciseDuration,
        activityLevel,
        mealsEaten,
        waterIntake,
        supplements,
        caffeineIntake,
        medications,
        hormoneTherapy,
        alternativeTreatments,
        doctorVisit,
        bloodTest,
        notes
      });
    }

    res.status(201).json({ success: true, log });
  } catch (error) {
    console.error("Create perimenopause log error:", error);
    res.status(500).json({ success: false, message: "Failed to create perimenopause log" });
  }
};

// Get perimenopause overview data
export const getPerimenopauseOverview = async (req, res) => {
  try {
    const logs = await PerimenopauseLog.find({ user: req.userId })
      .sort({ date: -1 })
      .limit(30)
      .lean();

    // Determine current stage based on cycle irregularity
    const recentLogs = logs.slice(0, 10);
    const irregularityCount = recentLogs.filter(log => 
      log.cycleIrregularity === 'slightly-irregular' || 
      log.cycleIrregularity === 'very-irregular'
    ).length;
    
    let currentStage = "Mid";
    if (irregularityCount < 3) {
      currentStage = "Early";
    } else if (irregularityCount > 7) {
      currentStage = "Late";
    }

    // Calculate hormonal balance index
    let balanceScore = 100;
    const symptomCount = recentLogs.reduce((count, log) => {
      return count + (log.hotFlashes ? 1 : 0) + (log.nightSweats ? 1 : 0) + 
             (log.moodSwings ? 1 : 0) + (log.fatigue ? 1 : 0);
    }, 0);
    balanceScore -= symptomCount * 5;

    const lastLog = recentLogs[0];
    const lastSymptom = lastLog ? 
      Object.entries(lastLog).find(([key, value]) => 
        key.includes('flash') || key.includes('sweat') || key.includes('mood') || key.includes('fatigue') && value
      )?.[0] : null;

    const overviewData = {
      currentStage,
      hormonalBalanceIndex: Math.max(0, balanceScore),
      lastLoggedSymptom: lastSymptom || "No symptoms logged",
      lastSymptomTimestamp: lastLog?.date || new Date().toISOString(),
      nextAppointment: "No upcoming appointments",
      nextAppointmentTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    res.json(overviewData);
  } catch (error) {
    console.error("Get perimenopause overview error:", error);
    res.status(500).json({ success: false, message: "Failed to get perimenopause overview" });
  }
};

// Get perimenopause insights and patterns
export const getPerimenopauseInsights = async (req, res) => {
  try {
    const logs = await PerimenopauseLog.find({ user: req.userId })
      .sort({ date: -1 })
      .limit(30)
      .lean();

    // Analyze symptom patterns
    const symptomAnalysis = {
      hotFlashes: logs.filter(log => log.hotFlashes).length,
      nightSweats: logs.filter(log => log.nightSweats).length,
      moodSwings: logs.filter(log => log.moodSwings).length,
      sleepProblems: logs.filter(log => log.sleepProblems).length,
      fatigue: logs.filter(log => log.fatigue).length,
      anxiety: logs.filter(log => log.anxiety).length,
      depression: logs.filter(log => log.depression).length,
      weightGain: logs.filter(log => log.weightGain).length,
      jointPain: logs.filter(log => log.jointPain).length,
      headaches: logs.filter(log => log.headaches).length
    };

    // Calculate average values
    const avgEnergy = logs.reduce((sum, log) => sum + (log.energy || 5), 0) / logs.length;
    const avgStress = logs.reduce((sum, log) => sum + (log.stress || 5), 0) / logs.length;
    const avgSleepHours = logs.reduce((sum, log) => sum + (log.sleepHours || 7), 0) / logs.length;

    // Analyze cycle irregularity
    const cycleIrregularityCount = logs.filter(log => 
      log.cycleIrregularity === 'slightly-irregular' || 
      log.cycleIrregularity === 'very-irregular'
    ).length;

    // Generate recommendations based on symptoms
    const recommendations = [];
    if (symptomAnalysis.hotFlashes > 5) {
      recommendations.push("Consider cooling strategies and breathable fabrics");
    }
    if (symptomAnalysis.sleepProblems > 5) {
      recommendations.push("Practice good sleep hygiene and relaxation techniques");
    }
    if (symptomAnalysis.moodSwings > 5) {
      recommendations.push("Consider stress management and mood tracking");
    }
    if (avgEnergy < 4) {
      recommendations.push("Focus on nutrition and gentle exercise");
    }

    const insights = {
      symptomAnalysis,
      averageEnergy: Math.round(avgEnergy * 10) / 10,
      averageStress: Math.round(avgStress * 10) / 10,
      averageSleepHours: Math.round(avgSleepHours * 10) / 10,
      cycleIrregularityPercentage: Math.round((cycleIrregularityCount / logs.length) * 100),
      wellnessTips: [
        "Maintain a balanced diet rich in calcium and vitamin D",
        "Engage in regular weight-bearing exercises",
        "Practice stress-reduction techniques like meditation",
        "Ensure 7-9 hours of quality sleep each night",
        "Limit caffeine and alcohol intake",
        "Stay hydrated throughout the day",
        "Consider herbal supplements like black cohosh",
        "Track symptoms to identify patterns and triggers"
      ],
      recommendations,
      commonSymptoms: [
        "Hot flashes and night sweats",
        "Irregular periods",
        "Mood swings and irritability",
        "Sleep disturbances",
        "Fatigue and low energy",
        "Weight gain",
        "Memory and concentration issues",
        "Joint pain and stiffness",
        "Headaches",
        "Decreased libido"
      ]
    };

    res.json({ success: true, insights });
  } catch (error) {
    console.error("Get perimenopause insights error:", error);
    res.status(500).json({ success: false, message: "Failed to get perimenopause insights" });
  }
};

// Get AI insight for perimenopause
export const getPerimenopauseInsight = async (req, res) => {
  try {
    const logs = await PerimenopauseLog.find({ user: req.userId })
      .sort({ date: -1 })
      .limit(7)
      .lean();

    // Generate personalized insight based on user's recent data
    const insights = [
      "Focus on maintaining a balanced diet rich in calcium and vitamin D. Consider gentle exercises like yoga or walking to support your bone health during perimenopause.",
      "Track your symptoms to identify patterns. This can help you understand what triggers certain symptoms and manage them better.",
      "Stay hydrated throughout the day. Drinking water helps regulate body temperature and can reduce the intensity of hot flashes.",
      "Practice stress-reduction techniques like meditation or deep breathing. Managing stress is crucial during this transitional phase.",
      "Ensure adequate sleep. Aim for 7-9 hours of quality sleep each night to support your overall well-being.",
      "Consider talking to your healthcare provider about hormone therapy or alternative treatments if symptoms are severe.",
      "Join support groups or communities to share experiences. You're not alone in this journey."
    ];

    const randomInsight = insights[Math.floor(Math.random() * insights.length)];
    
    const insightData = {
      title: "Today's AI Insight",
      content: randomInsight,
      timestamp: new Date().toISOString()
    };

    res.json(insightData);
  } catch (error) {
    console.error("Get perimenopause insight error:", error);
    res.status(500).json({ success: false, message: "Failed to get AI insight" });
  }
};

// Regenerate AI insight
export const regeneratePerimenopauseInsight = async (req, res) => {
  try {
    const logs = await PerimenopauseLog.find({ user: req.userId })
      .sort({ date: -1 })
      .limit(7)
      .lean();

    // Generate new personalized insight
    const insights = [
      "Hot flashes can be managed with cooling strategies. Dress in layers and keep your environment cool.",
      "Maintain regular exercise to support your cardiovascular health and mood during perimenopause.",
      "Nutritional supplements like omega-3 fatty acids and B vitamins can support your wellness journey.",
      "Keep a symptom journal to track patterns and discuss them with your healthcare provider.",
      "Practice mindfulness meditation to help manage mood swings and anxiety.",
      "Limit caffeine and alcohol intake, especially in the evening, to improve sleep quality.",
      "Consider acupuncture or other complementary therapies to help manage symptoms."
    ];

    const randomInsight = insights[Math.floor(Math.random() * insights.length)];
    
    const insightData = {
      title: "Today's AI Insight",
      content: randomInsight,
      timestamp: new Date().toISOString()
    };

    res.json(insightData);
  } catch (error) {
    console.error("Regenerate perimenopause insight error:", error);
    res.status(500).json({ success: false, message: "Failed to regenerate AI insight" });
  }
};
