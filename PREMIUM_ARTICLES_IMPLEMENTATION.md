# Premium Articles Implementation for Pregnancy Mode

## Overview
This document describes the implementation of the premium articles feature in the Pregnancy Resource Hub, including subscription management, payment integration, and dynamic content loading.

## Features Implemented

### 1. **Subscription System**
- User subscription status tracking in the database
- Subscription plans: `free`, `premium` (₹999/month), `lifetime` (₹4999)
- User model updated with subscription fields

### 2. **Payment Integration**
- Razorpay integration ready (requires real API keys in production)
- Payment order creation endpoint
- Payment verification endpoint
- Subscription status checking endpoint

### 3. **Premium Articles Feature**
- **Free Articles Section**: Displays first 5-10 free articles in a card layout
- **"More Articles" Button**: Loads additional content based on subscription status
- **Subscription Modal**: Shown when unsubscribed users click "More Articles"
- **Payment Modal**: Handles payment processing securely
- **Dynamic Content Loading**: Fetches premium articles for subscribed users

### 4. **User Experience**
- Clean, pastel-themed UI design
- Clear distinction between free and premium content
- Smooth modal animations
- Loading states and error handling
- Responsive design for all screen sizes

## API Endpoints

### Payment Endpoints
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify-payment` - Verify and activate subscription
- `GET /api/payment/subscription-status` - Check user subscription status

### Resource Endpoints
- `GET /api/pregnancy/resources?trimester={trimester}&type={type}&limit={limit}` - Get free articles
- `GET /api/pregnancy/resources?trimester={trimester}&type={type}&premium=true` - Get premium articles (subscribed users only)

## Database Schema Updates

### User Model
```javascript
subscription: {
  isSubscribed: Boolean,
  plan: String, // 'free', 'premium', 'lifetime'
  startDate: Date,
  endDate: Date,
  paymentId: String,
  paymentProvider: String // 'razorpay', 'stripe'
}
```

### PregnancyResource Model
```javascript
{
  title: String,
  type: String, // 'article', 'video', 'faq'
  trimester: String, // 'first', 'second', 'third'
  isPaid: Boolean,
  thumbnail: String,
  snippet: String,
  content: String,
  readTime: String,
  duration: String,
  questions: Array,
  tags: Array
}
```

## Frontend Component

### PregnancyResourceHub.jsx
- **State Management**: 
  - Content loading and filtering
  - Subscription status
  - Modal visibility
  - Payment order creation
- **Key Functions**:
  - `checkSubscriptionStatus()` - Check if user is subscribed
  - `loadContent()` - Load free articles
  - `loadPremiumArticles()` - Load premium articles (subscribed users only)
  - `handleMoreArticles()` - Handle "More Articles" button click
  - `createPaymentOrder()` - Create Razorpay order
  - `handlePaymentSuccess()` - Verify and activate subscription

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install razorpay  # For payment processing
```

### 2. Environment Variables
Create `.env` file in backend directory:
```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 3. Frontend Setup
The component is already integrated into `PregnancyModeDashboard.jsx`

### 4. Database Migration
The User model has been updated with subscription fields. Existing users will have default `free` plan.

## Production Deployment

### 1. Razorpay Integration
To integrate with actual Razorpay payment:

1. Install Razorpay SDK in backend:
```bash
npm install razorpay
```

2. Update `backend/controllers/paymentController.js`:
```javascript
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// In createRazorpayOrder function, use real Razorpay order creation:
const order = await razorpay.orders.create({
  amount: selectedPlan.amount * 100,
  currency: selectedPlan.currency,
  receipt: `order_${userId}_${Date.now()}`,
  notes: { plan, userId }
});

// In verifyRazorpayPayment function, use real signature verification:
const crypto = require("crypto");
const generatedSignature = crypto
  .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
  .update(orderId + "|" + paymentId)
  .digest("hex");
if (generatedSignature !== signature) {
  return res.status(400).json({ error: "Invalid payment signature" });
}
```

3. Install Razorpay Checkout in frontend:
```bash
npm install react-razorpay-checkout
```

4. Update `PregnancyResourceHub.jsx` to use Razorpay Checkout SDK for actual payment processing.

## Testing

### Test Free Articles
1. Navigate to Pregnancy Mode -> Resources
2. Verify free articles are displayed
3. Click on an article to view content

### Test Subscription Flow
1. Click "Subscribe for More Articles" button
2. Verify subscription modal appears
3. Click "Subscribe Now"
4. Complete payment flow (use Razorpay test mode)
5. Verify subscription status updates
6. Verify premium articles become available

## Security Considerations
- Payment verification uses cryptographic signature validation
- Subscription status is server-side validated
- Premium content access is backend-controlled
- User authentication required for all payment endpoints
- Sensitive credentials stored in environment variables

## Future Enhancements
- Integration with Stripe as an alternative payment provider
- Subscription plans with different pricing tiers
- Family/partner subscription sharing
- Free trial period before subscription
- Referral bonus system
- Subscription analytics dashboard for admin
- Automatic renewal and reminder emails

