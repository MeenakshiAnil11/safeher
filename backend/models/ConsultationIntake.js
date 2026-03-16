import mongoose from "mongoose";

const consultationIntakeSchema = new mongoose.Schema(
  {
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
      index: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    symptoms: {
      type: String,
      trim: true,
      required: true,
    },
    duration: {
      type: String,
      trim: true,
    },
    currentMedications: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    consentToShareHealthData: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

consultationIntakeSchema.index({ appointmentId: 1, patientId: 1 }, { unique: true });

export default mongoose.model("ConsultationIntake", consultationIntakeSchema);
