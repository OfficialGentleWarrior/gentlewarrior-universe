// ======================================
// FORGE Firebase Configuration
// ======================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    FacebookAuthProvider
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ======================================
// Firebase Config
// ======================================

const firebaseConfig = {

    apiKey: "AIzaSyDZQFN0iMQ1QvgY2ptRFuOKY1sTz9zZhb8",

    authDomain: "gentle-warrior.firebaseapp.com",

    projectId: "gentle-warrior",

    storageBucket: "gentle-warrior.firebasestorage.app",

    messagingSenderId: "206508766648",

    appId: "1:206508766648:web:3451e7dcd6c9008e9c8b4d",

    measurementId: "G-T70M8N7S5C"

};


// ======================================
// Initialize Firebase
// ======================================

const app = initializeApp(firebaseConfig);


// ======================================
// Firebase Services
// ======================================

const auth = getAuth(app);

const db = getFirestore(app);


// ======================================
// Providers
// ======================================

const googleProvider = new GoogleAuthProvider();

const facebookProvider = new FacebookAuthProvider();


// ======================================
// Export
// ======================================

export {

    auth,

    db,

    googleProvider,

    facebookProvider

};
