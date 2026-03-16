# Complete SOS Implementation Guide

## Overview

This guide provides a complete, modular SOS (Save Our Soul) implementation with:
- 📍 Browser location tracking
- 📧 Email notifications via Nodemailer
- 📱 SMS notifications via Twilio
- 🚨 Emergency contact management
- ✅ Error handling and validation

## Backend Implementation

### 1. API Endpoint

**Endpoint:** `POST /api/sos/send`

**Authentication:** Required (protected route)

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "message": "I need immediate help" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "SOS alert sent successfully",
  "data": {
    "logId": "sos-log-id",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "mapsLink": "https://maps.google.com/?q=40.7128,-74.0060"
    },
    "timestamp": "12/25/2024, 3:30:00 PM",
    "contactsNotified": {
      "total": 3,
      "emails": 2,
      "sms": 2
    },
    "results": {
      "emails": {
        "sent": 2,
        "failed": 0,
        "details": [...]
      },
      "sms": {
        "sent": 2,
        "failed": 0,
        "details": [...]
      }
    }
  }
}
```

### 2. Backend Files Modified

1. **`backend/routes/sosRoutes.js`**
   - Added: `POST /api/sos/send` route
   - Imports `sendSOS` controller

2. **`backend/controllers/sosController.js`**
   - Added: `sendSOS` function (lines 296-489)
   - Handles location validation
   - Fetches user and contacts
   - Sends emails and SMS
   - Creates SOS log entry
   - Returns detailed results

3. **`backend/config/mailer.js`**
   - Enhanced error handling
   - Better logging
   - Returns success/failure details

4. **`backend/config/sms.js`**
   - Enhanced error handling
   - Better logging
   - Returns success/failure details

## Frontend Implementation

### 1. New Component: `SOSButtonNew.jsx`

**Location:** `client/src/components/SOSButtonNew.jsx`

**Features:**
- Requests browser location permission
- Gets GPS coordinates with high accuracy
- Shows confirmation dialog
- Sends SOS to backend
- Displays loading states
- Handles errors gracefully
- Shows detailed success/error messages

**Usage:**
```jsx
import SOSButtonNew from '../components/SOSButtonNew';

function MyComponent() {
  const handleSOSSuccess = (data) => {
    console.log('SOS sent:', data);
  };

  const handleSOSError = (error) => {
    console.error('SOS failed:', error);
  };

  return (
    <SOSButtonNew 
      onSuccess={handleSOSSuccess}
      onError={handleSOSError}
    />
  );
}
```

### 2. Test Utilities

**Location:** `client/src/components/SOSTestUtils.js`

**Features:**
- Sample emergency contacts data
- Contact validation
- Phone number formatting
- Location permission testing
- Mock SOS responses

## Environment Setup

### 1. Create `.env` file in `backend/` directory:

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/safeher

# Server
PORT=5000

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=SafeHer <no-reply@safeher.com>
DISABLE_EMAILS=false

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_FROM=+1234567890
```

### 2. Quick Setup Options

#### Option A: Gmail Setup
```bash
# 1. Enable 2FA on Gmail
# 2. Generate app password: https://myaccount.google.com/apppasswords
# 3. Update .env:
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### Option B: Mailtrap (Testing)
```bash
# 1. Sign up at https://mailtrap.io
# 2. Create inbox
# 3. Update .env:
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-user
EMAIL_PASS=your-mailtrap-pass
```

#### Option C: Twilio SMS
```bash
# 1. Sign up at https://www.twilio.com
# 2. Get credentials
# 3. Update .env:
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your-token
TWILIO_FROM=+1234567890
```

## Testing

### 1. Add Test Emergency Contacts

Create a file `test-contacts.js` in the backend:

```javascript
// test-contacts.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Contact from './models/Contact.js';
import User from './models/User.js';

const addTestContacts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get first user
    const user = await User.findOne();
    if (!user) {
      console.error('❌ No users found');
      return;
    }

    const testContacts = [
      {
        user: user._id,
        name: "John Doe",
        number: "+1234567890",
        relationship: "Family",
        email: "john.doe@example.com"
      },
      {
        user: user._id,
        name: "Jane Smith",
        number: "+1987654321",
        relationship: "Friend",
        email: "jane.smith@example.com"
      }
    ];

    // Clear existing contacts
    await Contact.deleteMany({ user: user._id });
    console.log('🗑️ Cleared existing contacts');

    // Add test contacts
    const contacts = await Contact.insertMany(testContacts);
    console.log(`✅ Added ${contacts.length} test contacts`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addTestContacts();
```

Run it:
```bash
node backend/test-contacts.js
```

### 2. Test SOS Button

1. Start backend:
   ```bash
   cd backend
   npm start
   ```

2. Start frontend:
   ```bash
   cd client
   npm start
   ```

3. Click SOS button in the app

4. Check backend console for logs:
   ```
   📧 Sending emails to 2 contacts: ['contact1@email.com', 'contact2@email.com']
   ✅ Email sent successfully to contact1@email.com. Message ID: <id>
   📱 Sending SMS to 2 contacts: ['+1234567890', '+1987654321']
   ✅ SMS sent successfully to +1234567890. Message SID: SM...
   ```

## API Usage Examples

### 1. JavaScript/Fetch

```javascript
const sendSOS = async (latitude, longitude, message = '') => {
  try {
    const response = await fetch('http://localhost:5000/api/sos/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        latitude,
        longitude,
        message
      })
    });

    const data = await response.json();
    console.log('SOS Response:', data);
    return data;
  } catch (error) {
    console.error('SOS Error:', error);
    throw error;
  }
};
```

### 2. Using the React Component

```jsx
import SOSButtonNew from './components/SOSButtonNew';

function App() {
  const handleSuccess = ({ location, result }) => {
    console.log('SOS sent from:', location);
    console.log('Contacts notified:', result.data.contactsNotified);
  };

  const handleError = (error) => {
    alert(`SOS failed: ${error.message}`);
  };

  return (
    <SOSButtonNew 
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}
```

### 3. cURL Example

```bash
curl -X POST http://localhost:5000/api/sos/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060,
    "message": "Emergency SOS test"
  }'
```

## Error Handling

### Common Issues

1. **Location not available**
   - Error: "Location permission denied"
   - Solution: Enable location access in browser settings

2. **No emergency contacts**
   - Error: "No emergency contacts found"
   - Solution: Add at least one emergency contact

3. **Email not sending**
   - Check `EMAIL_*` variables in `.env`
   - Check if `DISABLE_EMAILS=true`
   - View backend console for details

4. **SMS not sending**
   - Check `TWILIO_*` variables in `.env`
   - Verify Twilio account has credits
   - View backend console for details

## Security Considerations

1. **Authentication**: All SOS endpoints require authentication
2. **Rate Limiting**: Consider adding rate limiting to prevent spam
3. **Data Validation**: All inputs are validated server-side
4. **Error Messages**: Client gets generic messages, details in logs

## Customization

### Custom Email Template

Edit `backend/controllers/sosController.js` line 349-398 to customize HTML email template.

### Custom SMS Message

Edit `backend/controllers/sosController.js` line 336-346 to customize SMS message format.

### Add More Notification Channels

Add to `sendSOS` function in `sosController.js`:
- Push notifications
- WhatsApp (via Twilio API)
- Telegram bot
- Slack webhook

## Integration Checklist

- [ ] Set up backend environment variables
- [ ] Configure email service (Gmail/Mailtrap)
- [ ] Configure SMS service (Twilio)
- [ ] Add emergency contacts via database
- [ ] Test location permission in browser
- [ ] Test SOS button functionality
- [ ] Verify emails are sent
- [ ] Verify SMS are sent
- [ ] Test error handling
- [ ] Add loading states in UI
- [ ] Test on mobile devices

## Support

For issues:
1. Check backend console logs
2. Verify environment variables
3. Test with sample contacts
4. Check browser console for errors

## Next Steps

1. Add real-time location tracking (optional)
2. Add SOS cancel functionality
3. Add SOS history/logs view
4. Add location-based emergency services lookup
5. Add voice call option via Twilio

