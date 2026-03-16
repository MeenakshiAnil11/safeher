# 🚨 Implement SOS Using Firebase Cloud Messaging (FCM)

## Problem
Emails and SMS are not working because:
- Email service (Mailtrap) is for testing only
- SMS service (Twilio) is not configured
- Need a working solution

## ✅ Solution: Firebase Cloud Messaging (FCM)

FCM sends **push notifications** directly to emergency contacts' devices - no SMS or email needed!

## What's Been Implemented

### Backend ✅
- ✅ Added `fcmToken` field to Contact model
- ✅ Updated SOS controller to send FCM push notifications
- ✅ Added route to update FCM tokens: `POST /api/contacts/:id/fcm-token`
- ✅ Falls back to email/SMS if FCM token not available

### How It Works

1. **Emergency contact opens the app** on their phone
2. **App requests notification permission**
3. **FCM token is generated** and saved to contact profile
4. **When SOS is triggered:**
   - Backend sends FCM push notification
   - Emergency contact receives push notification instantly
   - Notification includes GPS location and Google Maps link

## Setup Instructions

### Step 1: Get Firebase Service Account Key

1. Go to: https://console.firebase.google.com/
2. Select your project: `safeher3`
3. Go to **Project Settings** (gear icon)
4. Go to **Service accounts** tab
5. Click **Generate new private key**
6. Download the JSON file
7. Save it as `backend/serviceAccountKey.json`

### Step 2: Configure Backend

1. Update `backend/.env`:
```env
FIREBASE_SERVICE_ACCOUNT=./serviceAccountKey.json
```

2. Restart backend:
```bash
cd backend
npm start
```

### Step 3: Frontend - Enable Notifications

Add this to your emergency contacts page:

```javascript
// client/src/pages/MyContacts.jsx

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBZQFEPN_ww2iNvc0dAgscrys7Usd4Ox00",
  authDomain: "safeher3.firebaseapp.com",
  projectId: "safeher3",
  storageBucket: "safeher3.appspot.com",
  messagingSenderId: "1097381373440",
  appId: "1:1097381373440:web:4b1a8f49b1723b26679ae5"
};

const app = initializeApp(firebaseConfig);

// Request notification permission and get FCM token
const requestNotificationPermission = async (contactId) => {
  try {
    const messaging = getMessaging(app);
    
    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY_HERE'
      });
      
      console.log('FCM Token:', token);
      
      // Send token to backend
      await api.post(`/contacts/${contactId}/fcm-token`, { fcmToken: token });
      
      alert('✅ Notification permission granted! You will receive SOS alerts.');
      return token;
    } else {
      alert('❌ Notification permission denied');
    }
  } catch (error) {
    console.error('FCM error:', error);
    alert('Failed to enable notifications');
  }
};
```

### Step 4: Get VAPID Key

1. Go to Firebase Console
2. Settings > Cloud Messaging
3. Generate new key pair (Web Push certificates)
4. Copy the key
5. Use it as `YOUR_VAPID_KEY_HERE` above

### Step 5: Test SOS

1. **Add emergency contact** via the app
2. **Enable notifications** for that contact
3. **Send SOS** from dashboard
4. **Emergency contact receives push notification** instantly!

## Benefits of FCM

✅ **Works instantly** - No delay
✅ **No SMS/Email costs** - Free
✅ **Works offline** - Notification queues if offline
✅ **Rich notifications** - Show location, user info, map link
✅ **Cross-platform** - Android, iOS, Web
✅ **Reliable** - Powered by Google

## How Emergency Contacts Receive Alerts

1. **Push notification appears** on their phone
2. **Title:** "🚨 EMERGENCY SOS ALERT"
3. **Message:** "[User Name] needs immediate help!"
4. **Data includes:**
   - GPS coordinates
   - Google Maps link
   - User contact info
   - Timestamp

5. **Tap notification** → Opens app with emergency details

## Testing

1. **Setup:**
   ```bash
   cd backend
   # Make sure serviceAccountKey.json exists
   npm start
   ```

2. **Add test contact with FCM token:**
   - Open app as emergency contact
   - Enable notifications
   - FCM token saved to profile

3. **Test SOS:**
   - Send SOS from dashboard
   - Check backend console for FCM logs
   - Emergency contact receives push notification

## Alternative: Keep Email/SMS

If FCM is not suitable, emails and SMS still work as fallback:
- Email: Configure Gmail (see `SOS_EMAIL_SMS_SETUP.md`)
- SMS: Configure Twilio

FCM works in addition to emails and SMS, not as replacement.

## Files Modified

- ✅ `backend/models/Contact.js` - Added fcmToken field
- ✅ `backend/controllers/sosController.js` - Added FCM notification
- ✅ `backend/controllers/contactController.js` - Added FCM token endpoint
- ✅ `backend/routes/contactRoutes.js` - Added FCM route

## Next Steps

1. Get `serviceAccountKey.json` from Firebase
2. Configure `backend/.env`
3. Restart backend server
4. Add notification request to frontend
5. Test SOS!

## Troubleshooting

**Problem: "Firebase Admin not initialized"**
- Solution: Add `serviceAccountKey.json` to backend folder

**Problem: "No FCM token"**
- Solution: Request notification permission in app

**Problem: "Notification not received"**
- Solution: Check browser console for FCM errors
- Make sure VAPID key is correct

