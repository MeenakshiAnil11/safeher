import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBZQFEPN_ww2iNvc0dAgscrys7Usd4Ox00",
  authDomain: "safeher3.firebaseapp.com",
  projectId: "safeher3",
  storageBucket: "safeher3.appspot.com",
  messagingSenderId: "1097381373440",
  appId: "1:1097381373440:web:4b1a8f49b1723b26679ae5",
  measurementId: "G-4GZHNNM075"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
