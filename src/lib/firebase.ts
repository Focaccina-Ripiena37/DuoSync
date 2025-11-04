import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Read Firebase config from env vars to avoid committing secrets
// Ensure these NEXT_PUBLIC_* values are defined in your .env.local file
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Initialize Firebase only once on the client
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize App Check (client-only). Uses reCAPTCHA v3 site key.
// Ensure NEXT_PUBLIC_FIREBASE_RECAPTCHA_V3_SITE_KEY is set in .env.local
if (typeof window !== "undefined") {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(
        process.env.NEXT_PUBLIC_FIREBASE_RECAPTCHA_V3_SITE_KEY || ""
      ),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (e) {
    // avoid duplicate init errors on HMR
    // console.debug("App Check already initialized or unavailable", e);
  }
}
