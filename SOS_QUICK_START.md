# SOS Feature - Quick Start Guide

## ✅ Implementation Complete

The SOS feature has been fully implemented with location tracking, email, and SMS notifications.

## 📁 Files Created/Modified

### Backend
- ✅ `backend/routes/sosRoutes.js` - Added `/api/sos/send` endpoint
- ✅ `backend/controllers/sosController.js` - Added `sendSOS` function
- ✅ `backend/config/mailer.js` - Enhanced error handling
- ✅ `backend/config/sms.js` - Enhanced error handling

### Frontend
- ✅ `client/src/components/SOSButtonNew.jsx` - New SOS button component
- ✅ `client/src/components/SOSTestUtils.js` - Test utilities
- ✅ `client/src/pages/SOSTest.jsx` - Test page

### Documentation
- ✅ `SOS_IMPLEMENTATION_GUIDE.md` - Complete guide
- ✅ `SOS_EMAIL_SMS_SETUP.md` - Email/SMS setup
- ✅ `SOS_QUICK_START.md` - This file

## 🚀 Quick Setup

### 1. Configure Environment Variables

Create `backend/.env` file:

```env
MONGO_URI=mongodb://localhost:27017/safeher
PORT=5000

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=SafeHer <no-reply@safeher.com>
DISABLE_EMAILS=false

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_FROM=+1234567890
```

### 2. Gmail Setup (Quick)

1. Enable 2FA on Gmail
2. Generate app password: https://myaccount.google.com/apppasswords
3. Copy password to `EMAIL_PASS` in `.env`

### 3. Add Emergency Contacts

Via the app or database:

```javascript
// Example via API
POST /api/contacts
{
  "name": "Emergency Contact",
  "number": "+1234567890",
  "email": "contact@example.com",
  "relationship": "Family"
}
```

### 4. Test SOS Button

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd client && npm start`
3. Open app and click SOS button
4. Confirm location permission
5. Check backend console for logs
6. Verify emails/SMS received

## 📱 Usage

### In Your React App

```jsx
import SOSButtonNew from './components/SOSButtonNew';

function MyComponent() {
  return (
    <SOSButtonNew 
      onSuccess={(data) => console.log('Success:', data)}
      onError={(error) => console.error('Error:', error)}
    />
  );
}
```

### Test Page

Navigate to `/sos-test` in your app (after adding route to `App.js`).

## 🔍 How It Works

1. **User clicks SOS button**
   - Browser requests location permission
   - Gets GPS coordinates

2. **Confirmation dialog**
   - User confirms sending SOS
   - Shows what will happen

3. **Backend processing**
   - Validates location data
   - Fetches user emergency contacts
   - Creates SOS log entry
   - Sends emails via Nodemailer
   - Sends SMS via Twilio
   - Returns detailed results

4. **Response**
   - Shows success message
   - Displays contacts notified
   - Provides Google Maps link

## 📧 Email Notification Example

Emergency contacts receive:

**Subject:** 🚨 EMERGENCY SOS ALERT - Immediate Action Required

**Content:**
- Name of person in emergency
- Exact GPS coordinates
- Timestamp
- Clickable Google Maps link
- Instructions to respond

## 📱 SMS Notification Example

Emergency contacts receive:

```
🚨 EMERGENCY SOS ALERT

[Name] needs immediate help!

Location: 40.7128, -74.0060
Time: 12/25/2024, 3:30:00 PM

Open in Maps: https://maps.google.com/?q=40.7128,-74.0060

Please respond immediately or call emergency services.
```

## 🧪 Testing

### Test with Sample Contacts

```bash
# Add test contacts to database
node backend/add-test-contacts.js
```

### Check Console Logs

Backend should show:
```
📧 Sending emails to 2 contacts: ['email1@example.com', 'email2@example.com']
✅ Email sent successfully to email1@example.com. Message ID: <id>
📱 Sending SMS to 2 contacts: ['+1234567890', '+1987654321']
✅ SMS sent successfully to +1234567890. Message SID: SM...
```

## ⚠️ Troubleshooting

### "Location permission denied"
- Enable location in browser settings
- Use HTTPS (required for geolocation)

### "No emergency contacts found"
- Add at least one contact via `/api/contacts`
- Include email and/or phone number

### Emails not sending
- Check `EMAIL_*` variables in `.env`
- Ensure `DISABLE_EMAILS=false`
- Use app password for Gmail (not regular password)

### SMS not sending
- Check `TWILIO_*` variables in `.env`
- Verify Twilio account has credits
- Use E.164 phone number format (+1234567890)

## 📚 API Reference

### Endpoint
```
POST /api/sos/send
```

### Request
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "message": "Optional message"
}
```

### Response
```json
{
  "success": true,
  "message": "SOS alert sent successfully",
  "data": {
    "logId": "...",
    "location": { "latitude": 40.7128, "longitude": -74.0060 },
    "contactsNotified": { "total": 2, "emails": 2, "sms": 1 },
    "results": { ... }
  }
}
```

## 🎯 Next Steps

1. Configure email (Gmail recommended for testing)
2. Configure SMS (Twilio recommended)
3. Add real emergency contacts
4. Test SOS button functionality
5. Deploy to production

## 📖 Additional Documentation

- `SOS_IMPLEMENTATION_GUIDE.md` - Detailed implementation
- `SOS_EMAIL_SMS_SETUP.md` - Email/SMS configuration options
- `backend/controllers/sosController.js` - Source code

## ✅ Implementation Checklist

- [x] Location permission handling
- [x] GPS coordinate retrieval
- [x] Confirmation dialog
- [x] Backend API endpoint
- [x] Email notifications
- [x] SMS notifications
- [x] Error handling
- [x] Google Maps links
- [x] SOS logging
- [x] Detailed responses
- [x] Test utilities
- [x] Documentation

## 🎉 Ready to Use!

Your SOS feature is fully implemented and ready to use. Just configure the environment variables and test!

