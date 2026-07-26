import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { generateLink } from "./generate/generate.js";

// ======================================
// Authentication Guard
// ======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

});

// ======================================
// FORGE Generate Link
// ======================================

// Elements
const uploadBox = document.getElementById("uploadBox");
const imageInput = document.getElementById("previewImage");

const imagePreview = document.getElementById("imagePreview");
const previewCardImage = document.getElementById("previewCardImage");
const previewPlaceholder = document.getElementById("previewPlaceholder");

const urlInput = document.getElementById("destinationUrl");
const previewDomain = document.getElementById("previewDomain");

const generateBtn = document.getElementById("generateBtn");
const clearImageBtn = document.getElementById("clearImageBtn");

// ======================================
// Upload Image
// ======================================

uploadBox.addEventListener("click", () => {
    imageInput.click();
});

imageInput.addEventListener("change", (e) => {

    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        alert("Image must be 5 MB or smaller.");
        imageInput.value = "";
        validateForm();
        return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {

        const imageUrl = event.target.result;

        imagePreview.src = imageUrl;
        imagePreview.style.display = "block";

        previewCardImage.src = imageUrl;
        previewCardImage.style.display = "block";

        previewPlaceholder.style.display = "none";

        validateForm();

    };

    reader.readAsDataURL(file);

});

// ======================================
// Clear Image
// ======================================

function clearImage() {

    imageInput.value = "";

    imagePreview.src = "";
    imagePreview.style.display = "none";

    previewCardImage.src = "";
    previewCardImage.style.display = "none";

    previewPlaceholder.style.display = "block";

    validateForm();

}

clearImageBtn.addEventListener("click", clearImage);

// ======================================
// Destination URL
// ======================================

urlInput.addEventListener("input", () => {

    try {

        const url = new URL(urlInput.value.trim());

        previewDomain.textContent = url.hostname;

    } catch {

        previewDomain.textContent = "gentlewarrior.world";

    }

    validateForm();

});

// ======================================
// Form Validation
// ======================================

function validateForm() {

    const hasImage = imageInput.files.length > 0;

    let validUrl = false;

    try {

        const url = new URL(urlInput.value.trim());

        validUrl =
            url.protocol === "http:" ||
            url.protocol === "https:";

    } catch {

        validUrl = false;

    }

    if (urlInput.value.trim() !== "" && !validUrl) {
        urlInput.classList.add("input-error");
    } else {
        urlInput.classList.remove("input-error");
    }

    generateBtn.disabled = !(hasImage && validUrl);

}

// ======================================
// Generate Button
// ======================================

generateBtn.addEventListener("click", generateLink);
