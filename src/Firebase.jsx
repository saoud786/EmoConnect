// src/Firebase.jsx

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// ✅ Add Firestore + Storage
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBT99X90GsQhH5_oPb-gAuCQLTDxz6E90Q",
  authDomain: "real-time-chat-app-520d3.firebaseapp.com",
  projectId: "real-time-chat-app-520d3",
  storageBucket: "real-time-chat-app-520d3.firebasestorage.app",
  messagingSenderId: "1088412814824",
  appId: "1:1088412814824:web:e63651e2231bc4c8fba85d",
  measurementId: "G-QMEYF7EENV",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export Auth
export const auth = getAuth(app);

// ✅ Export Firestore Database
export const db = getFirestore(app);

// ✅ Export Storage (for profile image upload)
export const storage = getStorage(app);
