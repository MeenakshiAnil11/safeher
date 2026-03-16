// backend/models/FertilityLog.js
import mongoose from "mongoose";

const FertilityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  
  // Basal Body Temperature
  bbt: { type: Number }, // Celsius
  
  // Cervical Mucus
  cervicalMucus: { 
    type: String, 
    enum: ["dry", "sticky", "creamy", "watery", "egg-white", "none"],
    default: "none"
  },
  
  // Cervical Position
  cervicalPosition: { 
    type: String, 
    enum: ["low", "medium", "high", "soft", "firm", "open", "closed"],
    default: "medium"
  },
  
  // Ovulation Tests
  ovulationTest: { 
    type: String, 
    enum: ["negative", "positive", "peak", "not-tested"],
    default: "not-tested"
  },
  
  // Intercourse
  intercourse: { type: Boolean, default: false },
  intercourseTime: { type: String }, // Morning, Afternoon, Evening, Night
  
  // Symptoms
  symptoms: [{
    name: String,
    intensity: { type: String, enum: ["mild", "moderate", "severe"], default: "mild" }
  }],
  
  // Mood and Energy
  mood: { 
    type: String, 
    enum: ["happy", "sad", "anxious", "irritable", "calm", "energetic", "tired", "neutral"],
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
  
  // Medications and Supplements
  medications: [String],
  supplements: [String],
  
  // Notes
  notes: { type: String, trim: true },
  
  // Cycle Information
  cycleDay: { type: Number },
  phase: { 
    type: String, 
    enum: ["menstrual", "follicular", "ovulatory", "luteal"],
    default: "follicular"
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt on save
FertilityLogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("FertilityLog", FertilityLogSchema);
