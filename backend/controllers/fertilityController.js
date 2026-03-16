// backend/controllers/fertilityController.js
import FertilityLog from "../models/FertilityLog.js";
import Period from "../models/Period.js";
import { predictFertility, checkMLService } from "../services/mlPredictionService.js";

// Get fertility logs for a user
export const getFertilityLogs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { user: req.userId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const logs = await FertilityLog.find(query)
      .sort({ date: -1 })
      .lean();
    
    res.json({ success: true, logs });
  } catch (error) {
    console.error("Get fertility logs error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch fertility logs" });
  }
};

// Create or update fertility log
export const createFertilityLog = async (req, res) => {
  try {
    const {
      date,
      bbt,
      cervicalMucus,
      cervicalPosition,
      ovulationTest,
      intercourse,
      intercourseTime,
      symptoms,
      mood,
      energy,
      stress,
      sleepHours,
      sleepQuality,
      medications,
      supplements,
      notes,
      cycleDay,
      phase
    } = req.body;

    // Check if log already exists for this date
    const existingLog = await FertilityLog.findOne({
      user: req.userId,
      date: new Date(date)
    });

    let log;
    if (existingLog) {
      // Update existing log
      log = await FertilityLog.findByIdAndUpdate(
        existingLog._id,
        {
          bbt,
          cervicalMucus,
          cervicalPosition,
          ovulationTest,
          intercourse,
          intercourseTime,
          symptoms,
          mood,
          energy,
          stress,
          sleepHours,
          sleepQuality,
          medications,
          supplements,
          notes,
          cycleDay,
          phase
        },
        { new: true }
      );
    } else {
      // Create new log
      log = await FertilityLog.create({
        user: req.userId,
        date: new Date(date),
        bbt,
        cervicalMucus,
        cervicalPosition,
        ovulationTest,
        intercourse,
        intercourseTime,
        symptoms,
        mood,
        energy,
        stress,
        sleepHours,
        sleepQuality,
        medications,
        supplements,
        notes,
        cycleDay,
        phase
      });
    }

    res.status(201).json({ success: true, log });
  } catch (error) {
    console.error("Create fertility log error:", error);
    res.status(500).json({ success: false, message: "Failed to create fertility log" });
  }
};

// Get fertility insights and predictions
export const getFertilityInsights = async (req, res) => {
  try {
    const logs = await FertilityLog.find({ user: req.userId })
      .sort({ date: -1 })
      .limit(30)
      .lean();

    // Calculate cycle statistics
    const periods = await Period.find({ user: req.userId })
      .sort({ startDate: -1 })
      .limit(6)
      .lean();

    let cycleLengths = [];
    for (let i = 0; i < periods.length - 1; i++) {
      const cycleLength = Math.round(
        (periods[i].startDate - periods[i + 1].startDate) / (1000 * 60 * 60 * 24)
      );
      cycleLengths.push(cycleLength);
    }

    const avgCycleLength = cycleLengths.length > 0 
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : 28;

    // Predict next ovulation
    const lastPeriod = periods[0];
    const nextOvulationDate = lastPeriod 
      ? new Date(lastPeriod.startDate.getTime() + (avgCycleLength - 14) * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // Calculate fertile window
    const fertileWindowStart = new Date(nextOvulationDate.getTime() - 5 * 24 * 60 * 60 * 1000);
    const fertileWindowEnd = new Date(nextOvulationDate.getTime() + 1 * 24 * 60 * 60 * 1000);

    // Analyze BBT pattern
    const bbtData = logs
      .filter(log => log.bbt)
      .map(log => ({ date: log.date, temp: log.bbt }))
      .slice(0, 14);

    // Calculate fertility score based on recent data
    let fertilityScore = 50;
    const recentLogs = logs.slice(0, 7);
    
    if (recentLogs.some(log => log.ovulationTest === 'positive')) fertilityScore += 20;
    if (recentLogs.some(log => log.cervicalMucus === 'egg-white')) fertilityScore += 15;
    if (recentLogs.some(log => log.intercourse)) fertilityScore += 10;
    if (recentLogs.some(log => log.energy >= 7)) fertilityScore += 5;

    const insights = {
      currentPhase: "Follicular", // This would be calculated based on cycle day
      cycleDay: 8, // This would be calculated based on last period
      daysUntilOvulation: Math.ceil((nextOvulationDate - new Date()) / (1000 * 60 * 60 * 24)),
      nextOvulationDate: nextOvulationDate.toISOString().split('T')[0],
      fertileWindowStart: fertileWindowStart.toISOString().split('T')[0],
      fertileWindowEnd: fertileWindowEnd.toISOString().split('T')[0],
      averageCycleLength: avgCycleLength,
      fertilityScore: Math.min(fertilityScore, 100),
      bbtData,
      recentSymptoms: recentLogs.map(log => log.symptoms).flat(),
      recommendations: [
        "Track your basal body temperature daily",
        "Monitor cervical mucus changes",
        "Use ovulation predictor kits",
        "Have intercourse during fertile window",
        "Maintain a healthy lifestyle"
      ]
    };

    res.json({ success: true, insights });
  } catch (error) {
    console.error("Get fertility insights error:", error);
    res.status(500).json({ success: false, message: "Failed to get fertility insights" });
  }
};

// Get ML-based fertility prediction
export const getMLPrediction = async (req, res) => {
  try {
    const { date } = req.query; // Optional: specific date, otherwise uses today's log
    
    // Get today's or specified log
    const log = await FertilityLog.findOne({
      user: req.userId,
      date: date ? new Date(date) : new Date().toISOString().split('T')[0]
    }).lean();

    if (!log) {
      return res.status(404).json({ 
        success: false, 
        message: "No fertility log found for this date" 
      });
    }

    // Check if ML service is available
    const mlAvailable = await checkMLService();
    
    if (mlAvailable) {
      // Use ML prediction
      const prediction = await predictFertility(log);
      
      if (prediction.success) {
        return res.json({
          success: true,
          ml_enabled: true,
          prediction: {
            fertile: prediction.fertile,
            fertile_probability: prediction.fertile_probability,
            not_fertile_probability: prediction.not_fertile_probability,
            confidence: prediction.confidence
          },
          log: {
            date: log.date,
            cycle_day: log.cycleDay,
            bbt: log.bbt,
            cervical_mucus: log.cervicalMucus,
            ovulation_test: log.ovulationTest
          }
        });
      }
    }

    // Fallback to rule-based prediction
    const isFertile = 
      log.ovulationTest === 'positive' || 
      log.cervicalMucus === 'egg-white' || 
      log.cervicalMucus === 'watery';

    res.json({
      success: true,
      ml_enabled: false,
      fallback: true,
      prediction: {
        fertile: isFertile,
        fertile_probability: isFertile ? 75 : 25,
        confidence: 60
      },
      log: {
        date: log.date,
        cycle_day: log.cycleDay,
        bbt: log.bbt,
        cervical_mucus: log.cervicalMucus,
        ovulation_test: log.ovulationTest
      }
    });

  } catch (error) {
    console.error("Get ML prediction error:", error);
    res.status(500).json({ success: false, message: "Failed to get ML prediction" });
  }
};

// Get enhanced insights with ML predictions
export const getEnhancedInsights = async (req, res) => {
  try {
    const logs = await FertilityLog.find({ user: req.userId })
      .sort({ date: -1 })
      .limit(30)
      .lean();

    if (logs.length === 0) {
      return res.json({
        success: true,
        insights: null,
        message: "No fertility data available"
      });
    }

    // Calculate cycle statistics
    const periods = await Period.find({ user: req.userId })
      .sort({ startDate: -1 })
      .limit(6)
      .lean();

    let cycleLengths = [];
    for (let i = 0; i < periods.length - 1; i++) {
      const cycleLength = Math.round(
        (periods[i].startDate - periods[i + 1].startDate) / (1000 * 60 * 60 * 24)
      );
      cycleLengths.push(cycleLength);
    }

    const avgCycleLength = cycleLengths.length > 0 
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : 28;

    // Predict next ovulation
    const lastPeriod = periods[0];
    const nextOvulationDate = lastPeriod 
      ? new Date(lastPeriod.startDate.getTime() + (avgCycleLength - 14) * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // Calculate fertile window
    const fertileWindowStart = new Date(nextOvulationDate.getTime() - 5 * 24 * 60 * 60 * 1000);
    const fertileWindowEnd = new Date(nextOvulationDate.getTime() + 1 * 24 * 60 * 60 * 1000);

    // Check if ML service is available
    const mlAvailable = await checkMLService();
    let mlInsights = null;

    if (mlAvailable && logs.length >= 7) {
      try {
        // Get ML prediction for today
        const today = logs[0];
        const mlPrediction = await predictFertility(today);
        
        if (mlPrediction.success) {
          mlInsights = {
            today_fertile: mlPrediction.fertile,
            fertile_probability: mlPrediction.fertile_probability,
            confidence: mlPrediction.confidence,
            ml_enabled: true
          };
        }
      } catch (error) {
        console.error("ML prediction error:", error.message);
      }
    }

    // Calculate fertility score
    let fertilityScore = 50;
    const recentLogs = logs.slice(0, 7);
    
    if (recentLogs.some(log => log.ovulationTest === 'positive')) fertilityScore += 20;
    if (recentLogs.some(log => log.cervicalMucus === 'egg-white')) fertilityScore += 15;
    if (recentLogs.some(log => log.intercourse)) fertilityScore += 10;
    if (recentLogs.some(log => log.energy >= 7)) fertilityScore += 5;

    const insights = {
      currentPhase: logs[0]?.phase || "follicular",
      cycleDay: logs[0]?.cycleDay || 1,
      daysUntilOvulation: Math.ceil((nextOvulationDate - new Date()) / (1000 * 60 * 60 * 24)),
      nextOvulationDate: nextOvulationDate.toISOString().split('T')[0],
      fertileWindowStart: fertileWindowStart.toISOString().split('T')[0],
      fertileWindowEnd: fertileWindowEnd.toISOString().split('T')[0],
      averageCycleLength: avgCycleLength,
      fertilityScore: Math.min(fertilityScore, 100),
      recentSymptoms: recentLogs.map(log => log.symptoms).flat(),
      recommendations: [
        "Track your basal body temperature daily",
        "Monitor cervical mucus changes",
        "Use ovulation predictor kits",
        "Have intercourse during fertile window",
        "Maintain a healthy lifestyle"
      ],
      ml_insights: mlInsights
    };

    res.json({ success: true, insights });
  } catch (error) {
    console.error("Get enhanced insights error:", error);
    res.status(500).json({ success: false, message: "Failed to get enhanced insights" });
  }
};

// Get comprehensive fertility insights with TFJS ML predictions
export const getComprehensiveInsights = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Fetch last 30 days logs
    const recentLogs = await FertilityLog.find({ user: userId })
      .sort({ date: 1 })
      .limit(30)
      .lean();
    
    if (recentLogs.length === 0) {
      return res.json({
        success: true,
        message: "No fertility data available",
        insights: null
      });
    }
    
    // Calculate cycle statistics
    const periods = await Period.find({ user: userId })
      .sort({ startDate: -1 })
      .limit(6)
      .lean();
    
    let cycleLengths = [];
    for (let i = 0; i < periods.length - 1; i++) {
      const cycleLength = Math.round(
        (periods[i].startDate - periods[i + 1].startDate) / (1000 * 60 * 60 * 24)
      );
      cycleLengths.push(cycleLength);
    }
    
    const avgCycleLength = cycleLengths.length > 0 
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : 28;
    
    // Calculate fertility score
    let fertilityScore = 50;
    const recent = recentLogs.slice(0, 7);
    if (recent.some(log => log.ovulationTest === 'positive')) fertilityScore += 20;
    if (recent.some(log => log.cervicalMucus === 'egg-white')) fertilityScore += 15;
    if (recent.some(log => log.intercourse)) fertilityScore += 10;
    if (recent.some(log => log.energy >= 7)) fertilityScore += 5;
    
    // Try ML prediction (Flask API)
    let mlPrediction = null;
    let mlEnabled = false;
    
    try {
      // Try Flask API first (always works)
      const flaskAvailable = await checkMLService();
      if (flaskAvailable) {
        const flaskPrediction = await predictFertility(recentLogs[0]);
        if (flaskPrediction.success) {
          mlEnabled = true;
          mlPrediction = {
            fertile: flaskPrediction.fertile,
            fertile_probability: flaskPrediction.fertile_probability,
            not_fertile_probability: flaskPrediction.not_fertile_probability || (100 - flaskPrediction.fertile_probability),
            confidence: flaskPrediction.confidence
          };
        }
      }
      
      // Note: TFJS not available - using Flask API only
    } catch (error) {
      console.log("ML prediction not available:", error.message);
    }
    
    // Predict ovulation date based on last period
    const lastPeriod = periods[0];
    let predictedOvulationDate = null;
    let fertileWindow = [];
    
    if (lastPeriod) {
      const cycleStart = new Date(lastPeriod.startDate);
      const ovulationDay = avgCycleLength - 14;
      predictedOvulationDate = new Date(cycleStart.getTime() + ovulationDay * 24 * 60 * 60 * 1000);
      
      // Calculate fertile window (5 days before + ovulation day)
      const fertileStart = new Date(predictedOvulationDate.getTime() - 5 * 24 * 60 * 60 * 1000);
      const fertileEnd = new Date(predictedOvulationDate.getTime() + 1 * 24 * 60 * 60 * 1000);
      
      fertileWindow = [
        fertileStart.toISOString().split('T')[0],
        fertileEnd.toISOString().split('T')[0]
      ];
    }
    
    const insights = {
      currentPhase: recentLogs[0]?.phase || "follicular",
      cycleDay: recentLogs[0]?.cycleDay || 1,
      averageCycleLength: avgCycleLength,
      fertilityScore: Math.min(fertilityScore, 100),
      predictedOvulationDate: predictedOvulationDate ? predictedOvulationDate.toISOString().split('T')[0] : null,
      fertileWindow,
      mlPrediction: mlPrediction ? {
        fertile: mlPrediction.fertile,
        fertile_probability: mlPrediction.fertile_probability,
        not_fertile_probability: mlPrediction.not_fertile_probability,
        confidence: mlPrediction.confidence
      } : null,
      mlEnabled
    };
    
    res.json({
      success: true,
      insights
    });
    
  } catch (error) {
    console.error("Get comprehensive insights error:", error);
    res.status(500).json({ success: false, message: "Failed to get comprehensive insights" });
  }
};
