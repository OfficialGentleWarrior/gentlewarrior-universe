import { auth, db, storage } from "./firebase.js";
import { dailyQuotes } from "./quotes.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

const userName = document.getElementById("userName");
const journeyPhoto =
    document.getElementById("journeyPhoto");

const journeyPhotoInput =
    document.getElementById("journeyPhotoInput");

const journeyStarted = document.getElementById("journeyStarted");
const totalWins = document.getElementById("totalWins");
const streak = document.getElementById("streak");

const dailyQuote = document.getElementById("dailyQuote");

// ==========================================
// Journey Photo Picker
// ==========================================

journeyPhoto.addEventListener("click", () => {

    journeyPhotoInput.click();

});

// ==========================================
// Daily Quote
// ==========================================

const today = new Date();
const startOfYear = new Date(today.getFullYear(), 0, 0);
const diff = today - startOfYear;
const oneDay = 1000 * 60 * 60 * 24;
const dayOfYear = Math.floor(diff / oneDay);

dailyQuote.textContent =
    dailyQuotes[(dayOfYear - 1) % dailyQuotes.length];

// ==========================================
// Authentication Guard
// ==========================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "index.html";
        return;

    }

    try {

        const userRef = doc(db, "lw_users", user.uid);
const journeyRef = doc(db, "lw_journeys", user.uid);

const [userSnap, journeySnap] = await Promise.all([
    getDoc(userRef),
    getDoc(journeyRef)
]);

if (!userSnap.exists()) {

    alert("User profile not found.");
    window.location.href = "index.html";
    return;

}

const userData = userSnap.data();
const journeyData = journeySnap.exists()
    ? journeySnap.data()
    : null;

        userName.textContent =

    journeyData?.journeyName ||

    userData.name ||

    "Little Wins";

journeyPhoto.src =

    journeyData?.journeyPhoto ||

    userData.photoURL ||

    "assets/avatar/default-avatar.png";

        if (journeyData?.journeyStarted) {

    journeyStarted.textContent =
        `${journeyData.journeyStarted.month.substring(0,3)} ${journeyData.journeyStarted.year}`;

} else {

    journeyStarted.textContent = "--";

}

        // Placeholder values (will come from Journey later)

        totalWins.textContent = "0";
        streak.textContent = "0";

    } catch (error) {

        console.error(error);
        alert(error.message);

    }

});

// ==========================================
// Journey Photo Upload
// ==========================================

journeyPhotoInput.addEventListener("change", async (event) => {

    const file = event.target.files[0];

    if (!file) return;

    alert("Upload feature - next step.");

});
