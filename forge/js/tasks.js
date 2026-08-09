/* ======================================
   FORGE Community Tasks
====================================== */

const taskModal = document.getElementById("taskModal");
const taskModalContent = document.getElementById("taskModalContent");
const taskModalClose = document.querySelector(".task-modal-close");


/* ======================================
   TASK DATA
====================================== */

const TASKS = {

    follow_baby_leam: {

        title: "Follow Baby Leam's Page",

        description:
            "Follow the Baby Leam Facebook Page and submit your proof to earn 1 SPARK.",

        reward: 1,

        platform: "Facebook",

        link:
            "https://facebook.com/BabyLeamOfficial",

        proofLabel:
            "Facebook Name / Page",

        proofPlaceholder:
            "Enter your Facebook name",

        proofDescription:
            "Provide the name or Page you used to follow Baby Leam."

    }

};


/* ======================================
   OPEN TASK
====================================== */

document.querySelectorAll(".task-card").forEach(card => {

    card.addEventListener("click", () => {

        const taskId = card.dataset.task;

        openTask(taskId);

    });

});


/* ======================================
   OPEN MODAL
====================================== */

function openTask(taskId) {

    const task = TASKS[taskId];

    if (!task) {

        console.warn("Task not found:", taskId);

        return;

    }


    taskModalContent.innerHTML = `

        <div class="task-reward-badge">

            <i class="fa-solid fa-bolt"></i>

            +${task.reward} SPARK

        </div>


        <h2>
            ${task.title}
        </h2>


        <p class="task-modal-intro">
            ${task.description}
        </p>


        <!-- STEP 1 -->

        <div class="task-step">

            <div class="task-step-number">
                1
            </div>


            <div class="task-step-content">

                <h3>
                    Follow the Facebook Page
                </h3>

                <p>
                    Open the Baby Leam Facebook Page and follow the page.
                </p>


                <a
                    href="${task.link}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="task-open-btn"
                >

                    <i class="fa-brands fa-facebook"></i>

                    Open Facebook Page

                    <i class="fa-solid fa-arrow-up-right-from-square"></i>

                </a>

            </div>

        </div>


        <!-- STEP 2 -->

        <div class="task-step">

            <div class="task-step-number">
                2
            </div>


            <div class="task-step-content">

                <h3>
                    Enter your Facebook name
                </h3>

                <p>
                    ${task.proofDescription}
                </p>


                <label
                    class="proof-label"
                    for="proofName"
                >
                    ${task.proofLabel}
                </label>


                <input
                    type="text"
                    id="proofName"
                    class="proof-input"
                    placeholder="${task.proofPlaceholder}"
                    autocomplete="off"
                >

            </div>

        </div>


        <!-- STEP 3 -->

        <div class="task-step">

            <div class="task-step-number">
                3
            </div>


            <div class="task-step-content">

                <h3>
                    Upload screenshot proof
                </h3>

                <p>
                    Upload a screenshot showing that you followed the page.
                </p>


                <label
                    for="proofScreenshot"
                    class="screenshot-upload"
                >

                    <i class="fa-solid fa-camera"></i>

                    <strong>
                        Upload Screenshot
                    </strong>

                    <small>
                        PNG, JPG • Max 5 MB
                    </small>

                </label>


                <input
                    type="file"
                    id="proofScreenshot"
                    accept="image/png,image/jpeg"
                    hidden
                >


                <div
                    id="screenshotPreview"
                    class="screenshot-preview"
                    style="display:none;"
                >

                    <img
                        id="previewImage"
                        src=""
                        alt="Screenshot preview"
                    >

                    <button
                        type="button"
                        id="removeScreenshot"
                        class="remove-screenshot"
                    >

                        <i class="fa-solid fa-trash"></i>

                        Remove Screenshot

                    </button>

                </div>

            </div>

        </div>


        <!-- REVIEW NOTICE -->

        <div class="review-notice">

            <i class="fa-solid fa-circle-info"></i>

            <p>
                Your submission will be reviewed before the SPARK
                is added to your account.
            </p>

        </div>


        <!-- SUBMIT -->

        <button
            type="button"
            id="submitTask"
            class="submit-task-btn"
            disabled
        >

            <i class="fa-solid fa-paper-plane"></i>

            Submit for Review

        </button>

    `;


    taskModal.classList.add("is-open");

    document.body.style.overflow = "hidden";


    setupProofForm();

}


/* ======================================
   PROOF FORM
====================================== */

function setupProofForm() {

    const nameInput =
        document.getElementById("proofName");

    const screenshotInput =
        document.getElementById("proofScreenshot");

    const submitButton =
        document.getElementById("submitTask");

    const preview =
        document.getElementById("screenshotPreview");

    const previewImage =
        document.getElementById("previewImage");

    const removeButton =
        document.getElementById("removeScreenshot");


    let screenshotReady = false;


    /* ==================================
       Screenshot Upload
    ================================== */

    screenshotInput.addEventListener("change", () => {

        const file = screenshotInput.files[0];

        if (!file) {

            screenshotReady = false;

            updateSubmitButton();

            return;

        }


        /* File type */

        if (!["image/png", "image/jpeg"].includes(file.type)) {

            alert("Please upload a PNG or JPG image.");

            screenshotInput.value = "";

            screenshotReady = false;

            updateSubmitButton();

            return;

        }


        /* 5 MB limit */

        if (file.size > 5 * 1024 * 1024) {

            alert("Screenshot must be 5 MB or smaller.");

            screenshotInput.value = "";

            screenshotReady = false;

            updateSubmitButton();

            return;

        }


        const reader = new FileReader();


        reader.onload = event => {

            previewImage.src = event.target.result;

            preview.style.display = "block";

            screenshotReady = true;

            updateSubmitButton();

        };


        reader.readAsDataURL(file);

    });


    /* ==================================
       Remove Screenshot
    ================================== */

    removeButton.addEventListener("click", () => {

        screenshotInput.value = "";

        previewImage.src = "";

        preview.style.display = "none";

        screenshotReady = false;

        updateSubmitButton();

    });


    /* ==================================
       Name Input
    ================================== */

    nameInput.addEventListener("input", updateSubmitButton);


    /* ==================================
       Submit Button
    ================================== */

    submitButton.addEventListener("click", () => {

        const name =
            nameInput.value.trim();

        const file =
            screenshotInput.files[0];


        if (!name || !file) {

            return;

        }


        /*
         * FRONTEND TEST ONLY
         *
         * No SPARK is awarded here.
         * Backend/admin validation will be
         * connected later.
         */

        submitButton.disabled = true;

        submitButton.innerHTML = `

            <i class="fa-solid fa-clock"></i>

            Pending Review

        `;


        nameInput.disabled = true;

        screenshotInput.disabled = true;


        const uploadLabel =
            document.querySelector(".screenshot-upload");

        if (uploadLabel) {

            uploadLabel.style.pointerEvents = "none";

            uploadLabel.style.opacity = ".6";

        }


        alert(
            "Your proof has been submitted for review."
        );

    });


    /* ==================================
       Validate Form
    ================================== */

    function updateSubmitButton() {

        const validName =
            nameInput.value.trim().length > 0;


        submitButton.disabled =
            !(validName && screenshotReady);

    }

}


/* ======================================
   CLOSE MODAL
====================================== */

function closeTaskModal() {

    taskModal.classList.remove("is-open");

    document.body.style.overflow = "";

}


taskModalClose.addEventListener(
    "click",
    closeTaskModal
);


/* ======================================
   CLOSE BY BACKDROP
====================================== */

taskModal.addEventListener("click", event => {

    if (event.target === taskModal) {

        closeTaskModal();

    }

});


/* ======================================
   ESC KEY
====================================== */

document.addEventListener("keydown", event => {

    if (
        event.key === "Escape" &&
        taskModal.classList.contains("is-open")
    ) {

        closeTaskModal();

    }

});
