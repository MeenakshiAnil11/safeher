# Google Sign-In iOS Fix

## Issue
Google Sign-In is not working, especially on iOS devices.

## Root Causes
1. Firebase Admin might not be initializing properly on backend startup
2. iOS Safari has strict popup blocker rules
3. Service account file path might not be resolved correctly

## Fixes Applied

### 1. Fixed Firebase Admin Initialization (`backend/utils/firebaseAdmin.js`)
- Added better path resolution that tries multiple locations
- Added comprehensive logging to help debug initialization issues
- Fixed `__dirname` for ES modules

### 2. Updated Backend Server (`backend/server.js`)
- Import Firebase Admin early to ensure it's initialized before routes are used

## Testing Steps

### 1. Restart Backend Server
```bash
cd backend
npm start
```

**Look for these messages in console:**
```
Attempting to load Firebase service account...
Looking in paths: [...]
✅ Service account file found at: ...
✅ Firebase Admin initialized successfully!
```

### 2. Test Google Sign-In
1. Go to http://localhost:3000/login
2. Click "Login with Google"
3. Complete the Google sign-in flow
4. Should redirect to dashboard after successful login

## Troubleshooting

### If you see "Google login not configured on server"
- **Check:** Backend console for initialization messages
- **Verify:** Service account file exists at `backend/serviceAccountKey.json`
- **Action:** Restart the backend server

### If popup is blocked (iOS Safari)
iOS Safari has aggressive popup blockers. Options:

**Option 1:** Allow popups for localhost
- Safari Settings → Privacy & Security
- Allow localhost popups

**Option 2:** Use redirect-based authentication (Future enhancement)
- Would require updating the login flow

### If "Service account file not found"
**Verify the file location:**
```bash
cd backend
ls -la serviceAccountKey.json
```

The file should exist and be readable.

### If "Invalid Google token" error
1. Check Firebase Console → Authentication → Providers
2. Ensure Google Sign-In is enabled
3. Check authorized domains include `localhost`

## Current Configuration

### Frontend (`client/src/firebase.js`)
```javascript
apiKey: "AIzaSyBZQFEPN_ww2iNvc0dAgscrys7Usd4Ox00"
authDomain: "safeher3.firebaseapp.com"
projectId: "safeher3"
```

### Backend
- Firebase Admin configured
- Service account file: `backend/serviceAccountKey.json`
- Endpoint: `/api/auth/google`

## iOS-Specific Considerations

### Popup Blockers
iOS Safari blocks most popups by default. The `signInWithPopup` method may not work reliably on iOS.

### Recommended for iOS
Consider using redirect-based authentication:
```javascript
import { signInWithRedirect, getRedirectResult } from "firebase/auth";

// For iOS, use redirect instead of popup
const handleGoogleLogin = async () => {
  await signInWithRedirect(auth, googleProvider);
};
```

However, this requires additional callback handling.

## Next Steps if Still Not Working

1. **Check browser console** for any JavaScript errors
2. **Check backend logs** for Firebase Admin initialization
3. **Verify Firebase Console** → Authentication → Sign-in method is enabled
4. **Test on different browsers** (Chrome, Firefox, Safari)
5. **Check network tab** in browser DevTools for failed requests

## Files Modified
- ✅ `backend/utils/firebaseAdmin.js` - Better path resolution and logging
- ✅ `backend/server.js` - Early Firebase Admin initialization

