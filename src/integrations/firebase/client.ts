import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// TEMPORARY: Hardcoded Firebase config to bypass env variable issues
const firebaseConfig = {
  apiKey: "AIzaSyAItxB-jOUvk76SaBl_d2c9HkmlTko090A",
  authDomain: "avax-forge-jobs.firebaseapp.com",
  projectId: "avax-forge-jobs",
  storageBucket: "avax-forge-jobs.firebasestorage.app",
  messagingSenderId: "1008222365608",
  appId: "1:1008222365608:web:44ac63e1c45ad03000df9d",
  measurementId: "G-2M3281WZDM"
};

console.log('🔧 Using hardcoded Firebase config');
console.log('✅ Firebase config loaded successfully');

let app: FirebaseApp;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
} catch (e: any) {
  console.error('❌ Failed to initialize Firebase app:', e?.message || e);
  throw e;
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

export default app;


