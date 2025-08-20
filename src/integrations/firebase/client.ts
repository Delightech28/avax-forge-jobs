import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// IMPORTANT: Replace these with your actual Firebase config via env or inline
// For simplicity, we'll read from Vite env if present; otherwise fall back to window.__FIREBASE__ (optional)
const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || (window as any).__FIREBASE__?.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || (window as any).__FIREBASE__?.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || (window as any).__FIREBASE__?.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || (window as any).__FIREBASE__?.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || (window as any).__FIREBASE__?.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || (window as any).__FIREBASE__?.appId,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || (window as any).__FIREBASE__?.measurementId,
};

// Basic guard to help detect missing config in production
function assertConfig(config: Record<string, unknown>): void {
  const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missing = required.filter((k) => !config[k]);
  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.warn('Firebase config is missing keys:', missing.join(', '));
  }
}

assertConfig(firebaseConfig);

let app: FirebaseApp;
try {
  app = initializeApp(firebaseConfig as any);
} catch (e: any) {
  // eslint-disable-next-line no-console
  console.error('Failed to initialize Firebase app:', e?.message || e);
  throw e;
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

export default app;


