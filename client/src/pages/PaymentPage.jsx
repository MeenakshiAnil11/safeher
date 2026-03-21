import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { setSubscribedLocal } from "../services/subscriptionAccess";

export default function PaymentPage() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState("premium");
  const [loading, setLoading] = useState(false);

  const plans = {
    premium: {
      name: "Premium - 1 Month",
      price: 999,
      duration: "1 month",
      features: [
        "Access to all premium articles",
        "Expert guides and insights",
        "Priority support",
        "Cancel anytime"
      ]
    },
    lifetime: {
      name: "Lifetime Premium",
      price: 4999,
      duration: "Lifetime",
      features: [
        "Access to all premium articles forever",
        "Expert guides and insights",
        "Priority support",
        "All future updates included",
        "Best value for money"
      ]
    }
  };

  const handlePayNow = async () => {
    try {
      setLoading(true);
      console.log("🔑 Creating payment order for plan:", plan);
      
      // Check if user is authenticated
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "null");
      console.log("🔍 Token exists:", !!token);
      console.log("🔍 User from localStorage:", user);
      
      const response = await api.post("/payment/test-order", {
        plan,
      });
      
      console.log("✅ Payment order response:", response.data);
      
      if (response.data.success) {
        const { order, keyId, isMock, note } = response.data;
        
        // Check if we're in mock mode
        const isMockMode = isMock === true || (note && note.includes("mock"));
        
        if (isMockMode) {
          // For mock mode, simulate successful payment
          console.log("💰 Using mock payment mode - simulating successful payment");
          
          // Show a proper mock payment modal
          const confirmPayment = window.confirm(
            "📋 Mock Payment Mode\n\n" +
            "In production, this would open Razorpay checkout.\n\n" +
            "Price: ₹" + plans[plan].price + "\n" +
            "Plan: " + plans[plan].name + "\n\n" +
            "Click OK to simulate successful payment."
          );
          
          if (!confirmPayment) {
            setLoading(false);
            return;
          }
          
          // Simulate payment success
          const mockPaymentId = `mock_pay_${Date.now()}`;
          const mockSignature = "mock_signature_for_testing";
          
          console.log("✅ Simulating successful payment...");
          handlePaymentSuccess(mockPaymentId, order.id, mockSignature);
          return;
        }
        
        // Configure Razorpay options
        const options = {
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          name: "SafeHer Premium",
          description: `Premium Subscription - ${plans[plan].name}`,
          order_id: order.id,
          handler: function (response) {
            // Payment successful
            handlePaymentSuccess(response.razorpay_payment_id, order.id, response.razorpay_signature);
          },
          prefill: {
            name: "User Name",
            email: "user@example.com",
            contact: "9999999999"
          },
          notes: {
            address: "SafeHer Corporate Office",
            plan: plan
          },
          theme: {
            color: "#EC4899" // Pink color matching the app theme
          }
        };

        // Open Razorpay checkout
        console.log("window.Razorpay available:", !!window.Razorpay);
        if (window.Razorpay) {
          console.log("Opening Razorpay checkout with options:", options);
          const razorpayInstance = new window.Razorpay(options);
          razorpayInstance.open();
          
          razorpayInstance.on('payment.failed', function (response) {
            alert(`Payment failed: ${response.error.description}`);
            setLoading(false);
          });
        } else {
          alert("Razorpay is not loaded. Please refresh the page and try again.");
          setLoading(false);
        }
        
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      console.error("Error creating payment order:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      if (error.response?.status === 404) {
        alert("Backend server is not running. Please start the backend server first.");
      } else if (error.response?.status === 500) {
        alert("Server error. Please check the backend logs.");
      } else {
        alert("Failed to create payment order. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (paymentId, orderId, signature) => {
    try {
      // Use protected endpoint to get real user from JWT token
      const response = await api.post("/payment/verify-payment", {
        paymentId,
        orderId,
        signature,
        plan,
      });
      
      if (response.data.success) {
        // Update localStorage to track subscription
        setSubscribedLocal(true);
        localStorage.setItem("subscriptionPlan", plan);
        
        alert("Payment successful! Subscription activated. You will be redirected to articles.");
        
        // Navigate back to the conceive dashboard with articles tab active
        setTimeout(() => {
          navigate("/period-tracking/conceive?tab=articles");
        }, 1000);
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      alert("Payment verification failed. Please contact support.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Choose Your Plan
          </h1>
          <p className="text-gray-600">
            Unlock premium articles and expert guides for your fertility journey
          </p>
        </div>

        {/* Plan - Only ₹999 */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">💎</div>
              <h3 className="text-3xl font-bold text-white mb-2">Premium Plan</h3>
              <p className="text-purple-100">Get full access to all premium articles</p>
            </div>
            
            <div className="bg-white bg-opacity-20 rounded-xl p-6 mb-6">
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-white">₹999</div>
                <div className="text-purple-100 text-lg">/month</div>
              </div>
            </div>

            <div className="space-y-3">
              {plans.premium.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl">✓</span>
                  <span className="text-white">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pay Now Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handlePayNow}
            disabled={loading}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-12 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : `Pay Now - ₹${plans[plan].price}`}
          </button>
        </div>

        {/* Security Note */}
        <div className="text-center text-gray-600">
          <p className="flex items-center justify-center gap-2">
            <span className="text-green-500">🔒</span>
            <span>Secure payment powered by Razorpay</span>
          </p>
        </div>
      </div>
    </div>
  );
}

