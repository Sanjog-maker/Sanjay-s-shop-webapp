import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Provide your own Firebase web configuration through VITE_FIREBASE_* variables.
// VITE_ variables are bundled into browser code; never put server secrets here.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''
};
const databaseId = import.meta.env.VITE_FIRESTORE_DATABASE_ID || '';

let app: FirebaseApp | undefined;
let db: Firestore | null = null;

if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
  } catch (error) {
    console.warn('Firebase initialization failed; local/offline functionality may still be available:', error);
  }
} else {
  console.info('Firebase is not configured. Add VITE_FIREBASE_* settings to .env to enable Firestore.');
}

export { app, db };
