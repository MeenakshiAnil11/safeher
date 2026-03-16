import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  dosage: { type: String, required: true, trim: true },
  frequency: { type: String, required: true, trim: true },
  duration: { type: String, required: true, trim: true },
  instructions: { type: String, trim: true },
});

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    diagnosis: {
      type: String,
      trim: true,
    },
    medications: [medicationSchema],
    instructions: {
      type: String,
      trim: true,
    },
    followUpDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
prescriptionSchema.index({ appointment: 1 });
prescriptionSchema.index({ user: 1, createdAt: -1 });
prescriptionSchema.index({ doctor: 1 });

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;
