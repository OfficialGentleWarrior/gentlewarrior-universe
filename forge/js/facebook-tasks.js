alert("FACEBOOK JS LOADED");

/* ======================================
   FORGE Facebook Tasks
   Isolated Facebook Module
====================================== */

const FACEBOOK_TASKS = {

    follow_baby_leam: {

        title: "Follow Baby Leam's Page",

        description:
            "Follow the Baby Leam Facebook Page and submit your proof to earn 1 SPARK.",

        reward: 1,

        link:
            "https://www.facebook.com/BabyLeamOfficial",

        stepTitle:
            "Follow the Facebook Page",

        stepDescription:
            "Open the Baby Leam Facebook Page and follow the page.",

        proofLabel:
            "Facebook Name / Page",

        proofPlaceholder:
            "Enter your Facebook name or Page",

        proofDescription:
            "Provide the name or Page you used to follow Baby Leam."

    },


    follow_gentle_warrior: {

        title: "Follow Gentle Warrior's Page",

        description:
            "Follow the Gentle Warrior Facebook Page and submit your proof to earn 1 SPARK.",

        reward: 1,

        link:
            "https://www.facebook.com/GentleWarriorOfficial",

        stepTitle:
            "Follow the Facebook Page",

        stepDescription:
            "Open the Gentle Warrior Facebook Page and follow the page.",

        proofLabel:
            "Facebook Name / Page",

        proofPlaceholder:
            "Enter your Facebook name or Page",

        proofDescription:
            "Provide the name or Page you used to follow Gentle Warrior."

    }

};


/* ======================================
   FACEBOOK TASK CLICK
====================================== */

document.addEventListener("click", function (event) {

    const card =
        event.target.closest(".task-card");

    if (!card) return;

    const taskId =
        card.dataset.task;

    const task =
        FACEBOOK_TASKS[taskId];

    if (!task) return;


    event.preventDefault();
    event.stopImmediatePropagation();


    openFacebookTask(task);

}, true);


/* ======================================
   OPEN FACEBOOK TASK
====================================== */

function openFacebookTask(task) {

    const modal =
        document.getElementById("taskModal");

    const content =
        document.getElementById("taskModalContent");

    if (!modal || !content) return;


    content.innerHTML = `

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
                    ${task.stepTitle}
                </h3>


                <p>
                    ${task.stepDescription}
                </p>


                <a
                    href="${task.link}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="task-open-btn"
                >

                    <i class="fa-brands fa-facebook"></i>

                    Open Facebook

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
                    for="facebookProofName"
                >
                    ${task.proofLabel}
                </label>


                <input
                    type="text"
                    id="facebookProofName"
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
                    Upload a screenshot showing that you completed this task.
                </p>


                <label
                    for="facebookProofScreenshot"
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
                    id="facebookProofScreenshot"
                    accept="image/png,image/jpeg"
                    hidden
                >


                <div
                    id="facebookScreenshotPreview"
                    class="screenshot-preview"
                    style="display:none;"
                >

                    <img
                        id="facebookPreviewImage"
                        src=""
                        alt="Screenshot preview"
                    >


                    <button
                        type="button"
                        id="facebookRemoveScreenshot"
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
            id="facebookSubmitTask"
            class="submit-task-btn"
            disabled
        >

            <i class="fa-solid fa-paper-plane"></i>

            Submit for Review

        </button>

    `;


    modal.classList.add("is-open");

    document.body.style.overflow = "hidden";


    setupFacebookProof();

}


/* ======================================
   FACEBOOK PROOF
====================================== */

function setupFacebookProof() {

    const nameInput =
        document.getElementById("facebookProofName");

    const screenshotInput =
        document.getElementById("facebookProofScreenshot");

    const submitButton =
        document.getElementById("facebookSubmitTask");

    const preview =
        document.getElementById("facebookScreenshotPreview");

    const previewImage =
        document.getElementById("facebookPreviewImage");

    const removeButton =
        document.getElementById("facebookRemoveScreenshot");


    let screenshotReady = false;


    screenshotInput.addEventListener(
        "change",
        function () {

            const file =
                screenshotInput.files[0];

            if (!file) {

                screenshotReady = false;

                updateFacebookSubmit();

                return;

            }


            if (
                !["image/png", "image/jpeg"]
                    .includes(file.type)
            ) {

                alert(
                    "Please upload a PNG or JPG image."
                );

                screenshotInput.value = "";

                screenshotReady = false;

                updateFacebookSubmit();

                return;

            }


            if (
                file.size >
                5 * 1024 * 1024
            ) {

                alert(
                    "Screenshot must be 5 MB or smaller."
                );

                screenshotInput.value = "";

                screenshotReady = false;

                updateFacebookSubmit();

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    previewImage.src =
                        event.target.result;

                    preview.style.display =
                        "block";

                    screenshotReady =
                        true;

                    updateFacebookSubmit();

                };


            reader.readAsDataURL(file);

        }
    );


    removeButton.addEventListener(
        "click",
        function () {

            screenshotInput.value =
                "";

            previewImage.src =
                "";

            preview.style.display =
                "none";

            screenshotReady =
                false;

            updateFacebookSubmit();

        }
    );


    nameInput.addEventListener(
        "input",
        updateFacebookSubmit
    );


    submitButton.addEventListener(
        "click",
        function () {

            if (
                !nameInput.value.trim() ||
                !screenshotInput.files[0]
            ) {
                return;
            }


            submitButton.disabled =
                true;

            submitButton.innerHTML = `

                <i class="fa-solid fa-clock"></i>

                Pending Review

            `;


            nameInput.disabled =
                true;

            screenshotInput.disabled =
                true;


            alert(
                "Your proof has been submitted for review."
            );

        }
    );


    function updateFacebookSubmit() {

        const validName =
            nameInput.value.trim().length > 0;


        submitButton.disabled =
            !(
                validName &&
                screenshotReady
            );

    }

}
