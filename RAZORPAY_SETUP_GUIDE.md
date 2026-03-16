# Razorpay Integration Setup Guide

## Current Status
The Razorpay integration has been implemented but the provided credentials are not working. The system is currently running in mock mode for testing.

## Getting Correct Razorpay Credentials

### Step 1: Create Razorpay Account
1. Go to [https://razorpay.com/](https://razorpay.com/)
2. Sign up for a free account
3. Complete the verification process

### Step 2: Get API Keys
1. Login to your Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Generate **Test Keys** (for development)
4. Copy the **Key ID** and **Key Secret**

### Step 3: Update Backend Configuration
Replace the credentials in `backend/controllers/paymentController.js`:

```javascript
// Replace these with your actual Razorpay credentials
razorpay = new Razorpay({
  key_id: "rzp_test_YOUR_ACTUAL_KEY_ID",
  key_secret: "YOUR_ACTUAL_KEY_SECRET",
});
```

### Step 4: Test the Integration
1. Start the backend server: `cd backend && npm start`
2. Start the frontend: `cd client && npm start`
3. Navigate to Pregnancy Mode → Resources
4. Click "Subscribe for More Articles"
5. Click "Subscribe Now"
6. The Razorpay checkout should open

## Test Payment Details (Razorpay Test Mode)
When testing, use these test card details:

**Successful Payment:**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- Name: Any name

**Failed Payment:**
- Card Number: `4000 0000 0000 0002`
- Expiry: Any future date
- CVV: Any 3 digits

## Current Implementation Features

### ✅ Completed
- Backend payment controller with Razorpay SDK
- Frontend Razorpay Checkout integration
- Subscription status management
- Payment verification with signature validation
- Mock mode fallback for testing

### 🔧 What Works Now
- Subscription modal displays correctly
- Payment order creation (in mock mode)
- User subscription status tracking
- Premium article access control

### 🚀 Next Steps
1. Get valid Razorpay credentials
2. Update the credentials in the backend
3. Test the complete payment flow
4. Deploy to production with live credentials

## Troubleshooting

### Issue: "Authentication failed"
- **Cause**: Invalid Razorpay credentials
- **Solution**: Get correct API keys from Razorpay dashboard

### Issue: "Razorpay is not loaded"
- **Cause**: Razorpay script not loaded in browser
- **Solution**: Check if the script is added to `public/index.html`

### Issue: Payment modal doesn't open
- **Cause**: JavaScript errors or network issues
- **Solution**: Check browser console for errors

## Production Deployment
For production:
1. Use **Live Keys** instead of test keys
2. Update the key_id in the frontend component
3. Ensure HTTPS is enabled
4. Test with real payment methods

## Support
If you need help with Razorpay setup:
- Razorpay Documentation: [https://razorpay.com/docs/](https://razorpay.com/docs/)
- Razorpay Support: [https://razorpay.com/support/](https://razorpay.com/support/)
