# 🚨 Fix SOS Issue Now - Step by Step

## The Problem
Emails and SMS are not being sent because:
1. ❌ You don't have emergency contacts
2. ❌ Email is configured to Mailtrap (testing only)
3. ❌ Need to switch to real Gmail configuration

## Quick Fix (5 Minutes)

### Step 1: Add Emergency Contacts

Run this command:
```bash
cd backend
node add-test-contacts-to-user.js
```

Then enter your email when prompted, OR:

Manually add via the app:
1. Go to "My Emergency Contacts" in the app
2. Click "Add Contact"
3. Add at least one contact with email

### Step 2: Configure Real Email (Gmail)

**Option A: Use Gmail (Recommended)**

1. Go to: https://myaccount.google.com/apppasswords
2. Login and generate an app password
3. Edit `backend/.env` and add:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=xxxx-xxxx-xxxx-xxxx
DISABLE_EMAILS=false
```

**Option B: Keep Mailtrap for Testing**

Mailtrap is fine for testing - just know emails won't go to real inboxes.
Check: https://mailtrap.io/inboxes

### Step 3: Restart Backend

```bash
cd backend
npm start
```

### Step 4: Test SOS

1. Click SOS button in app
2. Allow location permission
3. Check backend console for logs
4. Check Mailtrap inbox or your real email

## Status Check

Run this to verify:
```bash
cd backend
node debug-sos.js
```

Look for:
- ✅ "Found X emergency contact(s)"
- ✅ Contacts have email/phone
- ✅ Email configuration complete

## That's It!

After these steps, SOS will send real emails/SMS to your emergency contacts.

