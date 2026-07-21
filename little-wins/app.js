import { auth, db } from "./firebase.js";
import { dailyQuotes } from "./js/quotes.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const userName = document.getElementById("userName");
const userPhoto = document.getElementById("userPhoto");

const journeyStarted = document.getElementById("journeyStarted");
const totalWins = document.getElementById("totalWins");
const streak = document.getElementById("streak");

const dailyQuote = document.getElementById("dailyQuote");

// Daily Quote (same quote for everyone each day)
const today = new Date();
const startOfYear = new Date(today.getFullYear(), 0, 0);
const diff = today - startOfYear;
const oneDay = 1000 * 60 * 60 * 24;
const dayOfYear = Math.floor(diff / oneDay);

dailyQuote.textContent =
    dailyQuotes[(dayOfYear - 1) % dailyQuotes.length];

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    try {

        const userRef = doc(db, "lw_users", user.uid);
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {

            alert("User profile not found.");
            window.location.href = "index.html";
            return;

        }

        const data = snapshot.data();

        userName.textContent = data.name || "Little Wins User";

        if (data.photoURL) {
            userPhoto.src = data.photoURL;
        }

        if (data.createdAt) {

            const date = data.createdAt.toDate();

            journeyStarted.textContent = date.toLocaleDateString(
                "en-US",
                {
                    month: "short",
                    year: "numeric"
                }
            );

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
