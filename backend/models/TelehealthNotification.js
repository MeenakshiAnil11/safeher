import mongoose from "mongoose";

const telehealthNotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "appointment_booked",
        "appointment_confirmed",
        "appointment_cancelled",
        "appointment_rescheduled",
        "appointment_reminder",
        "consultation_started",
        "consultation_ended",
        "video_consultation_requested",
        "video_consultation_approved",
        "video_consultation_declined",
        "prescription_created",
        "prescription_updated",
        "payment_received",
        "payment_refunded",
        "earnings_updated",
        "new_message",
        "doctor_accepted",
        "doctor_rejected",
        "health_record_shared",
        "system",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedAppointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    relatedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    relatedPatient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    relatedPrescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
    },
    relatedPayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TelehealthPayment",
    },
    actionUrl: String,
    isRead: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true }
);

telehealthNotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("TelehealthNotification", telehealthNotificationSchema);
