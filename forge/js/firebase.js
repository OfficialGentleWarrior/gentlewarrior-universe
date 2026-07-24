// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZQFN0iMQ1QvgY2ptRFuOKY1sTz9zZhb8",
  authDomain: "gentle-warrior.firebaseapp.com",
  projectId: "gentle-warrior",
  storageBucket: "gentle-warrior.firebasestorage.app",
  messagingSenderId: "206508766648",
  appId: "1:206508766648:web:3451e7dcd6c9008e9c8b4d",
  measurementId: "G-T70M8N7S5C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
