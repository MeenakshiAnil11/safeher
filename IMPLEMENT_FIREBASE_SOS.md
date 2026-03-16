# 🚨 Implement SOS Using Firebase Cloud Messaging

## Problem
SMS and email are not coming through to contacts because:
1. Email service (Mailtrap) is for testing only
2. SMS service (Twilio) is not configured
3. Solution: Use Firebase Cloud Messaging (FCM) for push notifications

## Solution: Firebase Cloud Messaging

Instead of SMS/Email, we'll use **Firebase Cloud Messaging (FCM)** to send real-time push notifications to emergency contacts' mobile devices.

## Implementation Steps

### Step 1: Set Up Firebase Cloud Messaging

1. **Go to Firebase Console**
   - https://console.firebase.google.com/
   - Select your project: `safeher3`

2. **Enable Cloud Messaging API**
   - Go to Settings > Cloud Messaging
   - Enable the API if not already enabled

3. **Get Server Key**
   - In Firebase Console, go to Settings > Cloud Messaging
   - Copy the "Server key" (or generate a new one)
   - Add to `backend/.env`:
   ```env
   FCM_SERVER_KEY=your-server-key-here
   ```

### Step 2: Install Required Packages

```bash
# Install FCM for backend
cd backend
npm install firebase-admin

# Install FCM for frontend (if not already installed)
cd client
npm install firebase
```

### Step 3: Backend Implementation

Update `backend/controllers/sosController.js`:

```javascript
// Add at the top
import admin from 'firebase-admin';

// In sendSOS function, after getting contacts:
// Send push notifications via FCM
const sendFCMNotification = async (contactToken, user, location) => {
  const message = {
    notification: {
      title: '🚨 EMERGENCY SOS ALERT',
      body: `${user.name} needs immediate help! Location: ${location.latitude}, ${location.longitude}`,
    },
    data: {
      type: 'sos',
      userId: user._id.toString(),
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      timestamp: new Date().toISOString(),
    },
    token: contactToken,
  };

  try {
    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    console.error('FCM send error:', error);
    throw error;
  }
};
```

### Step 4: Update Contact Model

Add FCM tokens to contacts:

```javascript
// backend/models/Contact.js
const ContactSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    number: { type: String, required: true },
    relationship: { type: String, default: "" },
    email: { type: String, default: "" },
    fcmToken: { type: String, default: "" }, // ✅ ADD THIS
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);
```

### Step 5: Frontend - Request Notification Permission

Update emergency contacts page to request permission and store FCM token:

```javascript
// client/src/pages/MyContacts.jsx

import { getMessaging, getToken } from 'firebase/messaging';
import { initializeApp, getApps } from 'firebase/app';

const requestNotificationPermission = async () => {
  try {
    const messaging = getMessaging();
    const token = await getToken(messaging, {
      vapidKey: 'YOUR_VAPID_KEY'
    });
    
    // Send token to backend
    await api.post('/contacts/fcm-token', { token });
    
    console.log('FCM Token:', token);
  } catch (error) {
    console.error('Notification permission error:', error);
  }
};
```

### Step 6: Complete Backend SOS Function

Replace the email/SMS sending code with FCM:

```javascript
// In sosController.js, replace email/SMS code:

// Send FCM push notifications
const fcmResults = [];

for (const contact of contacts) {
  if (contact.fcmToken) {
    try {
      const result = await sendFCMNotification(contact.fcmToken, user, {
        latitude,
        longitude
      });
      
      fcmResults.push({
        contact: contact.name,
        status: 'sent',
        fcmResult: result
      });
      
      console.log(`✅ FCM notification sent to ${contact.name}`);
    } catch (error) {
      fcmResults.push({
        contact: contact.name,
        status: 'failed',
        error: error.message
      });
      console.error(`❌ FCM failed for ${contact.name}:`, error);
    }
  }
}
```

## Quick Setup

### Option 1: Simple Setup (No Backend Changes)

1. **Install FCM SDK in frontend:**
   ```bash
   cd client
   npm install firebase
   ```

2. **Initialize FCM in client:**
   - Update `client/src/firebase.js` to include messaging
   - Request notification permission
   - Get FCM token

3. **Test:**
   - Send SOS from app
   - Check browser console for FCM token
   - Manually send test notification from Firebase Console

### Option 2: Full Implementation (Recommended)

Follow all steps above to integrate FCM into the SOS flow.

## Benefits of FCM

✅ **Real-time push notifications**
✅ **Works on mobile and web**
✅ **No SMS/Email costs**
✅ **Instant delivery**
✅ **Rich notifications with data**
✅ **Cross-platform (Android, iOS, Web)**

## Testing

1. **Request notification permission** in the app
2. **Save FCM token** to contact profile
3. **Send SOS** from dashboard
4. **Emergency contacts receive push notification** on their devices
5. **Notification opens with location** and emergency details

## Documentation

- Firebase Console: https://console.firebase.google.com/
- FCM Documentation: https://firebase.google.com/docs/cloud-messaging
- VAPID Key Setup: https://firebase.google.com/docs/cloud-messaging/js/client

