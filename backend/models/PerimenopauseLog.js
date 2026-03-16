// backend/models/PerimenopauseLog.js
import mongoose from "mongoose";

const PerimenopauseLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  
  // Menstrual Cycle Changes
  cycleLength: { type: Number }, // days
  periodLength: { type: Number }, // days
  periodFlow: { 
    type: String, 
    enum: ["light", "normal", "heavy", "very-heavy", "spotting", "none"],
    default: "normal"
  },
  cycleIrregularity: { 
    type: String, 
    enum: ["regular", "slightly-irregular", "very-irregular", "missed"],
    default: "regular"
  },
  
  // Perimenopause Symptoms
  hotFlashes: { type: Boolean, default: false },
  nightSweats: { type: Boolean, default: false },
  moodSwings: { type: Boolean, default: false },
  irritability: { type: Boolean, default: false },
  anxiety: { type: Boolean, default: false },
  depression: { type: Boolean, default: false },
  fatigue: { type: Boolean, default: false },
  sleepProblems: { type: Boolean, default: false },
  memoryIssues: { type: Boolean, default: false },
  concentrationProblems: { type: Boolean, default: false },
  weightGain: { type: Boolean, default: false },
  jointPain: { type: Boolean, default: false },
  headaches: { type: Boolean, default: false },
  breastTenderness: { type: Boolean, default: false },
  vaginalDryness: { type: Boolean, default: false },
  decreasedLibido: { type: Boolean, default: false },
  urinaryProblems: { type: Boolean, default: false },
  
  // Symptom Intensity
  symptomIntensity: { 
    type: String, 
    enum: ["mild", "moderate", "severe"],
    default: "mild"
  },
  
  // Hot Flash Details
  hotFlashCount: { type: Number, default: 0 },
  hotFlashDuration: { type: Number }, // minutes
  
  // Sleep Quality
  sleepHours: { type: Number, min: 0, max: 24 },
  sleepQuality: { 
    type: String, 
    enum: ["poor", "fair", "good", "excellent"],
    default: "good"
  },
  sleepInterruptions: { type: Number, default: 0 },
  
  // Mood and Energy
  mood: { 
    type: String, 
    enum: ["happy", "sad", "anxious", "irritable", "calm", "energetic", "tired", "neutral", "emotional"],
    default: "neutral"
  },
  energy: { type: Number, min: 1, max: 10, default: 5 },
  stress: { type: Number, min: 1, max: 10, default: 5 },
  
  // Weight and Body Changes
  weight: { type: Number }, // kg
  weightChange: { type: Number }, // kg from baseline
  
  // Exercise and Activity
  exercise: { type: Boolean, default: false },
  exerciseType: String,
  exerciseDuration: Number, // minutes
  activityLevel: { 
    type: String, 
    enum: ["sedentary", "light", "moderate", "active", "very-active"],
    default: "moderate"
  },
  
  // Nutrition
  mealsEaten: { type: Number, default: 3 },
  waterIntake: { type: Number }, // liters
  supplements: [String],
  caffeineIntake: { type: Number }, // cups
  
  // Medications and Treatments
  medications: [String],
  hormoneTherapy: { type: Boolean, default: false },
  alternativeTreatments: [String],
  
  // Medical Appointments
  doctorVisit: { type: Boolean, default: false },
  bloodTest: { type: Boolean, default: false },
  
  // Notes
  notes: { type: String, trim: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt on save
PerimenopauseLogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("PerimenopauseLog", PerimenopauseLogSchema);
