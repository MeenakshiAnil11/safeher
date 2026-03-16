# SOS Email & SMS Setup Guide

## Issue Identified

The SOS button shows "sent successfully" but no emails or SMS are being sent to emergency contacts. This is because:

1. **Field Name Mismatch**: The Contact model uses `number` field, but the code was looking for `phone` - **FIXED** ✅
2. **Missing Environment Variables**: Email and SMS services require configuration
3. **Missing Error Handling**: Better logging and error reporting added

## Changes Made

### 1. Fixed Field Name Issue (backend/controllers/sosController.js)
- Changed `c.phone` to `c.number` to match the Contact model schema
- Added better logging to track email/SMS sending

### 2. Improved Email Configuration (backend/config/mailer.js)
- Added detailed logging for email sending
- Better error messages
- Shows when emails are skipped vs when they fail

### 3. Improved SMS Configuration (backend/config/sms.js)
- Added detailed logging for SMS sending
- Better error messages
- Shows when SMS is skipped vs when it fails

## Required Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

### For Email (using Nodemailer with SMTP)

```env
# Email Configuration (using any SMTP provider like Gmail, Mailtrap, etc.)
EMAIL_HOST=smtp.gmail.com                    # SMTP host
EMAIL_PORT=587                                # SMTP port (587 for TLS)
EMAIL_USER=your-email@gmail.com               # Your email
EMAIL_PASS=your-app-password                  # Email password or app password
EMAIL_FROM=SafeHer <no-reply@safeher.com>    # Sender name and email
DISABLE_EMAILS=false                          # Set to "true" to disable emails
```

### For SMS (using Twilio)

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your-account-sid           # Twilio Account SID
TWILIO_AUTH_TOKEN=your-auth-token            # Twilio Auth Token
TWILIO_FROM=+1234567890                       # Your Twilio phone number
```

### Example .env File

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/safeher

# Server
PORT=5000

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=SafeHer <no-reply@safeher.com>
DISABLE_EMAILS=false

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM=
```

## Setup Instructions

### Option 1: Test with Gmail (Quick Setup)

1. Enable 2-factor authentication on your Gmail account
2. Generate an app password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "SafeHer App"
   - Copy the generated password
3. Update your `.env` file:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password-here
   ```

### Option 2: Use Mailtrap (For Testing)

1. Sign up for free at https://mailtrap.io
2. Create an inbox
3. Copy the SMTP credentials
4. Update your `.env` file:
   ```env
   EMAIL_HOST=sandbox.smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_USER=your-mailtrap-user
   EMAIL_PASS=your-mailtrap-pass
   ```

### Option 3: Use SendGrid (Production)

1. Sign up at https://sendgrid.com
2. Create an API key
3. Use SendGrid's SMTP:
   ```env
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASS=your-sendgrid-api-key
   ```

## Testing SMS with Twilio

1. Sign up for free at https://www.twilio.com
2. Get your Account SID and Auth Token from the dashboard
3. Get a phone number
4. Update your `.env` file:
   ```env
   TWILIO_ACCOUNT_SID=your-account-sid
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_FROM=+1234567890
   ```

## Testing the SOS Functionality

1. Make sure you have contacts with emails/phone numbers in your database
2. Start your backend server:
   ```bash
   cd backend
   npm start
   ```
3. Check the console logs for:
   - Email sending status
   - SMS sending status
   - Any errors

4. Test by clicking the SOS button in the app
5. Check the backend console for logs like:
   ```
   📧 Sending emails to 2 contacts: ['contact1@email.com', 'contact2@email.com']
   ✅ Email sent successfully to contact1@email.com. Message ID: <message-id>
   📱 Sending SMS to 2 contacts: ['+1234567890', '+0987654321']
   ✅ SMS sent successfully to +1234567890. Message SID: SM...
   ```

## Troubleshooting

### Emails not sending?
1. Check if `DISABLE_EMAILS=true` in your `.env`
2. Verify EMAIL_* variables are set correctly
3. Check the backend console for error messages
4. Make sure your SMTP credentials are correct
5. For Gmail: Use an app password, not your regular password

### SMS not sending?
1. Check if TWILIO_* variables are set
2. Make sure you have a verified Twilio phone number
3. Check the backend console for error messages
4. Verify your Twilio account has credits

### No contacts found?
1. Make sure you have added emergency contacts via the app
2. Verify contacts have email or phone number filled in
3. Check the database to see if contacts exist for the user

## API Response Format

After sending SOS, you'll receive:

```json
{
  "ok": true,
  "log": { /* SOS log details */ },
  "message": "SOS alert sent successfully",
  "contactsNotified": {
    "email": 2,
    "sms": 2,
    "total": 2
  }
}
```

## Important Notes

- **Field Name**: The Contact model uses `number` field for phone numbers, not `phone`
- **Silent Failures**: Previously, errors were caught but not shown to users. Now they are logged in console
- **Environment Variables**: Must be set before starting the server
- **Testing**: Use Mailtrap or Mailtrap for safe testing without sending real emails
