import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    consultationFee: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    platformCommission: {
      type: Number,
      default: 0,
    },
    doctorPayout: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "card", "wallet", "netbanking"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded", "partially_refunded"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded", "partially_refunded"],
      default: "pending",
    },
    paymentId: {
      type: String, // Razorpay or other payment gateway ID
    },
    transactionId: {
      type: String,
      unique: true,
    },
    refundRequest: {
      requested: { type: Boolean, default: false },
      requestedAt: { type: Date },
      reason: { type: String },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
      },
      processedAt: { type: Date },
      refundAmount: { type: Number },
      refundId: { type: String },
    },
    invoice: {
      invoiceNumber: { type: String, unique: true },
      invoiceUrl: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique transaction ID
paymentSchema.statics.generateTransactionId = function () {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TH-${timestamp}-${random}`;
};

// Generate invoice number
paymentSchema.statics.generateInvoiceNumber = function () {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-TH-${timestamp}-${random}`;
};

// Indexes
paymentSchema.index({ appointment: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ doctor: 1 });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ transactionId: 1 });

const TelehealthPayment = mongoose.model("TelehealthPayment", paymentSchema);

export default TelehealthPayment;
