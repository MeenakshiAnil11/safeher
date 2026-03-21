import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import crypto from "crypto";
import Razorpay from "razorpay";

const PLANS = {
  free: { price: 0, name: "Free", duration: null },
  monthly: { price: 299, name: "Monthly Premium", duration: 30 },
  yearly: { price: 1999, name: "Yearly Premium", duration: 365 },
  lifetime: { price: 4999, name: "Lifetime Premium", duration: null }
};

const generateInvoiceId = () => `INV-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const HAS_RAZORPAY_KEYS = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);

let razorpay = null;
if (HAS_RAZORPAY_KEYS) {
  try {
    razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
  } catch (error) {
    console.error("Razorpay init failed for subscription module:", error.message);
  }
}

const activateSubscription = async ({
  userId,
  planType,
  paymentId,
  paymentMethod = "card",
  coupon,
}) => {
  const plan = PLANS[planType];
  let discount = 0;
  if (coupon === "SAFEHER50") discount = 50;
  else if (coupon === "WELCOME20") discount = 20;

  const finalAmount = Math.round(plan.price * (1 - discount / 100));
  const now = new Date();
  const endDate = plan.duration ? new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000) : null;

  let sub = await Subscription.findOne({ userId });
  if (!sub) sub = new Subscription({ userId });

  sub.planType = planType;
  sub.status = "active";
  sub.startDate = now;
  sub.renewalDate = endDate;
  sub.endDate = endDate;
  sub.autoRenew = planType !== "lifetime";
  sub.lastPaymentId = paymentId || generateInvoiceId();
  sub.appliedCoupon = coupon || null;
  sub.discountPercent = discount;
  sub.paymentProvider = "razorpay";

  sub.billingHistory.push({
    invoiceId: generateInvoiceId(),
    date: now,
    amount: finalAmount,
    plan: planType,
    status: "paid",
    paymentMethod,
    paymentId: paymentId || "sim_" + crypto.randomBytes(6).toString("hex"),
    description: `${plan.name} subscription${discount ? ` (${discount}% off)` : ""}`,
  });

  await sub.save();
  await User.findByIdAndUpdate(userId, {
    "subscription.isSubscribed": true,
    "subscription.plan": planType === "monthly" || planType === "yearly" ? "premium" : planType,
    "subscription.startDate": now,
    "subscription.endDate": endDate,
    "subscription.paymentId": sub.lastPaymentId,
    "subscription.paymentProvider": "razorpay",
  });

  return sub;
};

export const getSubscriptionStatus = async (req, res) => {
  try {
    let sub = await Subscription.findOne({ userId: req.userId });
    if (!sub) {
      sub = await Subscription.create({ userId: req.userId, planType: "free", status: "inactive" });
    }
    if (sub.status === "active" && sub.endDate && sub.endDate < new Date()) {
      sub.status = "expired";
      await sub.save();
      await User.findByIdAndUpdate(req.userId, { "subscription.isSubscribed": false, "subscription.plan": "free" });
    }
    res.json({ success: true, subscription: sub, plans: PLANS });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const subscribe = async (req, res) => {
  try {
    const { planType, paymentId, paymentMethod = "card", coupon } = req.body;
    if (!PLANS[planType] || planType === "free") {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    const sub = await activateSubscription({
      userId: req.userId,
      planType,
      paymentId,
      paymentMethod,
      coupon,
    });

    res.json({ success: true, message: "Subscription activated!", subscription: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ userId: req.userId });
    if (!sub || sub.status !== "active") {
      return res.status(400).json({ success: false, message: "No active subscription to cancel" });
    }
    sub.status = "cancelled";
    sub.cancelledAt = new Date();
    sub.autoRenew = false;
    await sub.save();
    await User.findByIdAndUpdate(req.userId, { "subscription.isSubscribed": false, "subscription.plan": "free" });
    res.json({ success: true, message: "Subscription cancelled", subscription: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const upgradePlan = async (req, res) => {
  try {
    const { planType, paymentId } = req.body;
    if (!PLANS[planType] || planType === "free") {
      return res.status(400).json({ success: false, message: "Invalid plan for upgrade" });
    }
    const sub = await Subscription.findOne({ userId: req.userId });
    if (!sub) return res.status(404).json({ success: false, message: "No subscription found" });

    const plan = PLANS[planType];
    const now = new Date();
    const endDate = plan.duration ? new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000) : null;

    sub.planType = planType;
    sub.status = "active";
    sub.startDate = now;
    sub.renewalDate = endDate;
    sub.endDate = endDate;
    sub.lastPaymentId = paymentId || generateInvoiceId();

    sub.billingHistory.push({
      invoiceId: generateInvoiceId(),
      date: now,
      amount: plan.price,
      plan: planType,
      status: "paid",
      paymentMethod: "card",
      paymentId: paymentId || "sim_" + crypto.randomBytes(6).toString("hex"),
      description: `Upgrade to ${plan.name}`
    });

    await sub.save();
    await User.findByIdAndUpdate(req.userId, {
      "subscription.isSubscribed": true,
      "subscription.plan": "premium",
      "subscription.startDate": now,
      "subscription.endDate": endDate
    });

    res.json({ success: true, message: `Upgraded to ${plan.name}`, subscription: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBillingHistory = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ userId: req.userId });
    if (!sub) return res.json({ success: true, billingHistory: [] });
    res.json({ success: true, billingHistory: sub.billingHistory.sort((a, b) => b.date - a.date) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const applyCoupon = async (req, res) => {
  try {
    const { coupon } = req.body;
    const coupons = { SAFEHER50: 50, WELCOME20: 20, PREMIUM10: 10 };
    const discount = coupons[coupon?.toUpperCase()];
    if (!discount) return res.status(400).json({ success: false, message: "Invalid coupon code" });
    res.json({ success: true, discount, coupon: coupon.toUpperCase() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createSubscriptionOrder = async (req, res) => {
  try {
    const { planType, coupon } = req.body;
    if (!PLANS[planType] || planType === "free") {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }
    if (!razorpay || !HAS_RAZORPAY_KEYS) {
      return res.status(500).json({
        success: false,
        message: "Razorpay test keys are missing in backend environment.",
      });
    }

    let discount = 0;
    if (coupon === "SAFEHER50") discount = 50;
    else if (coupon === "WELCOME20") discount = 20;

    const amount = Math.round(PLANS[planType].price * (1 - discount / 100));
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `sub_${req.userId}_${Date.now()}`,
      notes: {
        userId: String(req.userId),
        planType,
      },
    });

    return res.json({
      success: true,
      order,
      keyId: RAZORPAY_KEY_ID,
      amount,
    });
  } catch (err) {
    console.error("createSubscriptionOrder error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const verifySubscriptionPayment = async (req, res) => {
  try {
    const {
      planType,
      coupon,
      paymentMethod = "card",
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    if (!PLANS[planType] || planType === "free") {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    if (!razorpay_signature || !razorpay_payment_id || !razorpay_order_id) {
      return res.status(400).json({ success: false, message: "Missing Razorpay payment details" });
    }

    if (!HAS_RAZORPAY_KEYS) {
      return res.status(500).json({ success: false, message: "Razorpay keys are not configured." });
    }

    const signaturePayload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(signaturePayload)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const sub = await activateSubscription({
      userId: req.userId,
      planType,
      paymentId: razorpay_payment_id,
      paymentMethod,
      coupon,
    });

    return res.json({ success: true, message: "Subscription activated!", subscription: sub });
  } catch (err) {
    console.error("verifySubscriptionPayment error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
