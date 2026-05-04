import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Check if any required value is missing
const missingKeys = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value && key !== 'measurementId')
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.error("Firebase Configuration Error: Missing or dummy values for:", missingKeys.join(", "));
  console.warn("Please update your .env file with real Firebase credentials.");
}

let app;
let db: any;

if (missingKeys.length === 0) {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} else {
  console.error("Firebase initialization skipped due to missing configuration.");
  // Provide a proxy or dummy object to prevent immediate crashes in components
  db = new Proxy({}, {
    get: () => {
      throw new Error("Firebase not initialized. Please check your .env file and restart the server.");
    }
  });
}

export { db };
