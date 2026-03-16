// backend/models/PregnancyLog.js
import mongoose from "mongoose";

const PregnancyLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  
  // Pregnancy Week
  week: { type: Number, required: true },
  trimester: { 
    type: String, 
    enum: ["first", "second", "third"],
    required: true
  },
  
  // Weight Tracking
  weight: { type: Number }, // kg (legacy)
  weightKg: { type: Number }, // kg (new)
  weightGain: { type: Number }, // kg from pre-pregnancy
  
  // Symptoms
  symptoms: [{
    name: String,
    intensity: { type: String, enum: ["mild", "moderate", "severe"], default: "mild" },
    duration: String // e.g., "2 hours", "all day"
  }],
  
  // Common Pregnancy Symptoms
  nausea: { type: Boolean, default: false },
  vomiting: { type: Boolean, default: false },
  fatigue: { type: Boolean, default: false },
  moodSwings: { type: Boolean, default: false },
  foodCravings: { type: Boolean, default: false },
  foodAversions: { type: Boolean, default: false },
  breastTenderness: { type: Boolean, default: false },
  frequentUrination: { type: Boolean, default: false },
  backPain: { type: Boolean, default: false },
  heartburn: { type: Boolean, default: false },
  constipation: { type: Boolean, default: false },
  swelling: { type: Boolean, default: false },
  insomnia: { type: Boolean, default: false },
  
  // Fetal Movement (for later weeks)
  fetalMovement: { type: Boolean, default: false },
  kickCount: { type: Number, default: 0 },
  
  // Blood Pressure
  systolic: { type: Number },
  diastolic: { type: Number },
  bloodPressure: {
    systolic: { type: Number },
    diastolic: { type: Number }
  },
  bloodSugar: { type: Number }, // mg/dL
  
  // Mood and Energy
  mood: { 
    type: String, 
    enum: ["happy", "anxious", "excited", "worried", "calm", "irritable", "emotional", "neutral"],
    default: "neutral"
  },
  energy: { type: Number, min: 1, max: 10, default: 5 },
  stress: { type: Number, min: 1, max: 10, default: 5 },
  
  // Sleep
  sleepHours: { type: Number, min: 0, max: 24 },
  sleepQuality: { 
    type: String, 
    enum: ["poor", "fair", "good", "excellent"],
    default: "good"
  },
  
  // Nutrition
  mealsEaten: { type: Number, default: 3 },
  waterIntake: { type: Number }, // liters
  supplements: [String],
  
  // Exercise
  exercise: { type: Boolean, default: false },
  exerciseType: String,
  exerciseDuration: Number, // minutes
  
  // Medical Appointments
  doctorVisit: { type: Boolean, default: false },
  ultrasound: { type: Boolean, default: false },
  bloodTest: { type: Boolean, default: false },
  
  // Medications
  medications: [String],
  
  // Notes
  notes: { type: String, trim: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt on save
PregnancyLogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("PregnancyLog", PregnancyLogSchema);
