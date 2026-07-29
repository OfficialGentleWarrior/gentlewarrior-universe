import { auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const welcomeScreen =
    document.getElementById("welcomeScreen");

const step1 =
    document.getElementById("step1");

const step2 =
    document.getElementById("step2");

const step3 =
    document.getElementById("step3");

const continueSetup =
    document.getElementById("continueSetup");

const step1Continue =
    document.getElementById("step1Continue");

const step2Back =
    document.getElementById("step2Back");

const step2Continue =
    document.getElementById("step2Continue");

const step3Back =
    document.getElementById("step3Back");

const step3Continue =
    document.getElementById("step3Continue");

const journeyNameInput =
    document.getElementById("journeyName");

const optionButtons =
    document.querySelectorAll(".option-button");

const communityPicker =
    document.getElementById("communityPicker");

const communityModal =
    document.getElementById("communityModal");

const closeCommunityModal =
    document.getElementById("closeCommunityModal");

const communityOptions =
    document.querySelectorAll(".community-option");

const journeyData = {

    journeyFor: null,

    journeyName: "",

    community: ""

};


// ==========================================
// Authentication Guard
// ==========================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "index.html";
        return;

    }

});


// ==========================================
// Welcome → Step 1
// ==========================================

continueSetup.addEventListener("click", () => {

    welcomeScreen.classList.add("hidden");

    step1.classList.remove("hidden");

});


// ==========================================
// Step 1 Selection
// ==========================================

optionButtons.forEach(button => {

    button.addEventListener("click", () => {

        optionButtons.forEach(option => {

            option.classList.remove("selected");

        });

        button.classList.add("selected");

        journeyData.journeyFor =
            button.dataset.value;

        step1Continue.disabled = false;

        console.log(journeyData);

    });

});


// ==========================================
// Step 1 → Step 2
// ==========================================

step1Continue.addEventListener("click", () => {

    step1.classList.add("hidden");

    step2.classList.remove("hidden");

});


// ==========================================
// Step 2 → Step 1
// ==========================================

step2Back.addEventListener("click", () => {

    step2.classList.add("hidden");

    step1.classList.remove("hidden");

});


// ==========================================
// Step 2 Input
// ==========================================

journeyNameInput.addEventListener("input", () => {

    step2Continue.disabled =
        journeyNameInput.value.trim() === "";

});


// ==========================================
// Step 2 Continue
// ==========================================

step2Continue.addEventListener("click", () => {

    const journeyName =
        journeyNameInput.value.trim();

    if (!journeyName) {

        alert("Please enter a journey name.");

        return;

    }

    journeyData.journeyName =
        journeyName;

    console.log(journeyData);

    step2.classList.add("hidden");

    step3.classList.remove("hidden");

});


// ==========================================
// Community Picker
// ==========================================

communityPicker.addEventListener("click", () => {

    communityModal.classList.remove("hidden");

});

closeCommunityModal.addEventListener("click", () => {

    communityModal.classList.add("hidden");

});

communityOptions.forEach(option => {

    option.addEventListener("click", () => {

        const value = option.dataset.value;

        journeyData.community = value;

        communityPicker.textContent = option.textContent;

        step3Continue.disabled = false;

        communityModal.classList.add("hidden");

        console.log(journeyData);

    });

});


// ==========================================
// Step 3 → Step 2
// ==========================================

step3Back.addEventListener("click", () => {

    step3.classList.add("hidden");

    step2.classList.remove("hidden");

});


// ==========================================
// Step 3 Continue
// ==========================================

step3Continue.addEventListener("click", () => {

    if (!journeyData.community) {
        alert("Please select your community.");
        return;
    }

    console.log(journeyData);

    showStep(4);

});
