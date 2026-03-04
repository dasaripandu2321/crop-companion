import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// AgroSmart Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSaPw6e1tlDOaYLklkXQaRU1w2aI1qf20",
  authDomain: "agrosmart-4d610.firebaseapp.com",
  projectId: "agrosmart-4d610",
  storageBucket: "agrosmart-4d610.firebasestorage.app",
  messagingSenderId: "876482707446",
  appId: "1:876482707446:web:b8abfc173d122e752911d7",
  measurementId: "G-LZPX1770TW",
};

// Initialize Firebase (avoid duplicate init)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, analytics, googleProvider };
