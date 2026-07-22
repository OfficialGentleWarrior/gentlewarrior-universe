// firebase.js

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDZQFN0iMQ1QvgY2ptRFuOKY1sTz9zZhb8",
  authDomain: "gentle-warrior.firebaseapp.com",
  projectId: "gentle-warrior",
  storageBucket: "gentle-warrior.firebasestorage.app",
  messagingSenderId: "206508766648",
  appId: "1:206508766648:web:3451e7dcd6c9008e9c8b4d"
};

// Prevent duplicate initialization
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Services
const db = getFirestore(app);
const auth = getAuth(app);

// Export
export { app, db, auth };
