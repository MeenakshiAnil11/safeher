import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
});

const shippingAddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: "India" },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod", "upi", "wallet"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentId: {
      type: String, // Razorpay payment ID
    },
    upiId: {
      type: String,
      trim: true,
      lowercase: true,
    },
    orderStatus: {
      type: String,
      enum: ["placed", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"],
      default: "placed",
    },
    subtotal: {
      type: Number,
      required: true,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    coupon: {
      code: String,
      discount: Number,
    },
    trackingNumber: {
      type: String,
    },
    returnRequest: {
      status: {
        type: String,
        enum: ["none", "requested", "approved", "rejected", "completed"],
        default: "none",
      },
      reason: { type: String },
      requestedAt: { type: Date },
      decidedAt: { type: Date },
      adminNote: { type: String },
      refundStatus: {
        type: String,
        enum: ["none", "pending", "processed", "rejected"],
        default: "none",
      },
    },
    notes: {
      type: String,
    },
    cancelledAt: {
      type: Date,
    },
    cancelledReason: {
      type: String,
    },
    refundStatus: {
      type: String,
      enum: ["None", "Requested", "Processing", "Completed", "Rejected"],
      default: "None",
    },
    refundId: {
      type: String,
    },
    refundRequestedAt: {
      type: Date,
    },
    refundProcessedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique order number
orderSchema.statics.generateOrderNumber = function () {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderStatus: 1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
