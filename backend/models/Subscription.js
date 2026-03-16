import mongoose from "mongoose";

const billingEntrySchema = new mongoose.Schema({
  invoiceId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  plan: { type: String, enum: ["monthly", "yearly", "lifetime"], required: true },
  status: { type: String, enum: ["paid", "pending", "failed", "refunded"], default: "paid" },
  paymentMethod: { type: String, default: "card" },
  paymentId: { type: String },
  description: { type: String }
});

const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    planType: { type: String, enum: ["free", "monthly", "yearly", "lifetime"], default: "free" },
    status: { type: String, enum: ["active", "inactive", "cancelled", "expired", "trial"], default: "inactive" },
    startDate: { type: Date },
    renewalDate: { type: Date },
    endDate: { type: Date },
    cancelledAt: { type: Date },
    autoRenew: { type: Boolean, default: true },
    paymentProvider: { type: String, enum: ["razorpay", "stripe", "manual"], default: "razorpay" },
    lastPaymentId: { type: String },
    billingHistory: [billingEntrySchema],
    appliedCoupon: { type: String },
    discountPercent: { type: Number, default: 0 }
  },
  { timestamps: true }
);

subscriptionSchema.virtual("isActive").get(function () {
  return this.status === "active" && this.planType !== "free" && (!this.endDate || this.endDate > new Date());
});

subscriptionSchema.virtual("daysLeft").get(function () {
  if (!this.endDate) return 0;
  const diff = this.endDate - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

subscriptionSchema.set("toJSON", { virtuals: true });
subscriptionSchema.set("toObject", { virtuals: true });

export default mongoose.model("Subscription", subscriptionSchema);
