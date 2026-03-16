import HealthGoal from "../models/HealthGoal.js";
import Vital from "../models/Vital.js";
import Symptom from "../models/Symptom.js";
import Exercise from "../models/Exercise.js";
import Sleep from "../models/Sleep.js";
import Nutrition from "../models/Nutrition.js";
import MoodLog from "../models/MoodLog.js";
import {
  calculateHealthRisk,
  detectCorrelations,
  generateAIInsights
} from "../utils/healthAnalyzer.js";

// ==================== HEALTH GOALS ====================

export const listGoals = async (req, res) => {
  try {
    const goals = await HealthGoal.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ items: goals });
  } catch (err) {
    console.error("listGoals error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createGoal = async (req, res) => {
  try {
    const { category, title, description, targetValue, unit, deadline, status = "active" } = req.body;
    
    if (!category || !title || !targetValue) {
      return res.status(400).json({ message: "category, title, and targetValue are required" });
    }

    const goal = new HealthGoal({
      user: req.userId,
      category,
      title,
      description,
      targetValue,
      unit: unit || "",
      deadline: deadline ? new Date(deadline) : undefined,
      status,
      currentValue: 0,
      progress: 0
    });

    await goal.save();
    res.status(201).json({ message: "Goal created", item: goal });
  } catch (err) {
    console.error("createGoal error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    
    if (updates.deadline) updates.deadline = new Date(updates.deadline);
    if (updates.currentValue !== undefined) {
      updates.currentValue = Number(updates.currentValue);
    }
    
    const goal = await HealthGoal.findOneAndUpdate(
      { _id: id, user: req.userId },
      updates,
      { new: true }
    );
    
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    
    res.json({ message: "Goal updated", item: goal });
  } catch (err) {
    console.error("updateGoal error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await HealthGoal.findOneAndDelete({ _id: id, user: req.userId });
    if (!result) return res.status(404).json({ message: "Goal not found" });
    res.json({ message: "Goal deleted" });
  } catch (err) {
    console.error("deleteGoal error", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================== HEALTH ANALYTICS ====================

export const getHealthRisk = async (req, res) => {
  try {
    const vitals = await Vital.find({ user: req.userId })
      .sort({ recordedAt: -1 })
      .limit(50)
      .lean();
    
    const riskAnalysis = calculateHealthRisk(vitals);
    
    res.json(riskAnalysis);
  } catch (err) {
    console.error("getHealthRisk error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCorrelations = async (req, res) => {
  try {
    const [symptoms, sleepLogs, exercises, moodLogs] = await Promise.all([
      Symptom.find({ user: req.userId }).sort({ date: -1 }).limit(30).lean(),
      Sleep.find({ user: req.userId }).sort({ date: -1 }).limit(30).lean(),
      Exercise.find({ user: req.userId }).sort({ date: -1 }).limit(30).lean(),
      MoodLog.find({ user: req.userId }).sort({ date: -1 }).limit(30).lean()
    ]);
    
    const correlations = detectCorrelations(symptoms, sleepLogs, exercises, moodLogs);
    
    res.json({ correlations });
  } catch (err) {
    console.error("getCorrelations error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAIInsights = async (req, res) => {
  try {
    const [vitals, symptoms, exercises, sleep, nutrition, moodLogs] = await Promise.all([
      Vital.find({ user: req.userId }).sort({ recordedAt: -1 }).limit(50).lean(),
      Symptom.find({ user: req.userId }).sort({ date: -1 }).limit(30).lean(),
      Exercise.find({ user: req.userId }).sort({ date: -1 }).limit(30).lean(),
      Sleep.find({ user: req.userId }).sort({ date: -1 }).limit(30).lean(),
      Nutrition.find({ user: req.userId }).sort({ date: -1 }).limit(30).lean(),
      MoodLog.find({ user: req.userId }).sort({ date: -1 }).limit(30).lean()
    ]);
    
    const insights = generateAIInsights(vitals, symptoms, exercises, sleep, nutrition, moodLogs);
    
    res.json({ insights });
  } catch (err) {
    console.error("getAIInsights error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getComprehensiveDashboard = async (req, res) => {
  try {
    const [vitals, symptoms, exercises, sleep, nutrition, moodLogs, goals] = await Promise.all([
      Vital.find({ user: req.userId }).sort({ recordedAt: -1 }).limit(50).lean(),
      Symptom.find({ user: req.userId }).sort({ date: -1 }).limit(30).lean(),
      Exercise.find({ user: req.userId }).sort({ date: -1 }).limit(30).lean(),
      Sleep.find({ user: req.userId }).sort({ date: -1 }).limit(30).lean(),
      Nutrition.find({ user: req.userId }).sort({ date: -1 }).limit(30).lean(),
      MoodLog.find({ user: req.userId }).sort({ date: -1 }).limit(30).lean(),
      HealthGoal.find({ user: req.userId, status: "active" }).lean()
    ]);
    
    const riskAnalysis = calculateHealthRisk(vitals);
    const correlations = detectCorrelations(symptoms, sleep, exercises, moodLogs);
    const insights = generateAIInsights(vitals, symptoms, exercises, sleep, nutrition, moodLogs);
    
    res.json({
      riskAnalysis,
      correlations,
      insights,
      goals,
      summary: {
        totalVitals: vitals.length,
        totalSymptoms: symptoms.length,
        totalExercises: exercises.length,
        totalSleepLogs: sleep.length,
        totalNutritionLogs: nutrition.length,
        totalMoodLogs: moodLogs.length,
        activeGoals: goals.length
      }
    });
  } catch (err) {
    console.error("getComprehensiveDashboard error", err);
    res.status(500).json({ message: "Server error" });
  }
};

