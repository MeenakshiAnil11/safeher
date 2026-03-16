# 🔥 FIREBASE SERVICE ACCOUNT KEY SETUP

## Your Firebase Project Details ✅
- **Project Name:** safeher3
- **Project ID:** safeher3
- **Project Number:** 1097381373440
- **Web API Key:** AIzaSyBZQFEPN_ww2iNvc0dAgscrys7Usd4Ox00

## Next Step: Get Service Account Key

### Step 1: Go to Firebase Console
1. **Open:** https://console.firebase.google.com/
2. **Select project:** safeher3
3. **Sign in** with your Google account

### Step 2: Generate Service Account Key
1. **Click gear icon** (⚙️) next to "Project Overview"
2. **Select:** "Project settings"
3. **Go to:** "Service accounts" tab
4. **Click:** "Generate new private key"
5. **Click:** "Generate key" in the popup
6. **Download** the JSON file

### Step 3: Save the Key
1. **Rename** downloaded file to: `serviceAccountKey.json`
2. **Move** to: `D:\MINIPROJECT\safeher-project4\backend\serviceAccountKey.json`

## What the File Looks Like
```json
{
  "type": "service_account",
  "project_id": "safeher3",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-...@safeher3.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

## After You Get the File

1. **Save it** as `backend/serviceAccountKey.json`
2. **Test the setup:**
   ```bash
   cd backend
   npm start
   ```
3. **Check console** for: "Firebase Admin initialized successfully"

## Troubleshooting

**Problem:** "Generate new private key" button not visible
- **Solution:** Make sure you're in the "Service accounts" tab

**Problem:** "Permission denied" when downloading
- **Solution:** Check your browser's download settings

**Problem:** "File not found" error
- **Solution:** Make sure file is saved as `serviceAccountKey.json` in backend folder

## Quick Test

Once you have the file:
```bash
cd backend
npm start
```

You should see:
```
✅ Firebase Admin initialized successfully
✅ Mail server ready to send emails
```

## That's It! 🎉

Once you have the `serviceAccountKey.json` file, your Firebase SOS will work perfectly!
