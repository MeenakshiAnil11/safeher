import mongoose from "mongoose";

const NutritionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  meal: { type: String, required: true, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] },
  calories: { type: Number, required: true },
  protein: { type: Number }, // grams
  carbs: { type: Number }, // grams
  fat: { type: Number }, // grams
  hydration: { type: String }, // e.g., "2 liters"
  supplements: { type: String },
  notes: { type: String },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt on save
NutritionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Nutrition", NutritionSchema);
