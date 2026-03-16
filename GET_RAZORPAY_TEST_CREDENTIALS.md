# How to Get Razorpay Test Credentials

## The Current Issue
The app is currently using **fake/invalid** Razorpay credentials:
- Key ID: `rzp_test_1DP5mmOIF5G5ag` (this might be valid)
- Key Secret: `thisissupersecret` (❌ this is fake)

## Solution: Get Real Test Credentials

### Step 1: Sign up for Razorpay
1. Go to: https://razorpay.com/signup
2. Sign up with your email
3. Choose "Test Mode" (free for development)

### Step 2: Get Test API Keys
1. Login to: https://dashboard.razorpay.com
2. Go to **Settings** → **API Keys**
3. Click **Generate Test Key** if not already generated
4. You'll see:
   - **Key ID**: `rzp_test_xxxxxxxxxxxxx`
   - **Key Secret**: `xxxxxxxxxxxxx` (copy this!)

### Step 3: Update Backend .env
Open `backend/.env` and add:
```env
RAZORPAY_KEY_ID=rzp_test_your_actual_key_id_here
RAZORPAY_KEY_SECRET=your_actual_secret_key_here
```

### Step 4: Restart Backend
```bash
cd backend
npm start
```

Look for this message:
```
✅ Razorpay initialized (will use test mode)
📞 Creating real Razorpay order...
✅ Real Razorpay order created: order_xxx
```

## Testing with Razorpay Test Cards

Once you have real credentials, you can use these test cards:

### Successful Payment
- **Card Number**: `4111 1111 1111 1111`
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits (e.g., 123)
- **Name**: Any name

### Failed Payment
- **Card Number**: `4000 0000 0000 0002`
- **Expiry**: Any future date
- **CVV**: Any 3 digits

## Quick Alternative: Use Razorpay Test Dashboard
If you don't want to sign up yet, Razorpay provides a sandbox:
- Visit: https://razorpay.com/sandbox/
- Use their test environment

## Current Status
After restarting backend:
1. It will TRY to use real Razorpay (will fail with current fake credentials)
2. Then it will FALL BACK to mock mode
3. The popup will appear but you'll see "Mock Payment Mode" alert

## To Enable Real Test Mode
1. Get real credentials (follow steps above)
2. Update `.env` file
3. Restart backend
4. Payment flow will open real Razorpay checkout popup

