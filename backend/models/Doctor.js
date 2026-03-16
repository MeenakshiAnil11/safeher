import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    qualifications: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        year: { type: Number },
      },
    ],
    languages: [
      {
        type: String,
        trim: true,
      },
    ],
    consultationTypes: [
      {
        type: String,
        enum: ["video", "chat", "in-person"],
      },
    ],
    consultationFee: {
      type: Number,
      required: true,
      min: 0,
    },
    bio: {
      type: String,
      trim: true,
    },
    institution: {
      type: String,
      trim: true,
    },
    experience: {
      type: Number,
      min: 0,
    },
    location: {
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, default: "India" },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "suspended", "rejected"],
      default: "pending",
    },
    verificationDocuments: {
      license: { type: String }, // File path or URL
      idProof: { type: String },
      qualification: { type: String },
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    availability: {
      timeSlots: [
        {
          day: {
            type: String,
            enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          },
          startTime: { type: String }, // Format: "09:00"
          endTime: { type: String }, // Format: "17:00"
        },
      ],
    },
    availabilitySlots: [
      {
        type: String,
        trim: true,
      },
    ],
    rejectionReason: {
      type: String,
    },
    suspendedReason: {
      type: String,
    },
    suspendedAt: {
      type: Date,
    },
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
doctorSchema.index({ user: 1 });
doctorSchema.index({ status: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ "location.city": 1 });

doctorSchema.pre("save", function syncTelemedicineDefaults(next) {
  if (!Array.isArray(this.consultationTypes) || this.consultationTypes.length === 0) {
    this.consultationTypes = ["video", "chat", "in-person"];
  }
  next();
});

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
