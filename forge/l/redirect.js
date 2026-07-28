// ======================================
// FORGE Redirect Engine
// redirect.js
// ======================================

import { db } from "../js/firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const statusText = document.getElementById("statusText");

async function redirectLink() {

    // Loading
    statusText.textContent = "Preparing your destination...";

    // Read short code
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
        statusText.textContent = "Invalid link. Missing short code.";
        return;
    }

    try {

        // Get Firestore document
        const linkRef = doc(db, "links", code);
        const linkSnap = await getDoc(linkRef);

        if (!linkSnap.exists()) {
            statusText.textContent = "This link does not exist.";
            return;
        }

        const link = linkSnap.data();

        // Check active status
        if (!link.isActive) {
            statusText.textContent = "This link has been disabled.";
            return;
        }

        // TODO: Enable after secure click counter rules are implemented

// await updateDoc(linkRef, {
//     clicks: increment(1)
// });

        statusText.textContent = "Redirecting...";

        // Small delay for smoother UX
        setTimeout(() => {
            window.location.replace(link.destinationUrl);
        }, 300);

    } catch (error) {

        console.error("Redirect Error:", error);

        statusText.textContent =
            "Unable to redirect. Please try again later.";

    }

}

redirectLink();
