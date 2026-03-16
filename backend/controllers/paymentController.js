// backend/controllers/paymentController.js
import User from "../models/User.js";
import Order from "../models/Order.js";
import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay
let razorpay = null;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const HAS_RAZORPAY_KEYS = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);
export const USE_RAZORPAY_MOCK =
  String(process.env.RAZORPAY_MOCK ?? (!HAS_RAZORPAY_KEYS)).toLowerCase() === "true";

if (!USE_RAZORPAY_MOCK && HAS_RAZORPAY_KEYS) {
  try {
    razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
    console.log("✅ Razorpay initialized (gateway mode)");
    console.log("   Key ID:", RAZORPAY_KEY_ID);
  } catch (error) {
    console.log("❌ Razorpay initialization failed:", error.message);
    console.log("⚠️  Falling back to mock mode");
    razorpay = null;
  }
} else {
  console.log("ℹ️  Using Razorpay mock/test mode only");
  console.log("   Payment flow will be simulated without real Razorpay API calls");
}

/**
 * Create a Razorpay order for e-commerce order payment
 * POST /api/payment/create-order
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    // Check if this is for an order payment (has amount) or subscription (has plan)
    const { amount, currency = "INR", receipt, plan } = req.body;

    // If amount is provided, it's an order payment
    if (amount) {
      return await createOrderPayment(req, res);
    }

    // Otherwise, it's a subscription payment (existing logic)
    return await createSubscriptionOrder(req, res);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create payment order" });
  }
};

/**
 * Validate and initiate UPI payment (mock initiation for checkout flow)
 * POST /api/payment/upi/initiate
 */
export const initiateUpiPayment = async (req, res) => {
  try {
    const { upiId, amount, currency = "INR", receipt } = req.body || {};
    const normalizedUpiId = String(upiId || "").trim().toLowerCase();

    if (!normalizedUpiId) {
      return res.status(400).json({ success: false, message: "UPI ID is required." });
    }
    if (!/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(normalizedUpiId)) {
      return res.status(400).json({ success: false, message: "Please enter a valid UPI ID." });
    }
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount for UPI payment." });
    }

    return res.json({
      success: true,
      message: "UPI ID verified and payment initiated.",
      paymentId: `upi_${Date.now()}`,
      upiId: normalizedUpiId,
      amount: Math.round(Number(amount)),
      currency,
      receipt: receipt || `upi_receipt_${Date.now()}`,
      status: "initiated",
    });
  } catch (error) {
    console.error("UPI initiation failed:", error);
    return res.status(500).json({ success: false, message: "Failed to initiate UPI payment." });
  }
};

/**
 * Create Razorpay order for e-commerce order payment
 */
const createOrderPayment = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const normalizedAmount = Math.round(amount); // Razorpay expects paise for INR
    const payload = {
      amount: normalizedAmount,
      currency,
      receipt: receipt || `order_${Date.now()}`,
    };

    // Keep explicit mock mode support if it is intentionally enabled.
    if (USE_RAZORPAY_MOCK || !razorpay) {
      if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        return res.status(500).json({
          success: false,
          message: "Razorpay test keys are missing in environment variables.",
        });
      }
      return res.status(503).json({
        success: false,
        message:
          "Razorpay gateway is in mock mode. Disable RAZORPAY_MOCK to use test dashboard transactions.",
      });
    }

    let order;
    try {
      order = await razorpay.orders.create(payload);
    } catch (error) {
      console.error("Razorpay order creation failed:", error);
      return res.status(502).json({
        success: false,
        message:
          error?.error?.description ||
          error?.message ||
          "Failed to create Razorpay test order.",
      });
    }

    res.json({
      success: true,
      order,
      keyId: RAZORPAY_KEY_ID,
      isMock: false,
      note: "test_mode",
    });
  } catch (error) {
    console.error("Error creating order payment:", error);
    res.status(500).json({ error: "Failed to create payment order" });
  }
};

/**
 * Create Razorpay order for subscription (existing logic)
 */
const createSubscriptionOrder = async (req, res) => {
  try {
    console.log("🔐 createSubscriptionOrder called");
    const { plan } = req.body;
    const user = req.user;

    if (!plan) {
      return res.status(400).json({ error: "Plan is required" });
    }

    const plans = {
      basic: { amount: 299, currency: "INR", name: "Basic Plan" },
      premium: { amount: 599, currency: "INR", name: "Premium Plan" },
      enterprise: { amount: 999, currency: "INR", name: "Enterprise Plan" },
    };

    const selectedPlan = plans[plan];
    if (!selectedPlan) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    let order = null;
    let isMock = false;
    
    if (razorpay) {
      try {
        console.log("📞 Creating real Razorpay order...");
        const userId = user?._id || "test-user";
        order = await razorpay.orders.create({
          amount: selectedPlan.amount * 100, // in paise
          currency: selectedPlan.currency,
          receipt: `order_${userId}_${Date.now()}`,
          notes: { plan, userId: userId.toString() }
        });
        console.log("✅ Real Razorpay order created:", order.id);
        isMock = false;
      } catch (error) {
        console.error("❌ Razorpay order creation failed:", error.error || error.message);
        console.log("⚠️  Falling back to mock mode");
        // Fallback to mock order
        const mockUserId = user?._id || "test-user";
        order = {
          id: `order_${Date.now()}`,
          amount: selectedPlan.amount * 100,
          currency: selectedPlan.currency,
          receipt: `receipt_${mockUserId}_${Date.now()}`,
          status: "created"
        };
        isMock = true;
      }
    } else {
      // Mock order for testing
        const testUserId = user?._id || "test-user";
        order = {
          id: `order_${Date.now()}`,
          amount: selectedPlan.amount * 100,
          currency: selectedPlan.currency,
          receipt: `receipt_${testUserId}_${Date.now()}`,
          status: "created"
        };
      isMock = true;
      console.log("✅ Mock order created:", order.id);
    }
    
    res.json({ 
      success: true, 
      order,
      keyId: RAZORPAY_KEY_ID,
      isMock: isMock,
      note: isMock ? "mock_mode" : "real_razorpay"
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create payment order" });
  }
};

/**
 * Verify Razorpay payment and update user subscription
 * POST /api/payment/verify-payment
 */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      paymentId,
      orderId,
      signature,
      plan,
      orderType,
    } = req.body;

    // Support both naming conventions
    const payment_id = razorpay_payment_id || paymentId;
    const order_id = razorpay_order_id || orderId;
    const payment_signature = razorpay_signature || signature;

    if (!payment_id || !order_id || !payment_signature) {
      return res.status(400).json({ error: "Missing payment verification data" });
    }

    // Verify signature
    const text = `${order_id}|${payment_id}`;
    const generated_signature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex");

    if (generated_signature !== payment_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // If it's an order payment (not subscription), just verify and return
    if (orderType === "order" || !plan) {
      return res.json({
        success: true,
        message: "Payment verified successfully",
        paymentId: payment_id,
        orderId: order_id,
      });
    }

    // Subscription payment logic (existing)
    if (!plan) {
      return res.status(400).json({ error: "Plan is required" });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Update user subscription
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        subscription: {
          plan,
          status: "active",
          startDate: new Date(),
          paymentId: payment_id,
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Payment verified and subscription activated",
      user: {
        id: updatedUser._id,
        subscription: updatedUser.subscription,
      },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
};

// ========== ADMIN ONLY ROUTES ==========

// GET /api/payments/admin/all - Get all payment transactions (Admin only)
export const getAllPayments = async (req, res) => {
  try {
    const { status, paymentMethod, orderNumber, paymentId, page = 1, limit = 50 } = req.query;

    const query = {};

    // Filter by payment status
    if (status && status !== "all") {
      query.paymentStatus = status;
    }

    // Filter by payment method
    if (paymentMethod && paymentMethod !== "all") {
      query.paymentMethod = paymentMethod;
    }

    // Search by order number
    if (orderNumber) {
      query.orderNumber = new RegExp(orderNumber, "i");
    }

    // Search by payment ID
    if (paymentId) {
      query.paymentId = new RegExp(paymentId, "i");
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .populate("user", "name email phone")
      .select("orderNumber user paymentMethod paymentStatus paymentId total subtotal shipping discount createdAt updatedAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Transform orders to payment transactions
    const payments = orders.map((order) => ({
      _id: order._id,
      paymentId: order.paymentId,
      orderId: order.orderNumber,
      orderNumber: order.orderNumber,
      userId: order.user?._id,
      userName: order.user?.name,
      userEmail: order.user?.email,
      amount: order.total,
      subtotal: order.subtotal,
      shipping: order.shipping,
      discount: order.discount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    const total = await Order.countDocuments(query);

    res.json({
      payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("getAllPayments error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/payments/admin/stats - Get payment statistics (Admin only)
export const getPaymentStats = async (req, res) => {
  try {
    const orders = await Order.find()
      .select("paymentMethod paymentStatus total createdAt")
      .lean();

    let totalRevenue = 0;
    let successfulPayments = 0;
    let failedPayments = 0;
    let pendingPayments = 0;
    let refundedPayments = 0;
    const methodStats = {
      razorpay: { total: 0, success: 0, failed: 0 },
      cod: { total: 0, success: 0, failed: 0 },
      wallet: { total: 0, success: 0, failed: 0 },
    };

    orders.forEach((order) => {
      // Count by status
      if (order.paymentStatus === "paid") {
        successfulPayments++;
        totalRevenue += order.total;
      } else if (order.paymentStatus === "failed") {
        failedPayments++;
      } else if (order.paymentStatus === "pending") {
        pendingPayments++;
      } else if (order.paymentStatus === "refunded") {
        refundedPayments++;
      }

      // Count by method
      if (methodStats[order.paymentMethod]) {
        methodStats[order.paymentMethod].total++;
        if (order.paymentStatus === "paid") {
          methodStats[order.paymentMethod].success++;
        } else if (order.paymentStatus === "failed") {
          methodStats[order.paymentMethod].failed++;
        }
      }
    });

    res.json({
      stats: {
        totalTransactions: orders.length,
        totalRevenue: totalRevenue.toFixed(2),
        successfulPayments,
        failedPayments,
        pendingPayments,
        refundedPayments,
        successRate: orders.length > 0
          ? ((successfulPayments / orders.length) * 100).toFixed(2)
          : "0.00",
      },
      methodStats,
    });
  } catch (error) {
    console.error("getPaymentStats error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/payments/admin/failed - Get all failed payments (Admin only)
export const getFailedPayments = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const orders = await Order.find({ paymentStatus: "failed" })
      .populate("user", "name email phone")
      .select("orderNumber user paymentMethod paymentId total createdAt")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const payments = orders.map((order) => ({
      _id: order._id,
      paymentId: order.paymentId,
      orderId: order.orderNumber,
      orderNumber: order.orderNumber,
      userId: order.user?._id,
      userName: order.user?.name,
      userEmail: order.user?.email,
      amount: order.total,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
    }));

    const total = await Order.countDocuments({ paymentStatus: "failed" });

    res.json({
      payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("getFailedPayments error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/payments/admin/:orderId/mark-resolved - Mark payment as manually resolved (Admin only)
export const markPaymentResolved = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus, notes } = req.body;

    if (!paymentStatus || !["paid", "refunded"].includes(paymentStatus)) {
      return res.status(400).json({
        message: "Payment status must be 'paid' or 'refunded'",
      });
    }

    const order = await Order.findOne({ orderNumber: orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.paymentStatus = paymentStatus;
    if (notes) {
      order.notes = (order.notes || "") + `\n[Manual Resolution: ${new Date().toISOString()}] ${notes}`;
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .lean();

    res.json({
      message: "Payment marked as resolved",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("markPaymentResolved error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/payments/admin/razorpay/:paymentId - Get Razorpay payment details (Admin only)
export const getRazorpayPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!razorpay) {
      return res.status(503).json({
        message: "Razorpay not configured. Using mock mode.",
        mock: true,
      });
    }

    try {
      const payment = await razorpay.payments.fetch(paymentId);
      res.json({
        success: true,
        payment,
        mock: false,
      });
    } catch (error) {
      console.error("Error fetching Razorpay payment:", error);
      res.status(404).json({
        message: "Payment not found in Razorpay",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("getRazorpayPaymentDetails error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
