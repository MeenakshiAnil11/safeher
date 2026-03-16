import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let app = null;

try {
  // Try multiple possible paths
  const possiblePaths = [
    path.resolve(__dirname, "serviceAccountKey.json"),
    path.resolve(process.cwd(), "serviceAccountKey.json"),
    process.env.FIREBASE_SERVICE_ACCOUNT ? path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT) : null
  ].filter(Boolean);

  console.log("Attempting to load Firebase service account...");
  console.log("Looking in paths:", possiblePaths);

  let serviceAccount = null;
  let loadedPath = null;

  for (const svcPath of possiblePaths) {
    if (fs.existsSync(svcPath)) {
      console.log("✅ Service account file found at:", svcPath);
      serviceAccount = JSON.parse(fs.readFileSync(svcPath, "utf-8"));
      loadedPath = svcPath;
      break;
    }
  }

  if (serviceAccount && !admin.apps.length) {
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin initialized successfully from:", loadedPath);
  } else if (!serviceAccount) {
    console.warn("⚠️ Service account file not found in any of the paths");
  } else {
    console.log("Firebase Admin already initialized");
  }
} catch (e) {
  console.error("❌ Firebase Admin init error:", e?.message || e);
  console.error("Stack:", e?.stack);
}

export default admin;