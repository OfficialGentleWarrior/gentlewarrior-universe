// ======================================
// FORGE Dashboard
// ======================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ======================================
// Elements
// ======================================

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const credits = document.getElementById("credits");
const role = document.getElementById("role");
const memberSince = document.getElementById("memberSince");
const logoutBtn = document.getElementById("logoutBtn");

console.log("Dashboard JS Loaded");


// ======================================
// Authentication
// ======================================

onAuthStateChanged(auth, async (user) => {

    console.log("Auth State:", user);

    if (!user) {

        console.log("No authenticated user.");

        window.location.href = "login.html";

        return;

    }

    try {

        console.log("Fetching Firestore document...");

        const userRef = doc(db, "users", user.uid);

        const userSnap = await getDoc(userRef);

        console.log("Document exists:", userSnap.exists());

        if (!userSnap.exists()) {

            alert("User profile not found.");

            return;

        }

        const data = userSnap.data();

        console.log(data);

        userName.textContent = data.fullName ?? "User";

        userEmail.textContent = data.email ?? user.email;

        credits.textContent = data.credits ?? 0;

        role.textContent = data.role ?? "User";

        if (data.createdAt) {

            memberSince.textContent =
                data.createdAt.toDate().toLocaleDateString();

        } else {

            memberSince.textContent = "-";

        }

    } catch (error) {

        console.error(error);

        alert(error.code);

        alert(error.message);

    }

});


// ======================================
// Logout
// ======================================

logoutBtn.addEventListener("click", async () => {

    try {

        await signOut(auth);

        window.location.href = "login.html";

    } catch (error) {

        console.error(error);

        alert(error.code);

        alert(error.message);

    }

});
