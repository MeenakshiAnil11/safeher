# 🔥 STEP 1: Get Firebase Service Account Key

## Instructions:

1. **Go to Firebase Console:**
   - Open: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Select Your Project:**
   - Click on project: **safeher3**

3. **Go to Project Settings:**
   - Click the gear icon (⚙️) next to "Project Overview"
   - Select "Project settings"

4. **Go to Service Accounts Tab:**
   - Click on "Service accounts" tab
   - You'll see "Firebase Admin SDK"

5. **Generate New Private Key:**
   - Click "Generate new private key"
   - Click "Generate key" in the popup
   - A JSON file will download automatically

6. **Save the File:**
   - Rename the downloaded file to: `serviceAccountKey.json`
   - Move it to: `D:\MINIPROJECT\safeher-project4\backend\serviceAccountKey.json`

## What the file looks like:
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

## After downloading:
1. Save as `backend/serviceAccountKey.json`
2. Run: `npm start` in backend folder
3. Check console for: "Firebase Admin initialized successfully"

## Troubleshooting:
- **File not found:** Make sure it's in `backend/` folder
- **Permission denied:** Check file permissions
- **Invalid JSON:** Re-download the file

## Next Step:
Once you have the file, I'll help you test the SOS feature!
