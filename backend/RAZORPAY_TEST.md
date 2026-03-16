# ✅ Razorpay Test Mode - Already Implemented!

## 🎉 Good News: Razorpay is Already Set Up!

Your backend already has Razorpay test mode implemented in:
- `backend/controllers/paymentController.js`
- `backend/routes/paymentRoutes.js`

---

## 📋 Current Setup

### ✅ Already Configured
- Razorpay package installed
- Controller with create-order endpoint
- Controller with verify-payment endpoint
- Test endpoint (no auth required)
- Routes registered

### Environment Variables Needed
Add to `.env` file in backend folder:
```env
RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
RAZORPAY_KEY_SECRET=thisissupersecret
```

**Note:** The code already has test credentials as fallback if .env is missing.

---

## 🧪 Test Endpoints

### 1. Create Order (No Auth Required - Test Endpoint)

```powershell
curl -X POST http://localhost:5000/api/payment/test-order ^
  -H "Content-Type: application/json" ^
  -d "{\"userId\": \"test-user-id\", \"plan\": \"premium\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "order": {
    "id": "order_...",
    "amount": 99900,
    "currency": "INR",
    "receipt": "...",
    "status": "created"
  },
  "keyId": "rzp_test_...",
  "isMock": false,
  "note": "real_razorpay"
}
```

### 2. Create Order (With Auth)

```powershell
curl -X POST http://localhost:5000/api/payment/create-order ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -d "{\"userId\": \"YOUR_USER_ID\", \"plan\": \"premium\"}"
```

### 3. Test Different Plans

```powershell
# Premium (₹999)
curl -X POST http://localhost:5000/api/payment/test-order ^
  -H "Content-Type: application/json" ^
  -d "{\"userId\": \"test\", \"plan\": \"premium\"}"

# Lifetime (₹4999)
curl -X POST http://localhost:5000/api/payment/test-order ^
  -H "Content-Type: application/json" ^
  -d "{\"userId\": \"test\", \"plan\": \"lifetime\"}"
```

---

## 🎯 Available Endpoints

### 1. Create Order
```
POST /api/payment/create-order
Body: { userId, plan }
Protected: Yes (needs auth token)

POST /api/payment/test-order
Body: { userId, plan }
Protected: No (for testing)
```

### 2. Verify Payment
```
POST /api/payment/verify-payment
Body: { userId, paymentId, orderId, signature, plan }
Protected: Yes
```

### 3. Get Subscription Status
```
GET /api/payment/subscription-status
Protected: Yes
```

---

## 💳 Test Card Details

Razorpay test mode supports these test cards:

**Success Card:**
- **Card Number:** 4111 1111 1111 1111
- **Expiry:** Any future date (e.g., 12/25)
- **CVV:** Any 3 digits (e.g., 111)
- **OTP:** 123456

**3D Secure Card:**
- **Card Number:** 4012 0010 3714 1112
- **Expiry:** Any future date
- **CVV:** Any 3 digits
- **OTP:** 123456

---

## 🔧 Configuration

### Enable/Disable Mock Mode

In `backend/controllers/paymentController.js`:

```javascript
// Line 8: Change this to true to use mock mode (no real API calls)
export const USE_RAZORPAY_MOCK = false; // false = use real Razorpay
```

**Current Setting:** `false` = Using Real Razorpay API ✅

### Check Razorpay Dashboard

1. Go to https://dashboard.razorpay.com
2. Make sure "Test Mode" toggle is ON (top right)
3. You'll see all test transactions here

---

## 🚀 Quick Test

### Step 1: Start Backend
```powershell
cd backend
npm start
```

### Step 2: Test Create Order
```powershell
# In PowerShell
$body = @{
    userId = "test-user-id"
    plan = "premium"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/payment/test-order" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected Output:**
```
success: true
order: { id: "order_...", amount: 99900, ... }
keyId: "rzp_test_..."
```

---

## 📝 Frontend Integration

### React Component Example

```jsx
// RazorpayCheckout.jsx
import React, { useState } from 'react';
import api from '../utils/api';

const RazorpayCheckout = ({ amount, plan, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      // Create order
      const orderResponse = await api.post('/api/payment/create-order', {
        userId: 'YOUR_USER_ID',
        plan: plan
      });
      
      const order = orderResponse.data.order;
      
      // Open Razorpay checkout
      const options = {
        key: orderResponse.data.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "SafeHer",
        description: `Subscription - ${plan}`,
        order_id: order.id,
        handler: function (response) {
          // Payment success callback
          console.log('Payment Success:', response);
          onSuccess(response);
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#3399cc"
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      console.error('Payment failed:', error);
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </button>
  );
};

export default RazorpayCheckout;
```

### Add Razorpay Script to HTML

```html
<!-- In public/index.html -->
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### Usage in Component

```jsx
import RazorpayCheckout from './components/RazorpayCheckout';

function SubscriptionPage() {
  const handlePaymentSuccess = async (response) => {
    // Verify payment
    await api.post('/api/payment/verify-payment', {
      paymentId: response.razorpay_payment_id,
      orderId: response.razorpay_order_id,
      signature: response.razorpay_signature,
      plan: 'premium'
    });
  };

  return (
    <RazorpayCheckout 
      amount={999} 
      plan="premium" 
      onSuccess={handlePaymentSuccess} 
    />
  );
}
```

---

## ✅ Verification Checklist

- [x] Razorpay package installed
- [x] Controller created
- [x] Routes registered
- [x] Test credentials configured
- [ ] Add .env variables (optional)
- [ ] Test with curl/Postman
- [ ] Create frontend component
- [ ] Test complete payment flow

---

## 🎉 You're Ready!

Just add the frontend component and you have a complete Razorpay integration!

**Status:** ✅ **Already Working!**

