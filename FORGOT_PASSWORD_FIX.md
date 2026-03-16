# Forgot Password Fix

## Issue
The "send reset link" functionality was not working because the backend endpoint was missing.

## Changes Made

### 1. Backend Controller (`backend/controllers/authController.js`)
✅ Added `forgotPassword` function:
- Generates secure random token
- Sets 1-hour expiration
- Sends email with reset link
- Security best practice: Doesn't reveal if email exists

✅ Added `resetPassword` function:
- Validates reset token
- Updates user password
- Clears reset token after use

### 2. Backend Routes (`backend/routes/authRoutes.js`)
✅ Added routes:
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### 3. Frontend Fix (`client/src/pages/ForgotPassword.jsx`)
✅ Fixed missing `<input>` tag syntax

## How It Works

### Forgot Password Flow:
1. User enters email on `/forgot-password` page
2. Backend generates secure token and saves to database
3. Email is sent with reset link
4. User clicks link → goes to `/reset-password/:token`
5. User enters new password
6. Backend validates token and updates password

### Email Template
The reset email includes:
- Clickable "Reset Password" button
- Plain link as backup
- 1-hour expiration notice
- Security notice

## Testing

### 1. Check Email Configuration
Make sure your `.env` file has email configured:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="SafeHer <your-email@gmail.com>"
```

### 2. Test Forgot Password
1. Go to http://localhost:3000/forgot-password
2. Enter an existing user's email
3. Click "Send reset link"
4. Check backend console for: `✅ Password reset email sent to ...`
5. Check email inbox for the reset link

### 3. Test Reset Password
1. Click the reset link from email
2. You'll be redirected to `/reset-password/:token`
3. Enter new password
4. Click reset
5. Should redirect to login

## Troubleshooting

### "Email not configured" error
**Check:** Backend console for email configuration errors
**Fix:** Update `.env` with correct email settings

### Email not received
**Check:** 
- Spam folder
- Email provider security settings
- Backend logs for email errors

**Gmail users:** Need to enable "Less secure app access" or use App Password

### "Invalid or expired reset token" error
**Cause:** Token expired (1 hour limit) or already used
**Fix:** Request a new reset link

## Security Features
✅ Tokens expire in 1 hour
✅ One-time use tokens (cleared after use)
✅ Don't reveal if email exists (security best practice)
✅ Secure random token generation
✅ Token validation before password update

## Files Modified
- ✅ `backend/controllers/authController.js` - Added forgot/reset password functions
- ✅ `backend/routes/authRoutes.js` - Added forgot/reset password routes
- ✅ `client/src/pages/ForgotPassword.jsx` - Fixed input tag

## Next Steps
You may want to create a Reset Password page component if it doesn't exist yet:
`client/src/pages/ResetPassword.jsx`

