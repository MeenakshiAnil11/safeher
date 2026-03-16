import mongoose from "mongoose";

const generateAppointmentNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `APT-${timestamp}-${random}`;
};

const appointmentSchema = new mongoose.Schema(
  {
    appointmentNumber: {
      type: String,
      unique: true,
      required: true,
      default: generateAppointmentNumber,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      default: 30, // minutes
    },
    status: {
      type: String,
      // Keep legacy statuses for backward compatibility with old records.
      enum: [
        "scheduled",
        "waiting",
        "ongoing",
        "active",
        "ended",
        "cancelled",
        "pending",
        "confirmed",
        "completed",
        "no-show",
        "disputed",
      ],
      default: "scheduled",
    },
    consultationType: {
      type: String,
      enum: ["video", "audio", "chat", "in-person"],
      default: "video",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    meetingLink: {
      type: String,
    },
    meetingId: {
      type: String,
    },
    symptoms: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TelehealthPayment",
    },
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: String,
      enum: ["user", "doctor", "admin"],
    },
    cancellationReason: {
      type: String,
    },
    disputeReason: {
      type: String,
    },
    disputeStatus: {
      type: String,
      enum: ["none", "pending", "resolved", "rejected"],
      default: "none",
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    completedAt: {
      type: Date,
    },
    videoSession: {
      roomId: { type: String, trim: true },
      meetingLink: { type: String, trim: true },
      approvalStatus: {
        type: String,
        enum: ["none", "requested", "approved", "declined"],
        default: "none",
      },
      requestedAt: { type: Date },
      approvedAt: { type: Date },
      declinedAt: { type: Date },
      requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      declineReason: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique appointment number
appointmentSchema.statics.generateAppointmentNumber = function () {
  return generateAppointmentNumber();
};

// Indexes
appointmentSchema.index({ user: 1, scheduledAt: -1 });
appointmentSchema.index({ doctor: 1, scheduledAt: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentNumber: 1 });

appointmentSchema.virtual("appointmentId").get(function getAppointmentId() {
  return this.appointmentNumber;
});

appointmentSchema.virtual("patientId").get(function getPatientId() {
  return this.user;
});

appointmentSchema.virtual("doctorId").get(function getDoctorId() {
  return this.doctor;
});

appointmentSchema.virtual("date").get(function getDate() {
  return this.scheduledAt;
});

appointmentSchema.virtual("time").get(function getTime() {
  if (!this.scheduledAt) return null;
  return new Date(this.scheduledAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
