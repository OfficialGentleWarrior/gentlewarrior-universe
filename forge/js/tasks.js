// ======================================
// FORGE Tasks
// Task 1 Frontend
// ======================================


// ======================================
// Elements
// ======================================

const taskCard = document.getElementById("followBabyLeamTask");

const taskModal = document.getElementById("taskModal");
const closeTaskModal = document.getElementById("closeTaskModal");

const facebookName = document.getElementById("facebookName");

const proofScreenshot = document.getElementById("proofScreenshot");

const screenshotPreview =
    document.getElementById("screenshotPreview");

const proofPreviewImage =
    document.getElementById("proofPreviewImage");

const removeScreenshot =
    document.getElementById("removeScreenshot");

const submitTaskBtn =
    document.getElementById("submitTaskBtn");


// ======================================
// Task State
// ======================================

let selectedScreenshot = null;

let taskSubmitted = false;


// ======================================
// Open Task Modal
// ======================================

taskCard.addEventListener("click", () => {

    if (taskSubmitted) {
        return;
    }

    openTaskModal();

});


// ======================================
// Open Modal
// ======================================

function openTaskModal() {

    taskModal.classList.add("is-open");

    taskModal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

}


// ======================================
// Close Modal
// ======================================

function closeModal() {

    taskModal.classList.remove("is-open");

    taskModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

}

closeTaskModal.addEventListener("click", closeModal);


// ======================================
// Close when clicking backdrop
// ======================================

taskModal.addEventListener("click", (event) => {

    if (event.target === taskModal) {

        closeModal();

    }

});


// ======================================
// ESC to Close
// ======================================

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        closeModal();

    }

});


// ======================================
// Facebook Name
// ======================================

facebookName.addEventListener("input", () => {

    validateSubmission();

});


// ======================================
// Screenshot Upload
// ======================================

proofScreenshot.addEventListener("change", (event) => {

    const file = event.target.files[0];

    if (!file) {
        return;
    }


    // Check file type

    const allowedTypes = [
        "image/jpeg",
        "image/png"
    ];

    if (!allowedTypes.includes(file.type)) {

        alert("Please upload a PNG or JPG screenshot.");

        proofScreenshot.value = "";

        selectedScreenshot = null;

        hideScreenshotPreview();

        validateSubmission();

        return;

    }


    // Check file size — 5 MB

    if (file.size > 5 * 1024 * 1024) {

        alert("Screenshot must be 5 MB or smaller.");

        proofScreenshot.value = "";

        selectedScreenshot = null;

        hideScreenshotPreview();

        validateSubmission();

        return;

    }


    selectedScreenshot = file;


    // Preview

    const reader = new FileReader();

    reader.onload = (event) => {

        proofPreviewImage.src = event.target.result;

        screenshotPreview.style.display = "block";

    };

    reader.readAsDataURL(file);


    validateSubmission();

});


// ======================================
// Remove Screenshot
// ======================================

removeScreenshot.addEventListener("click", () => {

    proofScreenshot.value = "";

    selectedScreenshot = null;

    hideScreenshotPreview();

    validateSubmission();

});


function hideScreenshotPreview() {

    screenshotPreview.style.display = "none";

    proofPreviewImage.src = "";

}


// ======================================
// Validation
// ======================================

function validateSubmission() {

    const hasName =
        facebookName.value.trim().length > 0;

    const hasScreenshot =
        selectedScreenshot !== null;


    submitTaskBtn.disabled =
        !(hasName && hasScreenshot);

}


// ======================================
// Submit Task
// ======================================

submitTaskBtn.addEventListener("click", () => {

    if (submitTaskBtn.disabled) {
        return;
    }


    // Frontend demo only

    taskSubmitted = true;


    // Close modal

    closeModal();


    // Change task card to Pending

    setTaskPending();


    // Clear form

    resetTaskForm();

});


// ======================================
// Pending State
// ======================================

function setTaskPending() {

    const reward =
        taskCard.querySelector(".task-card-reward");

    const arrow =
        taskCard.querySelector(".task-arrow");

    const description =
        taskCard.querySelector(".task-card-content span");


    taskCard.classList.add("task-pending");

    taskCard.disabled = true;


    description.textContent =
        "Proof submitted • Pending Review";


    reward.innerHTML = `
        <strong>⏳</strong>
        <small>PENDING</small>
    `;


    arrow.className =
        "fa-solid fa-clock task-arrow";

}


// ======================================
// Reset Form
// ======================================

function resetTaskForm() {

    facebookName.value = "";

    proofScreenshot.value = "";

    selectedScreenshot = null;

    hideScreenshotPreview();

    submitTaskBtn.disabled = true;

}


// ======================================
// Initial Validation
// ======================================

validateSubmission();
