import mongoose from "mongoose";

const userExerciseLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  exercise: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise", required: true },
  date: { type: Date, required: true },
  phase: { type: String },
  category: { type: String },
  completionStatus: { type: String, enum: ["completed", "skipped", "incomplete"], default: "completed" },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const UserExerciseLog = mongoose.model("UserExerciseLog", userExerciseLogSchema);

export default UserExerciseLog;
