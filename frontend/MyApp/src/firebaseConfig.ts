// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Replace with your actual Firebase config keys
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
export const db = getFirestore(app);