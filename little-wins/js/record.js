import { auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const photoPreview =
    document.getElementById("photoPreview");

const photoInput =
    document.getElementById("photoInput");

const choosePhoto =
    document.getElementById("choosePhoto");

const saveWin =
    document.getElementById("saveWin");

const cancelBtn =
    document.getElementById("cancelBtn");

const winTitle =
    document.getElementById("winTitle");

const winStory =
    document.getElementById("winStory");

// ==========================================
// Authentication Guard
// ==========================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "index.html";

    }

});

// ==========================================
// Choose Photo
// ==========================================

choosePhoto.addEventListener("click", () => {

    photoInput.click();

});

// ==========================================
// Preview Selected Photo
// ==========================================

photoInput.addEventListener("change", (event) => {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {

        photoPreview.src = e.target.result;

    };

    reader.readAsDataURL(file);

});

// ==========================================
// Cancel
// ==========================================

cancelBtn.addEventListener("click", () => {

    window.location.href = "app.html";

});

// ==========================================
// Save (Temporary)
// ==========================================

saveWin.addEventListener("click", () => {

    if (!winTitle.value.trim()) {

        alert("Please enter a title.");

        return;

    }

    if (!winStory.value.trim()) {

        alert("Please tell your story.");

        return;

    }

    alert("Record Little Win - Save feature (next step).");

});

