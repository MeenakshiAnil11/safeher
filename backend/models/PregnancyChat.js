// backend/models/PregnancyChat.js
import mongoose from "mongoose";

const PregnancyChatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: [{
    type: { type: String, enum: ["user", "ai"], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isError: { type: Boolean, default: false },
    isWelcome: { type: Boolean, default: false }
  }],
  sessionId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

PregnancyChatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("PregnancyChat", PregnancyChatSchema);
