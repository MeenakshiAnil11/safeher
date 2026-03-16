import mongoose from "mongoose";

const doctorAvailabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      trim: true,
    },
    endTime: {
      type: String,
      required: true,
      trim: true,
    },
    slotDuration: {
      type: Number,
      default: 30,
      min: 10,
    },
  },
  { timestamps: true }
);

doctorAvailabilitySchema.index({ doctorId: 1, day: 1 }, { unique: true });

export default mongoose.model("DoctorAvailability", doctorAvailabilitySchema);
