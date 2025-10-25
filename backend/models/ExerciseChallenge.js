import mongoose from "mongoose";

const exerciseChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  targetParticipants: {
    type: Number,
    required: true,
    min: 1,
  },
  reward: {
    type: String,
    trim: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Virtual for current participant count
exerciseChallengeSchema.virtual('currentParticipants').get(function() {
  return this.participants.length;
});

// Virtual for completion rate
exerciseChallengeSchema.virtual('completionRate').get(function() {
  if (this.participants.length === 0) return 0;
  const completed = this.participants.filter(p => p.completedAt).length;
  return (completed / this.participants.length) * 100;
});

export default mongoose.model("ExerciseChallenge", exerciseChallengeSchema);
