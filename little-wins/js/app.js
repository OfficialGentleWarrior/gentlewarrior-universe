import { auth, db, storage } from "./firebase.js";
import { dailyQuotes } from "./quotes.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getBlob
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

async function loadPrivateJourneyPhoto(userId, fallbackURL) {
    const photoRef = ref(storage, `journeyPhotos/${userId}/profile.jpg`);
    try {
        const blob = await getBlob(photoRef);
        const objectURL = URL.createObjectURL(blob);
        journeyPhoto.onload = () => URL.revokeObjectURL(objectURL);
        journeyPhoto.onerror = () => {
            URL.revokeObjectURL(objectURL);
            journeyPhoto.src = fallbackURL;
        };
        journeyPhoto.src = objectURL;
    } catch (error) {
        console.error("Private journey photo loading failed:", error);
        journeyPhoto.src = fallbackURL;
    }
}

const userName = document.getElementById("userName");
const journeyPhoto =
    document.getElementById("journeyPhoto");

const journeyPhotoInput =
    document.getElementById("journeyPhotoInput");

const journeyStarted = document.getElementById("journeyStarted");
const totalWins = document.getElementById("totalWins");
const streak = document.getElementById("streak");

const dailyQuote = document.getElementById("dailyQuote");

const recordWin =
    document.getElementById("recordWin");
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

const fallbackPhoto = userData.photoURL || "assets/avatar/default-avatar.png";
    journeyPhoto.src = fallbackPhoto;
    await loadPrivateJourneyPhoto(user.uid, fallbackPhoto);

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
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { alert('Please select a JPEG, PNG, or WebP image.'); event.target.value = ''; return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be 5 MB or smaller.'); event.target.value = ''; return; }

    try {

        const user = auth.currentUser;

        if (!user) return;

alert("⏳ Uploading journey photo...");

        // Upload to Firebase Storage
        const storageRef = ref(
            storage,
            `journeyPhotos/${user.uid}/profile.jpg`
        );

        await uploadBytes(storageRef, file);

        // Load the uploaded photo using authenticated Storage access
        await loadPrivateJourneyPhoto(user.uid, user.photoURL || "assets/avatar/default-avatar.png");

alert("✅ Journey photo updated successfully!");

    } catch (error) {

        console.error(error);
        alert(error.message);

    }

});

// ==========================================
// Record Little Win
// ==========================================



recordWin.onclick = () => {

    

    location.href = "record.html";

};

document.getElementById("navProfile").addEventListener("click", async () => { if (!confirm("Sign out of Little Wins?")) return; try { await signOut(auth); window.location.replace("index.html"); } catch (error) { console.error("Logout failed:", error); alert("Unable to sign out. Please try again."); } });
