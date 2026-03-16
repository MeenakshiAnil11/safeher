import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    consultationType: {
      type: String,
      enum: ["video", "chat", "audio", "in-person"],
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number, // Duration in seconds
      default: 0,
    },
    status: {
      type: String,
      enum: ["scheduled", "waiting", "ongoing", "completed", "active", "ended", "cancelled"],
      default: "scheduled",
    },
    patientJoined: {
      type: Boolean,
      default: false,
    },
    doctorJoined: {
      type: Boolean,
      default: false,
    },
    meetingLink: {
      type: String,
    },
    meetingId: {
      type: String,
    },
    billing: {
      consultationFee: {
        type: Number,
        default: 0,
      },
      duration: {
        type: Number,
        default: 0,
      },
      charged: {
        type: Boolean,
        default: false,
      },
    },
    notes: {
      type: String,
    },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
    },
    summary: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
SessionSchema.index({ appointment: 1 });
SessionSchema.index({ patient: 1 });
SessionSchema.index({ doctor: 1 });
SessionSchema.index({ status: 1 });

// Method to calculate duration
SessionSchema.methods.calculateDuration = function () {
  if (this.endTime && this.startTime) {
    this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  }
  return this.duration;
};

export default mongoose.model("Session", SessionSchema);
