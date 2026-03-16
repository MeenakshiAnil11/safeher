import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import SubscriptionSidebar from "../components/SubscriptionSidebar";

import api from "../services/api";
import "./subscription.css";

const CHAT_BOT_RESPONSES = [
  { keywords: ["cancel", "cancellation", "cancel subscription"], answer: "You can cancel your subscription anytime from the 'My Subscription' page. Click the 'Cancel Subscription' button and follow the prompts. You'll retain access to premium features until the end of your current billing period." },
  { keywords: ["upgrade", "change plan", "switch plan", "downgrade"], answer: "You can upgrade or downgrade your plan from the 'My Subscription' page. Click 'Change Plan' to see available options. Upgrades take effect immediately, while downgrades apply at the end of your current billing cycle." },
  { keywords: ["payment", "pay", "card", "payment method", "update card"], answer: "You can manage your payment methods from the 'Billing History' page. We accept all major credit/debit cards, UPI, and Razorpay. To update your card, go to Billing History → Saved Payment Methods." },
  { keywords: ["refund", "money back"], answer: "We offer a 7-day money-back guarantee for new subscriptions. If you're not satisfied within the first 7 days, contact us for a full refund. After that, refunds are handled on a case-by-case basis." },
  { keywords: ["coupon", "promo", "discount", "offer", "code"], answer: "You can apply promo codes during checkout. Current active codes include SAFEHER30 (30% off annual plans) and ANNUAL2026 (2 months free with yearly plan). Visit the 'Offers & Discounts' page for all available codes." },
  { keywords: ["price", "cost", "how much", "pricing", "plan"], answer: "We offer three plans: Free (₹0), Premium Monthly (₹499/month), and Premium Yearly (₹4,999/year — save ₹988!). All premium plans include AI Health Assistant, Advanced Analytics, Telehealth, and more." },
  { keywords: ["renew", "renewal", "expiry", "expire", "auto-renew", "auto renewal"], answer: "Your subscription auto-renews by default. You can manage renewal settings from the 'Renewal & Expiry' page. We'll send reminders 7 days, 3 days, and 1 day before renewal. You can turn off auto-renewal anytime." },
  { keywords: ["data", "privacy", "secure", "security", "safe"], answer: "Your data is fully secure. We use bank-level 256-bit encryption and are PCI DSS compliant. Health data is stored with HIPAA-standard protections. If you cancel, your data is retained for 90 days before permanent deletion." },
  { keywords: ["feature", "premium", "what do i get", "benefits", "include"], answer: "Premium features include: AI Health Assistant, Advanced Analytics Dashboard, Telehealth Video Consultations, Priority Support, Unlimited Health Records, and Custom Reports. All features unlock instantly upon subscription." },
  { keywords: ["billing", "invoice", "history", "receipt"], answer: "You can view all your invoices and payment history on the 'Billing History' page. Each transaction includes an invoice ID, date, plan details, amount, and status. You can download invoices as needed." },
  { keywords: ["contact", "email", "phone", "support", "help", "agent", "human"], answer: "You can reach our support team via:\n• Email: support@safeher.com\n• Phone: +91 1800-123-4567\n• This live chat (24/7)\nFor urgent issues, phone support is the fastest option." },
  { keywords: ["hello", "hi", "hey", "good morning", "good evening"], answer: "Hello! 👋 Welcome to SafeHer Support. I'm here to help you with any subscription-related questions. You can ask me about plans, pricing, payments, cancellations, refunds, or anything else!" },
  { keywords: ["thank", "thanks", "bye", "goodbye"], answer: "You're welcome! 😊 If you have any more questions, feel free to ask anytime. Have a great day!" },
];

function getBotReply(userMsg) {
  const lower = userMsg.toLowerCase().trim();
  if (!lower) return null;
  let bestMatch = null;
  let bestScore = 0;
  for (const entry of CHAT_BOT_RESPONSES) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw) && kw.length > bestScore) {
        bestMatch = entry.answer;
        bestScore = kw.length;
      }
    }
  }
  if (bestMatch) return bestMatch;
  return "I'm not sure I understand that question. You can ask me about:\n• Subscription plans & pricing\n• Payments & billing\n• Cancellation & refunds\n• Promo codes & offers\n• Renewal & expiry\n• Data security\n• Contacting support\n\nOr type 'help' for more options!";
}

const PLAN_FEATURES = {
  free: ["Basic vitals logging", "Symptom tracking", "Vaccination records", "Medical records storage", "Medication reminders"],
  monthly: ["Everything in Free", "AI Health Assistant", "Advanced analytics & insights", "Telehealth integration", "Personalized recommendations", "Priority support", "Export health reports"],
  yearly: ["Everything in Premium Monthly", "Save ₹988 per year", "Exclusive wellness content", "Early access to new features", "Dedicated health coach consultation", "24/7 priority support"]
};

const COMPARE_FEATURES = [
  { feature: "Vitals Tracking", free: true, monthly: true, yearly: true },
  { feature: "Symptom Tracking", free: true, monthly: true, yearly: true },
  { feature: "Medical Records", free: true, monthly: true, yearly: true },
  { feature: "AI Health Assistant", free: false, monthly: true, yearly: true },
  { feature: "Advanced Analytics", free: false, monthly: true, yearly: true },
  { feature: "Telehealth Integration", free: false, monthly: true, yearly: true },
  { feature: "Priority Support", free: false, monthly: true, yearly: true },
  { feature: "Health Coach Consultation", free: false, monthly: false, yearly: true },
];

const FAQ_DATA = [
  { q: "How do I cancel my subscription?", a: "You can cancel your subscription anytime from the \"My Subscription\" page. Click on the \"Cancel Subscription\" button and follow the prompts. You'll retain access to premium features until the end of your current billing period." },
  { q: "Can I switch between monthly and yearly plans?", a: "Yes! You can upgrade to the yearly plan anytime to save money. If switching from yearly to monthly, the change will take effect at the end of your current billing cycle. Visit the \"Change Plan\" option in your subscription dashboard." },
  { q: "What happens if my payment fails?", a: "If your payment fails, we'll retry the charge after 24 hours. You'll receive an email notification to update your payment method. Your subscription will remain active for a 7-day grace period while the payment issue is resolved." },
  { q: "Do you offer refunds?", a: "We offer a 7-day money-back guarantee for new subscriptions. If you're not satisfied within the first 7 days, contact our support team for a full refund. After the grace period, refunds are handled on a case-by-case basis." },
  { q: "How do I update my payment information?", a: "Go to the \"Billing History\" page and click on your saved payment method. You can update your card details, add a new payment method, or remove an existing one." },
  { q: "Will my data be lost if I cancel?", a: "No, your health data and records are retained for 90 days after cancellation. You can reactivate your subscription anytime within this period to regain full access. After 90 days, data is permanently deleted per our privacy policy." },
  { q: "Can I use promo codes with existing subscriptions?", a: "Promo codes can be applied during plan upgrades or at renewal. Visit the \"Offers & Discounts\" page to see available codes. Some codes may have restrictions on existing subscriptions." },
  { q: "Is my payment information secure?", a: "Absolutely! We use bank-level 256-bit encryption and are PCI DSS compliant. Your payment details are processed through Razorpay/Stripe and never stored on our servers directly." },
];

const TESTIMONIALS = [
  { initials: "SB", name: "Shreya Bansal", role: "Premium User", color: "#c026d3", quote: "The AI health assistant has been a game-changer for tracking my wellness journey. Worth every penny!" },
  { initials: "PM", name: "Priya Mehta", role: "Annual Member", color: "#7c3aed", quote: "Switching to the annual plan saved me money and the telehealth feature is incredibly convenient." },
  { initials: "AK", name: "Anjali Kumar", role: "Premium User", color: "#d97706", quote: "SafeHer has become my trusted health companion. The analytics help me make better health decisions." },
];

export default function Subscription() {
  const location = useLocation();
  const navigate = useNavigate();
  const hash = location.hash.substring(1) || "plans";

  const [sub, setSub] = useState(null);
  const [billing, setBilling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [cardForm, setCardForm] = useState({ name: "", number: "", expiry: "", cvv: "" });
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [msg, setMsg] = useState("");

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { from: "bot", text: "Hello! 👋 Welcome to SafeHer Support. I'm here to help you with subscription-related questions. How can I assist you today?", time: new Date() }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const chatEndRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const [statusRes, billRes] = await Promise.all([
        api.get("/subscription/status"),
        api.get("/subscription/billing-history")
      ]);
      setSub(statusRes.data.subscription);
      setBilling(billRes.data.billingHistory || []);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, botTyping]);

  const handleChatSend = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    const userMessage = { from: "user", text: trimmed, time: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setBotTyping(true);
    setTimeout(() => {
      const reply = getBotReply(trimmed);
      setChatMessages(prev => [...prev, { from: "bot", text: reply, time: new Date() }]);
      setBotTyping(false);
    }, 800 + Math.random() * 700);
  };

  const handleChatKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  const chatQuickActions = [
    { label: "Pricing & Plans", msg: "What are the subscription plans and pricing?" },
    { label: "Cancel Subscription", msg: "How do I cancel my subscription?" },
    { label: "Refund Policy", msg: "Do you offer refunds?" },
    { label: "Promo Codes", msg: "What promo codes are available?" },
  ];

  const planPrice = (type) => ({ free: 0, monthly: 499, yearly: 4999, lifetime: 4999 }[type] || 0);
  const finalPrice = (type) => Math.round(planPrice(type) * (1 - discount / 100));

  const handleSubscribe = (planType) => {
    setCheckoutPlan(planType);
    setCheckoutStep(1);
    setMsg("");
  };

  const handleApplyCoupon = async () => {
    try {
      const res = await api.post("/subscription/apply-coupon", { coupon });
      setDiscount(res.data.discount);
      setAppliedCoupon(res.data.coupon);
      setMsg(`Coupon applied! ${res.data.discount}% off`);
    } catch {
      setMsg("Invalid coupon code");
      setDiscount(0);
      setAppliedCoupon("");
    }
  };

  const handlePayment = async () => {
    setCheckoutStep(2);
    try {
      await api.post("/subscription/subscribe", {
        planType: checkoutPlan,
        paymentId: "pay_" + Date.now(),
        paymentMethod: "card",
        coupon: appliedCoupon
      });
      setCheckoutStep(3);
      fetchData();
    } catch {
      setMsg("Payment failed. Please try again.");
      setCheckoutStep(1);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription?")) return;
    try {
      await api.post("/subscription/cancel");
      setMsg("Subscription cancelled.");
      fetchData();
    } catch { setMsg("Failed to cancel."); }
  };

  const handleUpgrade = async (planType) => {
    try {
      await api.post("/subscription/upgrade", { planType, paymentId: "pay_upg_" + Date.now() });
      setMsg(`Upgraded to ${planType}!`);
      fetchData();
    } catch { setMsg("Upgrade failed."); }
  };

  const isActive = sub?.status === "active" && sub?.planType !== "free";
  const daysLeft = sub?.endDate ? Math.max(0, Math.ceil((new Date(sub.endDate) - new Date()) / 86400000)) : 0;
  const totalDays = sub?.startDate && sub?.endDate ? Math.ceil((new Date(sub.endDate) - new Date(sub.startDate)) / 86400000) : 1;
  const progressPct = totalDays > 0 ? Math.round(((totalDays - daysLeft) / totalDays) * 100) : 0;

  if (loading) return <div className="sub-page"><UserHeader /><div style={{ padding: 80, textAlign: "center" }}>Loading...</div></div>;

  return (
    <div className="sub-page">
      <UserHeader />
      <div className="sub-body">
        <SubscriptionSidebar />
        <div className="sub-content">
          <div className="sub-head">
            <div>
              <h1 className={`sub-title ${hash === "plans" ? "gradient" : ""}`}>
                {hash === "plans" ? "Subscription Plans" : hash === "billing" ? "Billing History" : hash === "upgrade" ? "Renewal & Expiry" : hash === "renewal" ? "My Subscription" : hash === "offers" ? "Offers & Discounts" : hash === "support" ? "Support & FAQs" : "Subscription"}
              </h1>
              <p className="sub-subtitle">
                {hash === "plans" ? "Choose the perfect plan for your health journey. Upgrade anytime, cancel anytime." : hash === "billing" ? "View your payment history and invoices" : hash === "upgrade" ? "Track your subscription renewal and expiry dates" : hash === "renewal" ? "Manage your subscription renewal" : hash === "offers" ? "Exclusive deals and promotional offers for SafeHer users" : hash === "support" ? "Get help with your subscription and account" : "Manage your subscription"}
              </p>
            </div>
            {isActive && <span className="sub-premium-badge">✨ Premium Active</span>}
          </div>

          {msg && <div className="sub-msg">{msg}<button onClick={() => setMsg("")}>×</button></div>}

          {/* ═══ PLANS TAB ═══ */}
          {hash === "plans" && checkoutStep === 0 && (
            <section>
              <div className="sub-plans-row">
                {/* Free Plan */}
                <div className="sub-plan-card">
                  <h3 className="sub-plan-name">Free Plan</h3>
                  <p className="sub-plan-desc">Essential health tracking for everyone</p>
                  <div className="sub-plan-price">Free</div>
                  <ul className="sub-plan-features">{PLAN_FEATURES.free.map((f, i) => <li key={i}><span className="sub-check">✓</span>{f}</li>)}</ul>
                  <button className="sub-plan-btn current-plan" disabled>Current Plan</button>
                </div>
                {/* Premium Monthly */}
                <div className="sub-plan-card">
                  <h3 className="sub-plan-name">Premium Monthly</h3>
                  <p className="sub-plan-desc">Unlock all premium features</p>
                  <div className="sub-plan-price">₹499<span>/month</span></div>
                  <ul className="sub-plan-features">{PLAN_FEATURES.monthly.map((f, i) => <li key={i}><span className="sub-check">✓</span>{f}</li>)}</ul>
                  <button className="sub-plan-btn" onClick={() => handleSubscribe("monthly")} disabled={sub?.planType === "monthly" && isActive}>
                    {sub?.planType === "monthly" && isActive ? "Current Plan" : "Subscribe Now"}
                  </button>
                </div>
                {/* Premium Yearly */}
                <div className="sub-plan-card yearly-highlight">
                  <div className="sub-plan-badge popular">Most Popular</div>
                  <h3 className="sub-plan-name">Premium Yearly</h3>
                  <p className="sub-plan-desc">Best value with annual savings</p>
                  <div className="sub-plan-price">₹4999<span>/year</span></div>
                  <p className="sub-plan-save">Save ₹988 per year</p>
                  <ul className="sub-plan-features">{PLAN_FEATURES.yearly.map((f, i) => <li key={i}><span className="sub-check">✓</span>{f}</li>)}</ul>
                  <button className="sub-plan-btn yearly-btn" onClick={() => handleSubscribe("yearly")} disabled={sub?.planType === "yearly" && isActive}>
                    {sub?.planType === "yearly" && isActive ? "Current Plan" : "Subscribe Now"}
                  </button>
                </div>
              </div>

              {/* Feature Comparison */}
              <div className="sub-compare-card">
                <h3>Feature Comparison</h3>
                <table className="sub-compare-table">
                  <thead><tr><th>Feature</th><th>Free</th><th>Premium Monthly</th><th>Premium Yearly</th></tr></thead>
                  <tbody>
                    {COMPARE_FEATURES.map((row, i) => (
                      <tr key={i}>
                        <td>{row.feature}</td>
                        <td>{row.free ? <span className="sub-tbl-yes">✓</span> : <span className="sub-tbl-no">✗</span>}</td>
                        <td>{row.monthly ? <span className="sub-tbl-yes">✓</span> : <span className="sub-tbl-no">✗</span>}</td>
                        <td>{row.yearly ? <span className="sub-tbl-yes">✓</span> : <span className="sub-tbl-no">✗</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* FAQ Section */}
              <div className="sub-faq-section">
                <h3>Frequently Asked Questions</h3>
                <div className="sub-faq-grid">
                  {FAQ_DATA.map((faq, i) => (
                    <div key={i} className="sub-faq-card">
                      <h4>{faq.q}</h4>
                      <p>{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonials */}
              <div className="sub-testimonials-section">
                <h3>What Our Users Say</h3>
                <div className="sub-testimonials-row">
                  {TESTIMONIALS.map((t, i) => (
                    <div key={i} className="sub-testimonial-card">
                      <div className="sub-testimonial-header">
                        <div className="sub-testimonial-avatar" style={{ background: t.color }}>{t.initials}</div>
                        <div>
                          <div className="sub-testimonial-name">{t.name}</div>
                          <div className="sub-testimonial-role">{t.role}</div>
                        </div>
                      </div>
                      <p className="sub-testimonial-quote">"{t.quote}"</p>
                      <div className="sub-testimonial-stars">★★★★★</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ═══ CHECKOUT FLOW ═══ */}
          {hash === "plans" && checkoutStep === 1 && (
            <section className="sub-checkout">
              <div className="sub-checkout-grid">
                <div className="sub-card">
                  <h3>Payment Details</h3>
                  <div className="sub-pay-icons">
                    <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" width="40"/>
                    <img src="https://img.icons8.com/color/48/mastercard-logo.png" alt="MC" width="40"/>
                    <img src="https://img.icons8.com/color/48/paypal.png" alt="PayPal" width="40"/>
                    <span className="sub-pay-razorpay">Razorpay</span>
                  </div>
                  <div className="sub-form-group"><label>Cardholder Name</label><input value={cardForm.name} onChange={e => setCardForm({ ...cardForm, name: e.target.value })} placeholder="Jane Doe" /></div>
                  <div className="sub-form-group"><label>Card Number</label><input value={cardForm.number} onChange={e => setCardForm({ ...cardForm, number: e.target.value })} placeholder="4242 4242 4242 4242" maxLength={19} /></div>
                  <div className="sub-form-row">
                    <div className="sub-form-group"><label>Expiry</label><input value={cardForm.expiry} onChange={e => setCardForm({ ...cardForm, expiry: e.target.value })} placeholder="MM/YY" maxLength={5} /></div>
                    <div className="sub-form-group"><label>CVV</label><input type="password" value={cardForm.cvv} onChange={e => setCardForm({ ...cardForm, cvv: e.target.value })} placeholder="•••" maxLength={4} /></div>
                  </div>
                  <div className="sub-form-group"><label>Coupon Code</label>
                    <div className="sub-coupon-row"><input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Enter code" /><button onClick={handleApplyCoupon} className="sub-coupon-btn">Apply</button></div>
                  </div>
                  {appliedCoupon && <div className="sub-coupon-applied">✅ {appliedCoupon} — {discount}% off</div>}
                  <div className="sub-secure-note">🔒 Your payment information is secure and encrypted</div>
                </div>
                <div className="sub-card">
                  <h3>Order Summary</h3>
                  <div className="sub-summary-row"><span>{checkoutPlan === "monthly" ? "Monthly Premium" : checkoutPlan === "yearly" ? "Yearly Premium" : "Lifetime Premium"}</span><span>₹{planPrice(checkoutPlan)}</span></div>
                  {discount > 0 && <div className="sub-summary-row discount"><span>Discount ({discount}%)</span><span>-₹{planPrice(checkoutPlan) - finalPrice(checkoutPlan)}</span></div>}
                  <div className="sub-summary-total"><span>Total</span><span>₹{finalPrice(checkoutPlan)}</span></div>
                  <button className="sub-pay-btn" onClick={handlePayment}>Pay ₹{finalPrice(checkoutPlan)}</button>
                  <button className="sub-back-btn" onClick={() => { setCheckoutStep(0); setCheckoutPlan(null); }}>← Back to Plans</button>
                </div>
              </div>
            </section>
          )}

          {/* Processing */}
          {hash === "plans" && checkoutStep === 2 && (
            <section className="sub-processing"><div className="sub-spinner" /><p>Processing your payment...</p></section>
          )}

          {/* Confirmation */}
          {hash === "plans" && checkoutStep === 3 && (
            <section className="sub-confirmation">
              <div className="sub-card" style={{ textAlign: "center", maxWidth: 500, margin: "0 auto" }}>
                <div className="sub-confirm-icon">✅</div>
                <h2>Subscription Activated!</h2>
                <p>Welcome to SafeHer Premium. All features are now unlocked.</p>
                <div className="sub-confirm-badge">Premium Member</div>
                <div className="sub-confirm-details">
                  <div><strong>Plan:</strong> {checkoutPlan === "monthly" ? "Monthly" : checkoutPlan === "yearly" ? "Yearly" : "Lifetime"} Premium</div>
                  <div><strong>Amount Paid:</strong> ₹{finalPrice(checkoutPlan)}</div>
                  <div><strong>Next Renewal:</strong> {checkoutPlan === "lifetime" ? "Never" : new Date(Date.now() + (checkoutPlan === "monthly" ? 30 : 365) * 86400000).toLocaleDateString()}</div>
                </div>
                <button className="sub-plan-btn" onClick={() => { setCheckoutStep(0); setCheckoutPlan(null); navigate("/subscription#renewal"); }}>Go to Dashboard</button>
              </div>
            </section>
          )}

          {/* ═══ BILLING HISTORY ═══ */}
          {hash === "billing" && (() => {
            const paidBilling = billing.filter(b => b.status === "paid");
            const totalPaid = paidBilling.reduce((sum, b) => sum + (b.amount || 0), 0);
            const nextPaymentDate = sub?.renewalDate
              ? new Date(sub.renewalDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
              : "—";

            return (
              <section>
                {/* Summary Cards */}
                <div className="billing-stats-row">
                  <div className="billing-stat-card">
                    <span className="billing-stat-label">Total Paid ({new Date().getFullYear()})</span>
                    <span className="billing-stat-value">₹{totalPaid || 499}</span>
                  </div>
                  <div className="billing-stat-card">
                    <span className="billing-stat-label">Successful Payments</span>
                    <span className="billing-stat-value">{paidBilling.length || 3}</span>
                  </div>
                  <div className="billing-stat-card">
                    <span className="billing-stat-label">Next Payment</span>
                    <span className="billing-stat-value billing-stat-date">📅 {nextPaymentDate !== "—" ? nextPaymentDate : "March 22, 2026"}</span>
                  </div>
                </div>

                {/* Payment History Table */}
                <div className="sub-card" style={{ marginBottom: 24 }}>
                  <h3>Payment History</h3>
                  <p className="billing-table-subtitle">All your transaction records and invoices</p>
                  {billing.length === 0 ? (
                    <table className="sub-billing-table">
                      <thead><tr><th>Invoice ID</th><th>Date</th><th>Plan</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
                      <tbody>
                        <tr>
                          <td className="sub-invoice-id">INV-2026-001</td>
                          <td>22 Jan 2026</td>
                          <td>Premium Monthly</td>
                          <td>₹499</td>
                          <td><span className="sub-status-badge paid">Paid</span></td>
                          <td><button className="billing-invoice-btn">⬇ Invoice</button></td>
                        </tr>
                        <tr>
                          <td className="sub-invoice-id">INV-2025-012</td>
                          <td>22 Dec 2025</td>
                          <td>Premium Monthly</td>
                          <td>₹499</td>
                          <td><span className="sub-status-badge paid">Paid</span></td>
                          <td><button className="billing-invoice-btn">⬇ Invoice</button></td>
                        </tr>
                        <tr>
                          <td className="sub-invoice-id">INV-2025-011</td>
                          <td>22 Nov 2025</td>
                          <td>Premium Monthly</td>
                          <td>₹499</td>
                          <td><span className="sub-status-badge paid">Paid</span></td>
                          <td><button className="billing-invoice-btn">⬇ Invoice</button></td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <table className="sub-billing-table">
                      <thead><tr><th>Invoice ID</th><th>Date</th><th>Plan</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
                      <tbody>
                        {billing.map((b, i) => (
                          <tr key={i}>
                            <td className="sub-invoice-id">{b.invoiceId}</td>
                            <td>{new Date(b.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                            <td>{b.plan === "monthly" ? "Premium Monthly" : b.plan === "yearly" ? "Premium Yearly" : b.plan}</td>
                            <td>₹{b.amount}</td>
                            <td><span className={`sub-status-badge ${b.status}`}>{b.status}</span></td>
                            <td><button className="billing-invoice-btn">⬇ Invoice</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Saved Payment Methods */}
                <div className="sub-card">
                  <h3>Saved Payment Methods</h3>
                  <p className="billing-table-subtitle">Manage your payment methods for automatic renewals</p>
                  <div className="billing-payment-method">
                    <div className="billing-pm-left">
                      <span className="billing-pm-visa">VISA</span>
                      <div className="billing-pm-details">
                        <span className="billing-pm-number">•••• •••• •••• 4242</span>
                        <span className="billing-pm-expiry">Expires 12/2027</span>
                      </div>
                    </div>
                    <span className="billing-pm-default">Default</span>
                  </div>
                  <button className="billing-add-method-btn">Add Payment Method</button>
                </div>
              </section>
            );
          })()}

          {/* ═══ RENEWAL & EXPIRY ═══ */}
          {hash === "upgrade" && (() => {
            const startFull = sub?.startDate ? new Date(sub.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Jan 22, 2026";
            const renewFull = sub?.renewalDate ? new Date(sub.renewalDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Mar 22, 2026";
            const renewLong = sub?.renewalDate ? new Date(sub.renewalDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "March 22, 2026";
            const startDate = sub?.startDate ? new Date(sub.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Jan 22, 2026";
            const currentDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            const renewDate = sub?.renewalDate ? new Date(sub.renewalDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Mar 22, 2026";
            const showDays = daysLeft || 28;

            return (
              <section>
                {/* Auto-renewal banner */}
                <div className="renew-info-banner">
                  <span className="renew-info-icon">🔔</span>
                  <div>
                    <strong>Auto-renewal is enabled.</strong>
                    <p>Your subscription will automatically renew on {renewLong}.</p>
                  </div>
                </div>

                {/* Subscription Timeline */}
                <div className="sub-card renew-timeline-card">
                  <div className="renew-timeline-header">
                    <span className="renew-timeline-cal">📅</span>
                    <div>
                      <h3>Subscription Timeline</h3>
                      <p className="renew-timeline-cycle">Current billing cycle: {startFull} - {renewFull}</p>
                    </div>
                  </div>

                  <div className="renew-time-remaining">
                    <span>Time remaining</span>
                    <span className="renew-days-value">{showDays} days</span>
                  </div>
                  <div className="renew-progress-bar">
                    <div className="renew-progress-fill" style={{ width: `${Math.min(100, 100 - (showDays / (totalDays || 30)) * 100)}%` }} />
                    <div className="renew-progress-thumb" style={{ left: `${Math.min(100, 100 - (showDays / (totalDays || 30)) * 100)}%` }} />
                  </div>
                  <div className="renew-progress-labels">
                    <span>Started</span>
                    <span>Current</span>
                    <span>Renewal</span>
                  </div>

                  <div className="renew-dates-row">
                    <div className="renew-date-card">
                      <span className="renew-date-label">Subscription Started</span>
                      <span className="renew-date-value">{startDate}</span>
                    </div>
                    <div className="renew-date-card highlight">
                      <span className="renew-date-label">Current Date</span>
                      <span className="renew-date-value">{currentDate}</span>
                    </div>
                    <div className="renew-date-card">
                      <span className="renew-date-label">Next Renewal</span>
                      <span className="renew-date-value">{renewDate}</span>
                    </div>
                  </div>
                </div>

                {/* Renewal Options */}
                <div className="sub-card renew-options-card">
                  <h3>Renewal Options</h3>
                  <p className="renew-options-sub">Manage how your subscription renews</p>

                  <div className="renew-option-item">
                    <div>
                      <strong>Auto-Renewal (Enabled)</strong>
                      <p>Your subscription will automatically renew using your saved payment method</p>
                    </div>
                    <span className="renew-option-active">Active</span>
                  </div>

                  <div className="renew-option-item">
                    <div>
                      <strong>Payment Method</strong>
                      <p>Visa ending in 4242 will be charged ₹499 on {renewLong}</p>
                      <button className="renew-update-pm-btn">Update Payment Method</button>
                    </div>
                  </div>
                </div>

                {/* Renewal Reminders */}
                <div className="sub-card renew-reminders-card">
                  <h3>Renewal Reminders</h3>
                  <p className="renew-reminders-sub">We'll send you notifications before your subscription renews</p>
                  {[
                    { days: "7 days before renewal", desc: "Email & notification reminder" },
                    { days: "3 days before renewal", desc: "Email & notification reminder" },
                    { days: "1 day before renewal", desc: "Email & notification reminder" },
                  ].map((r, i) => (
                    <div key={i} className="renew-reminder-item">
                      <span className="renew-reminder-icon">🔔</span>
                      <div className="renew-reminder-text">
                        <strong>{r.days}</strong>
                        <p>{r.desc}</p>
                      </div>
                      <span className="renew-reminder-badge">Scheduled</span>
                    </div>
                  ))}
                </div>

                {/* Quick links */}
                <div className="mysub-quick-links" style={{ marginBottom: 20 }}>
                  <div className="mysub-quick-link" onClick={() => navigate("/subscription#renewal")}>
                    <strong>Manage Subscription</strong>
                    <p>View details and change your plan</p>
                  </div>
                  <div className="mysub-quick-link" onClick={() => navigate("/subscription#support")}>
                    <strong>Need Help?</strong>
                    <p>Contact support for renewal assistance</p>
                  </div>
                </div>

                {/* Cancel auto-renewal */}
                <div className="renew-cancel-card">
                  <h4>Cancel Auto-Renewal</h4>
                  <p className="renew-cancel-subtitle">If you don't want to continue your subscription</p>
                  <p className="renew-cancel-text">You can turn off auto-renewal anytime. You'll keep access to premium features until the end of your current billing period ({renewLong}).</p>
                  <button className="renew-cancel-btn" onClick={handleCancel}>Cancel Auto-Renewal</button>
                </div>
              </section>
            );
          })()}

          {/* ═══ MY SUBSCRIPTION ═══ */}
          {hash === "renewal" && (() => {
            const planName = sub?.planType === "monthly" ? "Premium Monthly" : sub?.planType === "yearly" ? "Premium Yearly" : sub?.planType === "lifetime" ? "Lifetime Premium" : "Free";
            const startDateStr = sub?.startDate ? new Date(sub.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "22 January 2026";
            const renewalDateStr = sub?.renewalDate ? new Date(sub.renewalDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "March 22, 2026";
            const startShort = sub?.startDate ? new Date(sub.startDate).toLocaleDateString("en-GB") : "22/1/2026";
            const renewShort = sub?.renewalDate ? new Date(sub.renewalDate).toLocaleDateString("en-GB") : "22/3/2026";
            const showDaysLeft = daysLeft || 28;

            return (
              <section>
                {/* Active banner */}
                {isActive ? (
                  <div className="mysub-active-banner">
                    <span className="mysub-active-icon">✓</span>
                    <div>Your <strong>{planName}</strong> subscription is currently active.</div>
                  </div>
                ) : (
                  <div className="mysub-inactive-banner">
                    <span>⚠️</span>
                    <div><strong>{sub?.status === "expired" ? "Your subscription has expired" : sub?.status === "cancelled" ? "Subscription cancelled" : "You're on the Free plan"}</strong>
                      <p>Subscribe now to unlock premium features.</p>
                    </div>
                  </div>
                )}

                {/* Subscription Details Card */}
                <div className="sub-card mysub-details-card">
                  <div className="mysub-plan-header">
                    <div>
                      <h3 className="mysub-plan-name">{planName}</h3>
                      <p className="mysub-plan-since">Active since {startDateStr}</p>
                    </div>
                    <span className={`mysub-status-pill ${isActive ? "active" : "inactive"}`}>{isActive ? "Active" : sub?.status || "Inactive"}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="mysub-progress-section">
                    <div className="mysub-progress-top">
                      <span className="mysub-progress-label">Days remaining until renewal</span>
                      <span className="mysub-progress-days">{showDaysLeft} days left</span>
                    </div>
                    <div className="sub-progress-bar"><div className="sub-progress-fill" style={{ width: `${Math.min(100, 100 - (showDaysLeft / (totalDays || 30)) * 100)}%` }} /></div>
                    <div className="mysub-progress-dates">
                      <span>Started: {startShort}</span>
                      <span>Renewal: {renewShort}</span>
                    </div>
                  </div>

                  {/* Billing info row */}
                  <div className="mysub-info-row">
                    <div className="mysub-info-item">
                      <span className="mysub-info-icon">📅</span>
                      <div>
                        <span className="mysub-info-label">Next Billing Date</span>
                        <span className="mysub-info-value">{renewalDateStr}</span>
                      </div>
                    </div>
                    <div className="mysub-info-item">
                      <span className="mysub-info-icon">🧾</span>
                      <div>
                        <span className="mysub-info-label">Billing Amount</span>
                        <span className="mysub-info-value">₹499/month</span>
                      </div>
                    </div>
                    <div className="mysub-info-item">
                      <span className="mysub-info-icon">💳</span>
                      <div>
                        <span className="mysub-info-label">Payment Method</span>
                        <span className="mysub-info-value">Visa ••4242</span>
                      </div>
                    </div>
                  </div>

                  {/* Auto-renewal toggle */}
                  <div className="mysub-auto-renew">
                    <div>
                      <strong>Auto-Renewal</strong>
                      <p>Automatically renew your subscription at the end of each billing period</p>
                    </div>
                    <label className="mysub-toggle">
                      <input type="checkbox" defaultChecked={sub?.autoRenew !== false} />
                      <span className="mysub-toggle-slider" />
                    </label>
                  </div>

                  {/* Action buttons */}
                  <div className="mysub-actions">
                    <button className="mysub-btn-outline" onClick={() => navigate("/subscription#plans")}>Change Plan</button>
                    <button className="mysub-btn-cancel" onClick={handleCancel}>Cancel Subscription</button>
                  </div>
                </div>

                {/* Active Premium Features */}
                <div className="sub-card mysub-features-card">
                  <h3>Active Premium Features</h3>
                  <p className="mysub-features-sub">Features included in your current subscription</p>
                  <div className="mysub-features-grid">
                    {[
                      { icon: "🤖", label: "AI Health Assistant" },
                      { icon: "📊", label: "Advanced Analytics" },
                      { icon: "🩺", label: "Telehealth Integration" },
                      { icon: "🌿", label: "Personalized Recommendations" },
                      { icon: "🎧", label: "Priority Support" },
                      { icon: "📋", label: "Export Health Reports" },
                    ].map((f, i) => (
                      <div key={i} className="mysub-feature-item">
                        <span className="mysub-feature-icon">{f.icon}</span>
                        <span className="mysub-feature-label">{f.label}</span>
                        <span className="mysub-feature-check">✓</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save more banner */}
                {sub?.planType !== "yearly" && sub?.planType !== "lifetime" && (
                  <div className="mysub-upsell-banner">
                    <div className="mysub-upsell-icon">ℹ️</div>
                    <div className="mysub-upsell-text">
                      <strong>Save more with Annual Plan</strong>
                      <p>Upgrade to our yearly plan and save ₹988 annually. That's 2 months free!</p>
                    </div>
                    <button className="mysub-upsell-btn" onClick={() => handleUpgrade("yearly")}>Upgrade to Annual</button>
                  </div>
                )}

                {/* Quick links */}
                <div className="mysub-quick-links">
                  <div className="mysub-quick-link" onClick={() => navigate("/subscription#billing")}>
                    <strong>View Billing History</strong>
                    <p>See all your past payments</p>
                  </div>
                  <div className="mysub-quick-link" onClick={() => navigate("/subscription#offers")}>
                    <strong>Available Offers</strong>
                    <p>Check current discounts</p>
                  </div>
                  <div className="mysub-quick-link" onClick={() => navigate("/subscription#support")}>
                    <strong>Need Help?</strong>
                    <p>Contact support team</p>
                  </div>
                </div>
              </section>
            );
          })()}

          {/* ═══ OFFERS & DISCOUNTS ═══ */}
          {hash === "offers" && (() => {
            const copyCode = (code) => {
              navigator.clipboard.writeText(code).catch(() => {});
            };
            return (
              <section>
                {/* Featured offer */}
                <div className="offers-featured">
                  <span className="offers-featured-tag">Featured Offer</span>
                  <h2 className="offers-featured-title">Women's Day Special 🌸</h2>
                  <p className="offers-featured-desc">Celebrate International Women's Day with exclusive savings on premium plans</p>
                  <div className="offers-featured-coupon-row">
                    <div className="offers-featured-amount">
                      <span className="offers-featured-pct">30% OFF</span>
                      <span className="offers-featured-on">On all annual plans</span>
                    </div>
                    <div className="offers-featured-code-box">
                      <span className="offers-code-tag">SAFEHER30</span>
                      <button className="offers-copy-btn" onClick={() => copyCode("SAFEHER30")}>📋</button>
                    </div>
                  </div>
                  <p className="offers-featured-valid">📅 Valid until March 8, 2026</p>
                </div>

                {/* All available offers */}
                <h3 className="offers-section-title">All Available Offers</h3>
                <div className="offers-all-row">
                  <div className="offers-all-card">
                    <div className="offers-all-header">
                      <span className="offers-all-icon">🏷️</span>
                      <strong>Women's Day Special</strong>
                      <span className="offers-all-badge pink">30% OFF</span>
                    </div>
                    <p className="offers-all-desc">Celebrate Women's Day with exclusive savings</p>
                    <div className="offers-all-code-row">
                      <span className="offers-code-tag">SAFEHER30</span>
                      <button className="offers-copy-btn-sm" onClick={() => copyCode("SAFEHER30")}>📋 Copy</button>
                    </div>
                    <p className="offers-all-valid">📅 Valid until 8 March 2026</p>
                  </div>
                  <div className="offers-all-card">
                    <div className="offers-all-header">
                      <span className="offers-all-icon">🏷️</span>
                      <strong>Annual Plan Bonus</strong>
                      <span className="offers-all-badge green">Save ₹988</span>
                    </div>
                    <p className="offers-all-desc">Get 2 months free with yearly subscription</p>
                    <div className="offers-all-code-row">
                      <span className="offers-code-tag">ANNUAL2026</span>
                      <button className="offers-copy-btn-sm" onClick={() => copyCode("ANNUAL2026")}>📋 Copy</button>
                    </div>
                    <p className="offers-all-valid">📅 Valid until 31 December 2026</p>
                  </div>
                </div>

                {/* How to use promo codes */}
                <div className="sub-card offers-howto-card">
                  <h3>How to Use Promo Codes</h3>
                  <ol className="offers-howto-list">
                    <li>Choose your preferred subscription plan from the Plans page</li>
                    <li>Proceed to checkout and enter the promo code in the designated field</li>
                    <li>Click "Apply" to see your discount reflected in the total amount</li>
                    <li>Complete your payment to activate your discounted subscription</li>
                  </ol>
                </div>

                {/* Refer & Earn */}
                <div className="offers-refer-card">
                  <h2>Refer & Earn 🎁</h2>
                  <p className="offers-refer-desc">Invite your friends to SafeHer and earn rewards</p>
                  <div className="offers-refer-row">
                    <div className="offers-refer-item">
                      <span className="offers-refer-icon">📤</span>
                      <strong>Share Your Link</strong>
                      <p>Send your unique referral link to friends</p>
                    </div>
                    <div className="offers-refer-item">
                      <span className="offers-refer-icon">👥</span>
                      <strong>Friend Subscribes</strong>
                      <p>They get 20% off their first subscription</p>
                    </div>
                    <div className="offers-refer-item">
                      <span className="offers-refer-icon">🎉</span>
                      <strong>You Earn</strong>
                      <p>Get 1 month free for each referral</p>
                    </div>
                  </div>
                </div>
              </section>
            );
          })()}

          {/* ═══ SUPPORT & FAQs ═══ */}
          {hash === "support" && (
            <section>
              {/* Support contact cards */}
              <div className="support-contacts-row">
                <div className="support-contact-card">
                  <div className="support-contact-icon email">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#c026d3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="22,6 12,13 2,6" stroke="#c026d3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <h4>Email Support</h4>
                  <p>support@safeher.com</p>
                  <a href="mailto:support@safeher.com" className="support-btn pink">Send Email</a>
                </div>
                <div className="support-contact-card">
                  <div className="support-contact-icon phone">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.81.37 1.6.65 2.36a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.76.28 1.55.52 2.36.65A2 2 0 0122 16.92z" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <h4>Phone Support</h4>
                  <p>+91 1800-123-4567</p>
                  <a href="tel:+911800123467" className="support-btn teal">Call Now</a>
                </div>
                <div className="support-contact-card">
                  <div className="support-contact-icon chat">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <h4>Live Chat</h4>
                  <p>Available 24/7</p>
                  <button className="support-btn purple" onClick={() => setChatOpen(true)}>Start Chat</button>
                </div>
              </div>

              {/* FAQ Accordion */}
              <div className="sub-card support-faq-card">
                <div className="support-faq-header">
                  <span className="support-faq-icon">❓</span>
                  <div>
                    <h3>Frequently Asked Questions</h3>
                    <p className="support-faq-sub">Find quick answers to common questions about subscriptions</p>
                  </div>
                </div>
                <div className="support-faq-list">
                  {FAQ_DATA.map((faq, i) => (
                    <div key={i} className={`support-faq-item ${openFaq === i ? "open" : ""}`}>
                      <button className="support-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                        <span>{faq.q}</span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0)", transition: "0.2s", flexShrink: 0 }}><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      {openFaq === i && <div className="support-faq-a">{faq.a}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact form */}
              <div className="sub-card support-form-card">
                <h3>Still have questions?</h3>
                <p className="support-form-sub">Send us a message and we'll get back to you within 24 hours</p>
                <div className="support-form-row">
                  <div className="support-form-group">
                    <label>Name</label>
                    <input type="text" placeholder="Your name" />
                  </div>
                  <div className="support-form-group">
                    <label>Email</label>
                    <input type="email" placeholder="your@email.com" />
                  </div>
                </div>
                <div className="support-form-group full">
                  <label>Subject</label>
                  <input type="text" placeholder="What's this about?" />
                </div>
                <div className="support-form-group full">
                  <label>Message</label>
                  <textarea rows="3" placeholder="Describe your issue or question..."></textarea>
                </div>
                <button className="support-submit-btn">Submit Request</button>
              </div>

            </section>
          )}

        </div>
      </div>
      {/* Custom Subscription Footer */}
      <footer className="sub-footer">
        <div className="sub-footer-inner">
          <div className="sub-footer-col">
            <h4>About SafeHer</h4>
            <p>Empowering women with comprehensive health tracking and safety features.</p>
          </div>
          <div className="sub-footer-col">
            <h4>Quick Links</h4>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="mailto:support@safeher.com">Contact Support</a>
          </div>
          <div className="sub-footer-col newsletter">
            <h4>Newsletter</h4>
            <div className="sub-footer-newsletter">
              <input type="email" placeholder="Your email" />
              <button>Subscribe</button>
            </div>
            <div className="sub-footer-social">
              <a href="#twitter" aria-label="Twitter">𝕏</a>
              <a href="#instagram" aria-label="Instagram">📷</a>
            </div>
          </div>
        </div>
        <div className="sub-footer-bottom">
          © {new Date().getFullYear()} SafeHer. All rights reserved. Empowering women's health & safety.
        </div>
      </footer>

      {/* Live Chat Widget — rendered at root level for proper fixed positioning */}
      {chatOpen && (
        <div className="livechat-overlay" onClick={() => setChatOpen(false)}>
          <div className="livechat-widget" onClick={e => e.stopPropagation()}>
            <div className="livechat-header">
              <div className="livechat-header-info">
                <div className="livechat-avatar">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <strong>SafeHer Support</strong>
                  <span className="livechat-status">Online</span>
                </div>
              </div>
              <button className="livechat-close" onClick={() => setChatOpen(false)}>✕</button>
            </div>

            <div className="livechat-quick-actions">
              {chatQuickActions.map((qa, i) => (
                <button key={i} className="livechat-quick-btn" onClick={() => {
                  const userMessage = { from: "user", text: qa.msg, time: new Date() };
                  setChatMessages(prev => [...prev, userMessage]);
                  setBotTyping(true);
                  setTimeout(() => {
                    setChatMessages(prev => [...prev, { from: "bot", text: getBotReply(qa.msg), time: new Date() }]);
                    setBotTyping(false);
                  }, 800 + Math.random() * 700);
                }}>{qa.label}</button>
              ))}
            </div>

            <div className="livechat-messages">
              {chatMessages.map((m, i) => (
                <div key={i} className={`livechat-msg ${m.from}`}>
                  {m.from === "bot" && <div className="livechat-msg-avatar">SH</div>}
                  <div className="livechat-msg-bubble">
                    <span style={{ whiteSpace: "pre-line" }}>{m.text}</span>
                    <span className="livechat-msg-time">
                      {m.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
              {botTyping && (
                <div className="livechat-msg bot">
                  <div className="livechat-msg-avatar">SH</div>
                  <div className="livechat-msg-bubble typing">
                    <span className="livechat-typing-dot"></span>
                    <span className="livechat-typing-dot"></span>
                    <span className="livechat-typing-dot"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="livechat-input-area">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={handleChatKeyDown}
                placeholder="Type your message..."
                autoFocus
              />
              <button className="livechat-send-btn" onClick={handleChatSend} disabled={!chatInput.trim()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
