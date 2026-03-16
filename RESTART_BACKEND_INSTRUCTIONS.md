# 🚨 Restart Backend Server

## The Issue
The 404 error for `/api/auth/forgot-password` occurs because the backend server is running with old code. You need to restart it to load the new routes.

## Steps to Fix

### 1. Stop the current backend server
If you have the backend running in a terminal:
- Press `Ctrl + C` to stop it

### 2. Start the backend again
```bash
cd backend
npm start
```

Or if you prefer the dev mode (auto-restart on changes):
```bash
cd backend
npm run dev
```

### 3. Verify it's working
Look for these messages in the console:
```
✅ Firebase Admin initialized successfully
✅ Mail server ready to send emails
🚀 Server running on port 5000
```

### 4. Test the endpoint
Open your browser and go to:
```
http://localhost:3000/forgot-password
```

Enter an email and click "Send reset link". You should see:
- ✅ Success message
- Backend console shows: `✅ Password reset email sent to ...`

## Quick Commands

**Windows (PowerShell):**
```powershell
# Navigate to backend
cd D:\MINIPROJECT\safeher-project4\backend

# Start server
npm start
```

**Or use the existing terminal:**
1. Find your backend terminal window
2. Press `Ctrl + C` to stop
3. Type `npm start` to restart

## What Was Fixed

✅ Added `forgotPassword` function to backend
✅ Added `resetPassword` function to backend  
✅ Added routes: `/api/auth/forgot-password` and `/api/auth/reset-password`
✅ Fixed Firebase Admin initialization
✅ Email configuration working

## After Restarting

Test the forgot password flow:
1. Go to http://localhost:3000/forgot-password
2. Enter an email
3. Click "Send reset link"
4. Check backend logs for email sending confirmation

