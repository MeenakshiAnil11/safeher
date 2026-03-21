import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import SearchBar from "../components/SearchBar";
import CartIcon from "../components/CartIcon";
import OrdersIcon from "../components/OrdersIcon";
import WishlistIcon from "../components/WishlistIcon";
import ShopModuleSidebar from "../components/ShopModuleSidebar";
import "./CategoryProducts.css";
import "./Checkout.css";

const STATE_OPTIONS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
];

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [cart, setCart] = useState(null);
  const [selectedItemIds, setSelectedItemIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: "",
  });
  const [upiVerified, setUpiVerified] = useState(false);
  const [upiPaymentId, setUpiPaymentId] = useState("");
  const [paymentInfo, setPaymentInfo] = useState("");

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

      if (existingScript) {
        existingScript.onload = () => resolve(true);
        existingScript.onerror = () => resolve(false);
        setTimeout(() => resolve(Boolean(window.Razorpay)), 1000);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      navigate("/login?redirect=/shop/checkout");
      return;
    }

    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      const parts = (parsed?.name || "").trim().split(" ");
      setForm((prev) => ({
        ...prev,
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
        email: parsed?.email || "",
        phone: parsed?.phone || "",
      }));
    }

    const selectedParam = searchParams.get("selected");
    if (selectedParam) {
      const ids = selectedParam.split(",").filter((id) => id.trim());
      setSelectedItemIds(new Set(ids));
    }

    fetchCart();
  }, [navigate, searchParams]);

  const fetchCart = async () => {
    try {
      const response = await api.get("/cart");
      const cartData = response.data.cart;
      if (!cartData?.items?.length) {
        navigate("/shop/cart");
        return;
      }
      if (selectedItemIds.size === 0) {
        setSelectedItemIds(new Set(cartData.items.map((item) => item._id)));
      }
      setCart(cartData);
    } catch (error) {
      console.error("Error fetching cart:", error);
      navigate("/shop/cart");
    } finally {
      setLoading(false);
    }
  };

  const selectedItems = useMemo(() => {
    if (!cart?.items) return [];
    return cart.items.filter((item) => selectedItemIds.has(item._id));
  }, [cart, selectedItemIds]);

  const totals = useMemo(() => {
    const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 0 ? 5.99 : 0;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
  }, [selectedItems]);

  const paymentMethodLabel =
    paymentMethod === "cod"
      ? "Cash on Delivery"
      : `UPI Payment (${paymentDetails.upiId || "Not provided"})`;

  const buildShippingAddress = () => ({
    name: `${form.firstName} ${form.lastName}`.trim(),
    phone: form.phone.trim(),
    addressLine1: form.addressLine1.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    postalCode: form.postalCode.trim(),
    country: form.country.trim(),
  });

  const validateShipping = () => {
    const nextErrors = {};
    if (!form.firstName.trim()) nextErrors.firstName = "First Name is required";
    if (!form.lastName.trim()) nextErrors.lastName = "Last Name is required";
    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }
    if (!form.phone.trim()) {
      nextErrors.phone = "Phone Number is required";
    } else if (!/^[0-9]{10}$/.test(form.phone.trim())) {
      nextErrors.phone = "Phone Number must be 10 digits";
    }
    if (!form.addressLine1.trim()) nextErrors.addressLine1 = "Street Address is required";
    if (!form.city.trim()) nextErrors.city = "City is required";
    if (!form.postalCode.trim()) {
      nextErrors.postalCode = "ZIP Code is required";
    } else if (!/^[0-9]{6}$/.test(form.postalCode.trim())) {
      nextErrors.postalCode = "ZIP Code must be 6 digits";
    }
    if (!form.state.trim()) {
      nextErrors.state = "State is required";
    } else if (!STATE_OPTIONS.includes(form.state.trim())) {
      nextErrors.state = "Select a valid state";
    }
    if (!form.country.trim()) nextErrors.country = "Country is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const isShippingFormValid = useMemo(() => {
    if (!form.firstName.trim()) return false;
    if (!form.lastName.trim()) return false;
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return false;
    if (!form.phone.trim() || !/^[0-9]{10}$/.test(form.phone.trim())) return false;
    if (!form.addressLine1.trim()) return false;
    if (!form.city.trim()) return false;
    if (!form.postalCode.trim() || !/^[0-9]{6}$/.test(form.postalCode.trim())) return false;
    if (!form.state.trim() || !STATE_OPTIONS.includes(form.state.trim())) return false;
    if (!form.country.trim()) return false;
    return true;
  }, [form]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const updatePaymentDetails = (key, value) => {
    setPaymentDetails((prev) => ({ ...prev, [key]: value }));
    if (key === "upiId") {
      setUpiVerified(false);
      setUpiPaymentId("");
      setPaymentInfo("");
      if (errors.upiId) {
        setErrors((prev) => ({ ...prev, upiId: "" }));
      }
    }
  };

  const handlePaymentMethodChange = (nextMethod) => {
    setPaymentMethod(nextMethod);
    setPaymentInfo("");
    setErrors((prev) => ({ ...prev, upiId: "" }));
    if (nextMethod === "cod") {
      setUpiVerified(false);
      setUpiPaymentId("");
    }
  };

  const isValidUpiId = useMemo(
    () => /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test((paymentDetails.upiId || "").trim()),
    [paymentDetails.upiId]
  );

  const isPaymentStepValid = useMemo(() => {
    if (paymentMethod === "cod") return true;
    return isValidUpiId && upiVerified;
  }, [paymentMethod, isValidUpiId, upiVerified]);

  const createOrder = async (paymentId = null, methodOverride = null, extraPayload = {}) => {
    const orderData = {
      shippingAddress: buildShippingAddress(),
      paymentMethod: methodOverride || paymentMethod,
      notes: "",
      selectedItemIds: Array.from(selectedItemIds),
      ...(paymentId ? { paymentId } : {}),
      ...extraPayload,
    };

    const response = await api.post("/orders", orderData);
    if (response.data?.order?._id) {
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      navigate(`/shop/order-confirmation/${response.data.order._id}`);
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateShipping()) {
      setStep(1);
      return;
    }
    try {
      setProcessing(true);
      if (paymentMethod === "cod") {
        await createOrder(null, "cod");
        return;
      }

      if (!isValidUpiId || !upiVerified) {
        setStep(2);
        setErrors((prev) => ({ ...prev, upiId: "Please verify your UPI ID before reviewing the order." }));
        setProcessing(false);
        return;
      }

      await createOrder(upiPaymentId || `upi_${Date.now()}`, "upi", {
        upiId: paymentDetails.upiId.trim() || "razorpay@upi",
      });
    } catch (error) {
      console.error("Checkout error:", error);
      window.alert(error.response?.data?.message || "Failed to place order.");
      setProcessing(false);
    }
  };

  const handleVerifyUpiPayment = async () => {
    if (!isValidUpiId) {
      setErrors((prev) => ({ ...prev, upiId: "Enter a valid UPI ID (example: user@upi)." }));
      return;
    }

    try {
      setProcessing(true);
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Razorpay SDK failed to load. Please refresh and try again.");
      }

      const amountInPaise = Math.round(totals.total * 100);
      const orderResponse = await api.post("/payment/create-order", {
        amount: amountInPaise,
        currency: "INR",
        receipt: `checkout_${Date.now()}`,
        orderType: "order",
      });

      const payload = orderResponse?.data;
      const order = payload?.order;
      const keyId = payload?.keyId;
      if (!payload?.success || !order?.id || !keyId) {
        throw new Error(payload?.message || "Unable to create Razorpay order.");
      }

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

      await new Promise((resolve, reject) => {
        const razorpay = new window.Razorpay({
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          order_id: order.id,
          name: "SafeHer",
          description: "Checkout Payment",
          method: {
            upi: true,
            card: false,
            netbanking: false,
            wallet: false,
            emi: false,
            paylater: false,
          },
          prefill: {
            name: storedUser?.name || "",
            email: storedUser?.email || "",
            contact: form.phone || storedUser?.phone || "",
          },
          theme: { color: "#7c5cff" },
          handler: async (response) => {
            try {
              await api.post("/payment/verify-payment", {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderType: "order",
              });

              setUpiPaymentId(response.razorpay_payment_id);
              setUpiVerified(true);
              setPaymentInfo("UPI payment successful. You can proceed to Review Order.");
              setErrors((prev) => ({ ...prev, upiId: "" }));
              resolve(true);
            } catch (verifyError) {
              reject(
                new Error(
                  verifyError?.response?.data?.error ||
                    verifyError?.response?.data?.message ||
                    "Payment verification failed."
                )
              );
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled by user.")),
          },
        });

        razorpay.on("payment.failed", (response) => {
          reject(
            new Error(
              response?.error?.description ||
                response?.error?.reason ||
                "UPI payment failed. Please try again."
            )
          );
        });

        razorpay.open();
      });
    } catch (error) {
      console.error("UPI verification failed:", error);
      setUpiVerified(false);
      setUpiPaymentId("");
      setPaymentInfo("");
      setErrors((prev) => ({
        ...prev,
        upiId: error?.response?.data?.message || error.message || "Unable to verify UPI ID.",
      }));
    } finally {
      setProcessing(false);
    }
  };


  if (loading) {
    return (
      <div className="cp2-page checkout-v2-page">
        <div className="checkout-v2-loading">Loading checkout...</div>
      </div>
    );
  }

  if (!selectedItems.length) {
    return (
      <div className="cp2-page checkout-v2-page">
        <div className="checkout-v2-loading">
          <p>No items selected for checkout.</p>
          <Link to="/shop/cart">Back to Cart</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cp2-page checkout-v2-page">
      <header className="cp2-topbar">
        <div className="cp2-topbar-left">
          <Link to="/shop" className="cp2-brand">
            <span className="cp2-brand-icon">🛍️</span>
            WellnessHub
          </Link>
        </div>
        <div className="cp2-topbar-center">
          <SearchBar placeholder="Search products..." />
        </div>
        <div className="cp2-topbar-right">
          <OrdersIcon />
          <WishlistIcon />
          <CartIcon />
          <Link to="/profile" className="cp2-profile-link" aria-label="Profile">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor" />
              <path d="M12 14C7.58172 14 4 15.7909 4 18V22H20V18C20 15.7909 16.4183 14 12 14Z" fill="currentColor" />
            </svg>
          </Link>
        </div>
      </header>

      <div className="cp2-layout">
        <ShopModuleSidebar />

        <main className="cp2-main checkout-v2-main">
          <div className="checkout-v2-container">
            <h1 className="checkout-v2-title">Checkout</h1>

            <div className="checkout-v2-steps" aria-label="Checkout progress">
              <div className={`checkout-v2-step ${step >= 1 ? "active" : ""}`}>
                <span className="dot">📍</span>
                <span>Shipping</span>
              </div>
              <div className="line" />
              <div className={`checkout-v2-step ${step >= 2 ? "active" : ""}`}>
                <span className="dot">💳</span>
                <span>Payment</span>
              </div>
              <div className="line" />
              <div className={`checkout-v2-step ${step >= 3 ? "active" : ""}`}>
                <span className="dot">📦</span>
                <span>Review</span>
              </div>
            </div>

            <div className="checkout-v2-content">
              <section className="checkout-v2-left">
                <div className={`checkout-v2-card ${step === 2 ? "payment-container" : ""}`}>
                  <h2 className={step === 2 ? "payment-title" : ""}>
                    {step === 1
                      ? "Shipping Information"
                      : step === 2
                      ? "Payment Method"
                      : "Review Your Order"}
                  </h2>

                  {step === 1 && (
                    <>
                  <div className="checkout-v2-grid two">
                    <div className="field">
                      <label htmlFor="firstName">First Name</label>
                      <input
                        id="firstName"
                        value={form.firstName}
                        onChange={(e) => updateField("firstName", e.target.value)}
                        className={errors.firstName ? "has-error" : ""}
                        aria-invalid={!!errors.firstName}
                        aria-describedby={errors.firstName ? "firstName-error" : undefined}
                      />
                      {errors.firstName && (
                        <span id="firstName-error" className="err" role="alert">
                          {errors.firstName}
                        </span>
                      )}
                    </div>
                    <div className="field">
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        id="lastName"
                        value={form.lastName}
                        onChange={(e) => updateField("lastName", e.target.value)}
                        className={errors.lastName ? "has-error" : ""}
                        aria-invalid={!!errors.lastName}
                        aria-describedby={errors.lastName ? "lastName-error" : undefined}
                      />
                      {errors.lastName && (
                        <span id="lastName-error" className="err" role="alert">
                          {errors.lastName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="checkout-v2-grid one">
                    <div className="field">
                      <label htmlFor="email">Email</label>
                      <input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className={errors.email ? "has-error" : ""}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                      />
                      {errors.email && (
                        <span id="email-error" className="err" role="alert">
                          {errors.email}
                        </span>
                      )}
                    </div>
                    <div className="field">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={form.phone}
                        maxLength={10}
                        onChange={(e) =>
                          updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
                        }
                        className={errors.phone ? "has-error" : ""}
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? "phone-error" : undefined}
                      />
                      {errors.phone && (
                        <span id="phone-error" className="err" role="alert">
                          {errors.phone}
                        </span>
                      )}
                    </div>
                    <div className="field">
                      <label htmlFor="addressLine1">Street Address</label>
                      <input
                        id="addressLine1"
                        value={form.addressLine1}
                        onChange={(e) => updateField("addressLine1", e.target.value)}
                        className={errors.addressLine1 ? "has-error" : ""}
                        aria-invalid={!!errors.addressLine1}
                        aria-describedby={errors.addressLine1 ? "addressLine1-error" : undefined}
                      />
                      {errors.addressLine1 && (
                        <span id="addressLine1-error" className="err" role="alert">
                          {errors.addressLine1}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="checkout-v2-grid two">
                    <div className="field">
                      <label htmlFor="city">City</label>
                      <input
                        id="city"
                        value={form.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        className={errors.city ? "has-error" : ""}
                        aria-invalid={!!errors.city}
                        aria-describedby={errors.city ? "city-error" : undefined}
                      />
                      {errors.city && (
                        <span id="city-error" className="err" role="alert">
                          {errors.city}
                        </span>
                      )}
                    </div>
                    <div className="field">
                      <label htmlFor="state">State</label>
                      <select
                        id="state"
                        value={form.state}
                        onChange={(e) => updateField("state", e.target.value)}
                        className={errors.state ? "has-error" : ""}
                        aria-invalid={!!errors.state}
                        aria-describedby={errors.state ? "state-error" : undefined}
                      >
                        <option value="">Select state</option>
                        {STATE_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      {errors.state && (
                        <span id="state-error" className="err" role="alert">
                          {errors.state}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="checkout-v2-grid two">
                    <div className="field">
                      <label htmlFor="postalCode">ZIP Code</label>
                      <input
                        id="postalCode"
                        value={form.postalCode}
                        maxLength={6}
                        onChange={(e) => updateField("postalCode", e.target.value)}
                        className={errors.postalCode ? "has-error" : ""}
                        aria-invalid={!!errors.postalCode}
                        aria-describedby={errors.postalCode ? "postalCode-error" : undefined}
                      />
                      {errors.postalCode && (
                        <span id="postalCode-error" className="err" role="alert">
                          {errors.postalCode}
                        </span>
                      )}
                    </div>
                    <div className="field">
                      <label htmlFor="country">Country</label>
                      <input
                        id="country"
                        value={form.country}
                        onChange={(e) => updateField("country", e.target.value)}
                        className={errors.country ? "has-error" : ""}
                        aria-invalid={!!errors.country}
                        aria-describedby={errors.country ? "country-error" : undefined}
                      />
                      {errors.country && (
                        <span id="country-error" className="err" role="alert">
                          {errors.country}
                        </span>
                      )}
                    </div>
                  </div>
                    </>
                  )}

                  {step === 1 && (
                    <button
                      type="button"
                      className="checkout-v2-primary-btn"
                      onClick={() => validateShipping() && setStep(2)}
                      disabled={!isShippingFormValid}
                    >
                      Continue to Payment
                    </button>
                  )}

                  {step === 2 && (
                    <>
                      <div className="checkout-v2-payment-methods">
                        <label className="checkout-v2-payment-row payment-option">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={paymentMethod === "cod"}
                            onChange={(e) => handlePaymentMethodChange(e.target.value)}
                          />
                          <span className="payment-details">
                            <span className="payment-name">Cash on Delivery</span>
                            <span className="payment-desc">Pay in cash when your order is delivered.</span>
                          </span>
                        </label>
                        <label className="checkout-v2-payment-row payment-option">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="upi"
                            checked={paymentMethod === "upi"}
                            onChange={(e) => handlePaymentMethodChange(e.target.value)}
                          />
                          <span className="payment-details">
                            <span className="payment-name">UPI Payment</span>
                            <span className="payment-desc">Secure instant payment via your UPI app.</span>
                          </span>
                        </label>
                      </div>

                      {paymentMethod === "cod" ? (
                        <p className="checkout-v2-payment-helper">You will pay at delivery.</p>
                      ) : (
                        <div className="checkout-v2-grid one payment-fields">
                          <div className="field">
                            <label htmlFor="upiId">UPI ID</label>
                            <input
                              id="upiId"
                              value={paymentDetails.upiId}
                              onChange={(e) => updatePaymentDetails("upiId", e.target.value)}
                              placeholder="user@upi"
                              className={errors.upiId ? "has-error" : ""}
                              aria-invalid={!!errors.upiId}
                              aria-describedby={errors.upiId ? "upi-error" : undefined}
                            />
                            {errors.upiId && (
                              <span id="upi-error" className="err" role="alert">
                                {errors.upiId}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            className="checkout-v2-secondary-btn checkout-v2-verify-btn"
                            onClick={handleVerifyUpiPayment}
                            disabled={processing || !isValidUpiId}
                          >
                            {processing ? "Verifying..." : "Verify & Pay"}
                          </button>
                          {paymentInfo && (
                            <p className="checkout-v2-payment-success" role="status">
                              {paymentInfo}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="checkout-v2-payment-actions payment-actions">
                        <button
                          type="button"
                          className="checkout-v2-secondary-btn back-btn"
                          onClick={() => setStep(1)}
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          className="checkout-v2-primary-btn review-btn"
                          onClick={() => setStep(3)}
                          disabled={!isPaymentStepValid}
                        >
                          Review Order
                        </button>
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <div className="checkout-v2-review-block">
                        <div className="checkout-v2-review-section">
                          <h4>Shipping Address</h4>
                          <p>{`${form.firstName} ${form.lastName}`.trim() || "—"}</p>
                          <p>{form.addressLine1 || "—"}</p>
                          <p>{`${form.city}, ${form.state} ${form.postalCode}`.trim()}</p>
                          <p>{form.country || "—"}</p>
                        </div>

                        <div className="checkout-v2-review-section">
                          <h4>Payment Method</h4>
                          <p>{paymentMethodLabel}</p>
                        </div>

                        <div className="checkout-v2-review-section">
                          <h4>Order Items</h4>
                          <div className="checkout-v2-review-items">
                            {selectedItems.map((item) => (
                              <div key={item._id} className="checkout-v2-review-item">
                                <span>
                                  {(item.product?.name || "Product") + " x " + item.quantity}
                                </span>
                                <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="checkout-v2-payment-actions">
                        <button
                          type="button"
                          className="checkout-v2-secondary-btn"
                          onClick={() => setStep(2)}
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          className="checkout-v2-primary-btn"
                          onClick={handlePlaceOrder}
                          disabled={processing}
                        >
                          {processing ? "Processing..." : "Place Order"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </section>

              <aside className="checkout-v2-right">
                <div className="checkout-v2-summary-card">
                  <h3>Order Summary</h3>
                  <div className="row">
                    <span>Subtotal</span>
                    <span>₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="row">
                    <span>Shipping</span>
                    <span>₹{totals.shipping.toFixed(2)}</span>
                  </div>
                  <div className="row">
                    <span>Tax</span>
                    <span>₹{totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="row total">
                    <span>Total</span>
                    <span>₹{totals.total.toFixed(2)}</span>
                  </div>
                  <div className="items-note">{selectedItems.length} items in your cart</div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Checkout;
