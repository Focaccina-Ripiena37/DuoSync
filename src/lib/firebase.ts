import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseApp,
} from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
} from "firebase/app-check";

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

// Initialize Firebase only on the client to avoid CI/build failures
// when env vars are not present.
let app: FirebaseApp | undefined = getApps().length ? getApp() : undefined;
if (typeof window !== "undefined" && !app) {
  app = initializeApp(firebaseConfig);
}

// On server/build they are undefined but never used (client-only app).
export const auth: Auth = app ? getAuth(app) : (undefined as unknown as Auth);
export const db: Firestore = app
  ? getFirestore(app)
  : (undefined as unknown as Firestore);

// Initialize App Check (client-only). Uses reCAPTCHA v3 site key.
// Ensure NEXT_PUBLIC_FIREBASE_RECAPTCHA_V3_SITE_KEY is set in .env.local
if (typeof window !== "undefined" && app) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(
        process.env.NEXT_PUBLIC_FIREBASE_RECAPTCHA_V3_SITE_KEY || ""
      ),
      isTokenAutoRefreshEnabled: true,
    });
  } catch {
    // avoid duplicate init errors on HMR
  }
}