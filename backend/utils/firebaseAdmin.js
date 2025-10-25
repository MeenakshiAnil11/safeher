import admin from "firebase-admin";
import fs from "fs";
import path from "path";

let app = null;

try {
  // Preferred: use FIREBASE_SERVICE_ACCOUNT path from env (relative to backend dir)
  const svcPath = process.env.FIREBASE_SERVICE_ACCOUNT || "./serviceAccountKey.json";
  const resolved = path.resolve(process.cwd(), svcPath);

  if (fs.existsSync(resolved)) {
    const serviceAccount = JSON.parse(fs.readFileSync(resolved, "utf-8"));

    if (!admin.apps.length) {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }
} catch (e) {
  // If anything fails, keep app null; Google login route will handle gracefully
  console.warn("Firebase Admin init skipped:", e?.message || e);
}

export default admin;