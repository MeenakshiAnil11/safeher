# 📧 Setup Real Email (Gmail) for SOS Alerts

## Problem
Currently using Mailtrap (test emails only) - need to send real emails to emergency contacts.

## Solution: Configure Gmail

### Step 1: Create App Password

1. **Go to Google Account:**
   - https://myaccount.google.com/
   - Or just Google "my account"

2. **Enable 2-Step Verification:**
   - Security → 2-Step Verification
   - Follow prompts to enable

3. **Create App Password:**
   - Security → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Enter: "SafeHer SOS"
   - Click "Generate"
   - **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

### Step 2: Update Backend .env

Open `backend/.env` and update these lines:

```env
# Replace these Mailtrap lines:
# EMAIL_HOST=sandbox.smtp.mailtrap.io
# EMAIL_PORT=2525
# EMAIL_USER=cd00546b77366b
# EMAIL_PASS=d01f6b259a16fb

# With these Gmail lines:
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM="SafeHer <your-email@gmail.com>"
```

### Step 3: Update mailer.js

Update `backend/config/mailer.js`:

```javascript
transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false, // Use TLS (port 587) or SSL (port 465)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

### Step 4: Restart Backend

```bash
cd backend
npm start
```

Check console for:
```
✅ Mail server ready to send emails
```

## Testing

1. **Send SOS from dashboard**
2. **Check emergency contact's email**
3. **They should receive real email** with:
   - Subject: "🚨 EMERGENCY SOS ALERT"
   - Your name and location
   - Google Maps link

## Troubleshooting

**Problem:** "Invalid login"
- **Solution:** Make sure you're using the App Password, not your regular password

**Problem:** "Less secure app access"
- **Solution:** Use App Passwords (they're secure)

**Problem:** "Connection timeout"
- **Solution:** Check your firewall/antivirus

**Problem:** "534-5.7.9 Application-specific password"
- **Solution:** You need to enable 2-Step Verification first

## Alternative: Other Email Providers

### Outlook/Hotmail:
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
```

### Yahoo:
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
```

### Custom SMTP:
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_USER=your-username
EMAIL_PASS=your-password
```

## After Setup

✅ SOS alerts will send **real emails** to emergency contacts
✅ Emergency contacts will receive emails in their inbox
✅ Emails include GPS location and Google Maps link

## Important Notes

- **Gmail limits:** 500 emails per day (more than enough)
- **App Passwords:** Only generated once, save it securely
- **Security:** App Passwords are secure, your main password stays safe
- **Testing:** Test with your own email first

## Quick Summary

1. Enable 2-Step Verification on Google Account
2. Generate App Password
3. Update `.env` with Gmail credentials
4. Restart backend
5. Test SOS

## That's It! 🎉

Now emergency contacts will receive **real emails** instead of test emails!
