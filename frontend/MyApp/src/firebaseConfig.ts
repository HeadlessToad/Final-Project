// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// 1. Revert to the standard 'firebase/auth' import
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBXNi3RvtwLzoG_xRbH1kO8aWfdfeveqPc",
  authDomain: "ai-waste-sorter-a22c1.firebaseapp.com",
  projectId: "ai-waste-sorter-a22c1",
  storageBucket: "ai-waste-sorter-a22c1.firebasestorage.app",
  messagingSenderId: "1030006869141",
  appId: "1:1030006869141:web:932ce5f18ae2c6451e5f9c",
  measurementId: "G-3Y9XPP3CHL"
};

const app = initializeApp(firebaseConfig);

// 2. Initialize Auth with Persistence
// We use a try-catch or explicit check to prevent crashes on Web if you run this there
let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (e) {
  // Fallback (e.g., if running on Web where getReactNativePersistence might fail)
  // But for the Mobile App, the above block is what keeps you logged in.
  const { getAuth } = require("firebase/auth"); 
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);