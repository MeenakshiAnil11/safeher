# SOS Troubleshooting Guide

## ❌ Problem: No emails or SMS are being sent

### Root Causes Identified

1. **Most users have NO emergency contacts** - This is the main issue!
2. **Email configuration is set to Mailtrap (testing only)** - Real emails won't be delivered
3. **SMS is not configured** - No Twilio credentials

## 🔍 How to Diagnose

### Step 1: Check if you have emergency contacts

Run this command:
```bash
cd backend
node debug-sos.js
```

**Expected Output:**
```
✅ Found X emergency contact(s):
  Contact 1:
    Name: John Doe
    Phone: +1234567890
    Email: john@example.com
```

**If you see "❌ No emergency contacts found":**
- You need to add emergency contacts first
- Continue to Step 2

### Step 2: Add Test Emergency Contacts

**Option A: Via the App**
1. Login to the app
2. Go to "My Emergency Contacts" page
3. Click "Add Contact"
4. Enter:
   - Name: "Test Contact"
   - Phone: "+1234567890"
   - Email: "test@example.com"
   - Relationship: "Test"

**Option B: Via Command Line**
```bash
cd backend
node add-test-contacts-to-user.js your-email@gmail.com
```

Replace `your-email@gmail.com` with your actual email address.

### Step 3: Check Email Configuration

Check `backend/.env` file:

```env
# Should be set for real email delivery
EMAIL_HOST=smtp.gmail.com  # ❌ Currently: sandbox.smtp.mailtrap.io
EMAIL_PORT=587
EMAIL_USER=your-real-email@gmail.com
EMAIL_PASS=your-app-password
DISABLE_EMAILS=false
```

**Mailtrap is for TESTING ONLY** - emails won't be delivered to real inboxes!

### Step 4: Configure Gmail for Real Emails

1. **Enable 2FA on Gmail**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "SafeHer App"
   - Copy the generated password

3. **Update backend/.env**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-real-email@gmail.com
   EMAIL_PASS=your-generated-app-password
   DISABLE_EMAILS=false
   ```

4. **Restart backend server**
   ```bash
   cd backend
   npm start
   ```

### Step 5: Test SOS Button

1. Make sure you have at least one emergency contact
2. Click the SOS button in the app
3. Check backend console for logs:
   ```
   📧 Sending emails to 1 contacts: ['test@example.com']
   ✅ Email sent successfully to test@example.com. Message ID: <id>
   ```
4. Check your email inbox (and spam folder)

## 🧪 Testing Checklist

### Before Testing
- [ ] Added at least one emergency contact
- [ ] Contact has email and/or phone number
- [ ] Gmail app password generated
- [ ] EMAIL_* variables updated in backend/.env
- [ ] Backend server restarted
- [ ] Location permission granted in browser

### During Testing
- [ ] Click SOS button
- [ ] Confirm location permission popup
- [ ] See "Sending SOS..." message
- [ ] See success message in frontend
- [ ] Check backend console for logs
- [ ] Check email inbox for SOS alert

### Expected Results

**Backend Console:**
```
📍 Getting current location for SOS...
✅ Location obtained: { latitude: 40.7128, longitude: -74.0060 }
🚨 Sending SOS with data: { lat: 40.7128, lng: -74.0060 }
📧 Sending emails to 1 contacts: ['contact@example.com']
✅ Email sent successfully to contact@example.com. Message ID: <id>
```

**Email Received:**
- Subject: "🚨 EMERGENCY SOS ALERT - Immediate Action Required"
- Contains: GPS coordinates
- Contains: Google Maps link
- Contains: User information

## 🐛 Common Errors

### Error: "No emergency contacts found"
**Solution:** Add at least one emergency contact via the app or database

### Error: "Location permission denied"
**Solution:** 
- Enable location in browser settings
- Click "Allow" when browser asks for location
- Use HTTPS (required for geolocation)

### Error: Emails not sending
**Possible causes:**
1. `DISABLE_EMAILS=true` → Set to `false`
2. `EMAIL_PASS` not set → Add Gmail app password
3. Using Mailtrap → Switch to Gmail for real emails
4. Wrong credentials → Check EMAIL_USER and EMAIL_PASS

### Error: SMS not sending
**Possible causes:**
1. `TWILIO_*` variables not set → Configure Twilio (optional)
2. No phone numbers in contacts → Add phone numbers
3. Twilio account has no credits → Add credits to Twilio account

## 💡 Quick Fixes

### Fix 1: Add Test Contacts (Fastest)

```bash
cd backend
node add-test-contacts-to-user.js your-email@gmail.com
```

### Fix 2: Update Email Config

1. Edit `backend/.env`:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   DISABLE_EMAILS=false
   ```

2. Restart backend:
   ```bash
   cd backend
   npm start
   ```

### Fix 3: Add Contact via API

```javascript
POST /api/contacts
{
  "name": "Emergency Contact",
  "number": "+1234567890",
  "email": "contact@example.com"
}
```

## 📊 Diagnostic Commands

```bash
# Check configuration
cd backend
node test-sos-config.js

# Check contacts
cd backend
node debug-sos.js

# Add test contacts
cd backend
node add-test-contacts-to-user.js your-email@gmail.com
```

## ✅ Verification Steps

1. **Check contacts exist:**
   ```bash
   node backend/debug-sos.js
   ```
   Look for: "✅ Found X emergency contact(s)"

2. **Check email config:**
   ```bash
   node backend/test-sos-config.js
   ```
   Look for: "✅ Email configuration complete!"

3. **Test SOS:**
   - Click SOS button
   - Check backend console
   - Check email inbox

## 🎯 Expected Behavior

When everything is configured correctly:

1. **User clicks SOS button**
   - Browser asks for location permission
   - GPS coordinates obtained

2. **Backend receives request**
   - Validates location
   - Fetches emergency contacts
   - Sends emails
   - Sends SMS (if configured)
   - Creates SOS log

3. **Contacts receive:**
   - Email with emergency details
   - SMS with emergency details (if configured)
   - Google Maps link to location

4. **User sees:**
   - Success message
   - Number of contacts notified
   - Timestamp

## 📞 Still Having Issues?

1. Check backend console logs
2. Check browser console for errors
3. Verify contacts exist in database
4. Verify email credentials are correct
5. Check spam folder
6. Try with different email provider

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Backend console shows "Email sent successfully"
- ✅ Email appears in inbox
- ✅ Success message in frontend
- ✅ Google Maps link works
- ✅ All contacts received alert

