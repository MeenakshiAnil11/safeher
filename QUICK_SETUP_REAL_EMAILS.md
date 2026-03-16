# 🔧 QUICK SETUP GUIDE - Real Email Delivery

## Current Status ✅
- ✅ Emergency contacts added (3 contacts)
- ✅ Backend configured for Gmail
- ⚠️ Need to update .env with your Gmail credentials

## Step 1: Get Gmail App Password

1. **Go to:** https://myaccount.google.com/
2. **Security → 2-Step Verification** (enable if not already)
3. **Security → App passwords**
4. **Generate new password** for "SafeHer SOS"
5. **Copy the 16-character password** (like: `abcd efgh ijkl mnop`)

## Step 2: Update .env File

Open `backend/.env` and replace these lines:

```env
# REPLACE THESE LINES:
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=cd00546b77366b
EMAIL_PASS=d01f6b259a16fb
EMAIL_FROM="SafeHer <no-reply@safeher.com>"

# WITH THESE LINES:
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM="SafeHer <your-email@gmail.com>"
```

## Step 3: Update Emergency Contacts

Edit `backend/add-real-contacts.js` and replace the email addresses:

```javascript
const realContacts = [
  {
    name: "Mom",
    number: "+1234567890",
    relationship: "Family",
    email: "your-mom@gmail.com", // ← Replace with real email
    notes: "Primary emergency contact"
  },
  {
    name: "Best Friend", 
    number: "+0987654321",
    relationship: "Friend",
    email: "your-friend@gmail.com", // ← Replace with real email
    notes: "Secondary emergency contact"
  }
];
```

Then run:
```bash
node add-real-contacts.js
```

## Step 4: Test Everything

1. **Start backend:**
   ```bash
   npm start
   ```

2. **Start frontend:**
   ```bash
   cd ../client
   npm start
   ```

3. **Test SOS:**
   - Go to: http://localhost:3000
   - Login → Dashboard
   - Click SOS button
   - Check backend console for: `✅ Email sent successfully`

4. **Check emergency contacts' inboxes:**
   - They should receive real emails
   - Subject: "🚨 EMERGENCY SOS ALERT"
   - Includes your location and Google Maps link

## Expected Result

When you click SOS:
- ✅ Backend fetches all emergency contacts
- ✅ Sends real emails to their Gmail inboxes
- ✅ Emergency contacts receive emails instantly
- ✅ Emails include GPS location and maps link

## Troubleshooting

**Problem:** "Invalid login"
- **Solution:** Use App Password, not your regular Gmail password

**Problem:** "No emails received"
- **Solution:** Check spam folder, verify email addresses are correct

**Problem:** "Connection failed"
- **Solution:** Check firewall, try port 465 instead of 587

## Quick Commands

```bash
# 1. Update .env with Gmail credentials
# 2. Update emergency contacts
node add-real-contacts.js

# 3. Start backend
npm start

# 4. Start frontend (new terminal)
cd ../client && npm start

# 5. Test SOS at http://localhost:3000
```

## That's It! 🎉

Your SOS will now send **real emails** to emergency contacts' inboxes instead of test emails!
