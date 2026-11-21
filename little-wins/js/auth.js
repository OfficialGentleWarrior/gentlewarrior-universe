// auth.js

import { auth, db } from "./firebase.js";
import { hasJourney } from "./journey.js";

import {
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const provider = new GoogleAuthProvider();

let loginInProgress = false;

export async function signInWithGoogle() {
  if (loginInProgress) return;
  loginInProgress = true;

  try {

    const result = await signInWithPopup(auth, provider);

    const user = result.user;

    const userRef = doc(db, "lw_users", user.uid);

    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {

      await setDoc(userRef, {

        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,

        createdAt: serverTimestamp()

      });

    }

    // Check if the user already has a journey
    const journeyExists = await hasJourney();

    if (journeyExists) {
      window.location.href = "app.html";
    } else {
      window.location.href = "setup.html";
    }

  } catch (error) {

    console.error(error);
    alert(error.code === "auth/popup-closed-by-user" ? "Google Sign-In was cancelled." : error.code === "auth/network-request-failed" || error.code === "unavailable" || error.code === "deadline-exceeded" ? "Unable to connect right now. Please check your internet connection and try again." : "Unable to complete sign-in. Please try again. If the problem continues, contact support.");

  } finally {
    loginInProgress = false;

  }

}
