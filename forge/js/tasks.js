/* ======================================
   FORGE Tasks
====================================== */


/* ======================================
   Modal Elements
====================================== */

const taskModal = document.getElementById("taskModal");
const taskModalContent = document.getElementById("taskModalContent");
const taskModalClose = document.querySelector(".task-modal-close");


/* ======================================
   TASK DATA
====================================== */

const TASKS = {

    /* ==================================
       COMMUNITY — TASK 1
    ================================== */

    follow_baby_leam: {

        title: "Follow Baby Leam's Page",

        description:
            "Follow the Baby Leam Facebook Page and submit your proof to earn 1 SPARK.",

        reward: 1,

        platform: "Facebook",

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


    /* ==================================
       COMMUNITY — TASK 2
    ================================== */

    follow_gentle_warrior: {

        title: "Follow Gentle Warrior's Page",

        description:
            "Follow the Gentle Warrior Facebook Page and submit your proof to earn 1 SPARK.",

        reward: 1,

        platform: "Facebook",

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

    },


    /* ==================================
       COMMUNITY — TASK 17
    ================================== */

    join_messenger_gc: {

        title: "Join our Messenger GC",

        description:
            "Join the Gentle Warrior Messenger community and submit your proof to earn 1 SPARK.",

        reward: 1,

        platform: "Messenger",

        link:
            "https://m.me/j/AbYNtC1uuP4G7bLe/?send_source=gc%3Acopy_invite_link_c",

        stepTitle:
            "Join the Messenger Group",

        stepDescription:
            "Open the Messenger invitation and join the Gentle Warrior community chat.",

        proofLabel:
            "Messenger Name",

        proofPlaceholder:
            "Enter your Messenger name",

        proofDescription:
            "Provide the Messenger name you used to join the community."

    },


    /* ==================================
       COMMUNITY — TASK 18
    ================================== */

    join_tg_community: {

        title: "Join our TG Community",

        description:
            "Join the Gentle Warrior Telegram community and submit your proof to earn 1 SPARK.",

        reward: 1,

        platform: "Telegram",

        link:
            "https://t.me/OfficialGentleWarriorHQ/632",

        stepTitle:
            "Join the Telegram Community",

        stepDescription:
            "Open the Telegram community link and join the Gentle Warrior community.",

        proofLabel:
            "Telegram Username",

        proofPlaceholder:
            "Enter your Telegram username",

        proofDescription:
            "Provide the Telegram username you used to join the community."

    },


    /* ==================================
       COMMUNITY — TASK 19
    ================================== */

    join_x_community: {

        title: "Join our X Community",

        description:
            "Join the Gentle Warrior X Community and submit your proof to earn 1 SPARK.",

        reward: 1,

        platform: "X",

        link:
            "https://x.com/i/communities/1991734527128137859",

        stepTitle:
            "Join the X Community",

        stepDescription:
            "Open the X Community and join the Gentle Warrior community.",

        proofLabel:
            "X Username",

        proofPlaceholder:
            "Enter your X username",

        proofDescription:
            "Provide the X username you used to join the community."

    },


    /* ==================================
       MUSIC — TASK 1
    ================================== */

    follow_gentle_warrior_spotify: {

        title:
            "Follow Gentle Warrior on Spotify",

        description:
            "Follow Gentle Warrior on Spotify and submit your proof to earn 1 SPARK.",

        reward: 1,

        platform: "Spotify",

        link:
            "https://open.spotify.com/album/438CnMtDfkQmC8860coayj",

        stepTitle:
            "Follow Gentle Warrior on Spotify",

        stepDescription:
            "Open Gentle Warrior on Spotify and follow the artist.",

        proofLabel:
            "Spotify Name",

        proofPlaceholder:
            "Enter your Spotify name",

        proofDescription:
            "Provide the Spotify name you used to follow Gentle Warrior."

    },


    /* ==================================
       MUSIC — TASK 2
    ================================== */

    add_gentle_warrior_playlist: {

        title:
            "Add Gentle Warrior's Music to Your Spotify Playlist",

        description:
            "Add Gentle Warrior's music to your Spotify playlist and submit your proof to earn 1 SPARK.",

        reward: 1,

        platform: "Spotify",

        link:
            "https://open.spotify.com/album/438CnMtDfkQmC8860coayj",

        stepTitle:
            "Add Gentle Warrior's Music to Your Playlist",

        stepDescription:
            "Open Gentle Warrior on Spotify and add the music to one of your playlists.",

        proofLabel:
            "Spotify Name",

        proofPlaceholder:
            "Enter your Spotify name",

        proofDescription:
            "Provide the Spotify name you used to add the music to your playlist."

    },


    /* ==================================
       MUSIC — TASK 3
    ================================== */

    share_gentle_warrior_spotify: {

        title:
            "Share Gentle Warrior on Spotify",

        description:
            "Share Gentle Warrior's music on Spotify and submit your proof to earn 1 SPARK.",

        reward: 1,

        platform: "Spotify",

        link:
            "https://open.spotify.com/album/438CnMtDfkQmC8860coayj",

        stepTitle:
            "Share Gentle Warrior on Spotify",

        stepDescription:
            "Open Gentle Warrior on Spotify and share the music.",

        proofLabel:
            "Spotify Name",

        proofPlaceholder:
            "Enter your Spotify name",

        proofDescription:
            "Provide the Spotify name you used to share Gentle Warrior."

    },


    /* ==================================
       MUSIC — TASK 4
    ================================== */

    listen_gentle_warrior_spotify: {

        title:
            "Listen to Gentle Warrior on Spotify",

        description:
            "Listen to Gentle Warrior's music on Spotify and submit your proof to earn 1 SPARK.",

        reward: 1,

        platform: "Spotify",

        link:
            "https://open.spotify.com/album/438CnMtDfkQmC8860coayj",

        stepTitle:
            "Listen to Gentle Warrior on Spotify",

        stepDescription:
            "Open Gentle Warrior on Spotify and listen to the music.",

        proofLabel:
            "Spotify Name",

        proofPlaceholder:
            "Enter your Spotify name",

        proofDescription:
            "Provide the Spotify name you used to listen to Gentle Warrior."

    },


    /* ==================================
       YOUTUBE — TASK 1
    ================================== */

    follow_gentle_warrior_youtube: {

        title:
            "Subscribe to Gentle Warrior on YouTube",

        description:
            "Subscribe to the Gentle Warrior YouTube channel and submit your proof to earn 1 SPARK.",

        reward: 1,

        platform: "YouTube",

        link:
            "https://youtu.be/X7Xc8ulnvWs?si=cK7qW6WmL4cFWVwa",

        stepTitle:
            "Subscribe to the YouTube Channel",

        stepDescription:
            "Open the Gentle Warrior YouTube channel and subscribe.",

        proofLabel:
            "YouTube Name",

        proofPlaceholder:
            "Enter your YouTube name",

        proofDescription:
            "Provide the YouTube name you used to subscribe to Gentle Warrior."

    },


    /* ==================================
       YOUTUBE — TASK 2
    ================================== */

    like_gentle_warrior_youtube: {

        title:
            "Like Gentle Warrior's Music Video on YouTube",

        description:
            "Like the Gentle Warrior music video on YouTube and submit your proof to earn 1 SPARK.",

        reward: 1,

        platform: "YouTube",

        link:
            "https://youtu.be/X7Xc8ulnvWs?si=cK7qW6WmL4cFWVwa",

        stepTitle:
            "Like the Music Video",

        stepDescription:
            "Open the Gentle Warrior music video and tap the Like button.",

        proofLabel:
            "YouTube Name",

        proofPlaceholder:
            "Enter your YouTube name",

        proofDescription:
            "Provide the YouTube name you used to like the music video."

    },


    /* ==================================
       YOUTUBE — TASK 3
    ================================== */

    share_gentle_warrior_youtube: {

        title:
            "Share Gentle Warrior's Music Video on YouTube",

        description:
            "Share the Gentle Warrior music video on YouTube and submit your proof to earn 1 SPARK.",

        reward: 1,

        platform: "YouTube",

        link:
            "https://youtu.be/X7Xc8ulnvWs?si=cK7qW6WmL4cFWVwa",

        stepTitle:
            "Share the Music Video",

        stepDescription:
            "Open the Gentle Warrior music video and share it.",

        proofLabel:
            "YouTube Name",

        proofPlaceholder:
            "Enter your YouTube name",

        proofDescription:
            "Provide the YouTube name you used to share the music video."

        },


    /* ==================================
       GAMES — TASK 11
    ================================== */

    reach_memory_level_5: {

    title:
        "Reach Level 5 in Memory Game",

    description:
        "Reach Level 5 in the Memory Game and submit your proof to earn 1 SPARK.",

    reward: 1,

    platform: "Game",

    link:
        "https://gentlewarrior.world/#play",

    stepTitle:
        "Reach Level 5 in Memory Game",

    stepDescription:
        "Open the Memory Game and reach Level 5.",

    proofLabel:
        "Player's Name",

    proofPlaceholder:
        "Enter your player's name",

    proofDescription:
        "Provide the player's name used in the Memory Game."

},


/* ==================================
   GAMES — TASK 12
================================== */

reach_heart_defender_level_5: {

    title:
        "Reach Level 5 in Heart Defender",

    description:
        "Reach Level 5 in Heart Defender and submit your proof to earn 1 SPARK.",

    reward: 1,

    platform: "Game",

    link:
        "https://gentlewarrior.world/heart-defender",

    stepTitle:
        "Reach Level 5 in Heart Defender",

    stepDescription:
        "Open Heart Defender and reach Level 5.",

    proofLabel:
        "Player's Name",

    proofPlaceholder:
        "Enter your player's name",

    proofDescription:
        "Provide the player's name used in Heart Defender."

},


/* ==================================
   GAMES — TASK 13
================================== */

reach_pillar_match_level_5: {

    title:
        "Reach Level 5 in Pillar Match",

    description:
        "Reach Level 5 in Pillar Match and submit your proof to earn 1 SPARK.",

    reward: 1,

    platform: "Game",

    link:
        "https://gentlewarrior.world/pillars-match",

    stepTitle:
        "Reach Level 5 in Pillar Match",

    stepDescription:
        "Open Pillar Match and reach Level 5.",

    proofLabel:
        "Player's Name",

    proofPlaceholder:
        "Enter your player's name",

        proofDescription:
        "Provide the player's name used in Pillar Match."

    }

};

/* ======================================
   PLATFORM CONFIG
====================================== */

const PLATFORM_CONFIG = {

    Facebook: {
        icon: "fa-brands fa-facebook",
        buttonText: "Open Facebook"
    },

    Messenger: {
        icon: "fa-brands fa-facebook-messenger",
        buttonText: "Open Messenger"
    },

    Telegram: {
        icon: "fa-brands fa-telegram",
        buttonText: "Open Telegram"
    },

    X: {
        icon: "fa-brands fa-x-twitter",
        buttonText: "Open X"
    },

    Spotify: {
        icon: "fa-brands fa-spotify",
        buttonText: "Open Spotify"
    },

    YouTube: {
        icon: "fa-brands fa-youtube",
        buttonText: "Open YouTube"
    },

    Game: {
        icon: "fa-solid fa-gamepad",
        buttonText: "Open Game"
    }

};

/* ======================================
   TASK CARD CLICK
====================================== */

document.querySelectorAll(".task-card").forEach(card => {

    card.addEventListener("click", () => {

        const taskId = card.dataset.task;

        openTask(taskId);

    });

});


/* ======================================
   OPEN TASK MODAL
====================================== */

function openTask(taskId) {

    const task = TASKS[taskId];

    if (!task) {

        console.warn("Task not found:", taskId);

        return;

    }


    const platform =
        PLATFORM_CONFIG[task.platform] || {

            icon:
                "fa-solid fa-arrow-up-right-from-square",

            buttonText:
                `Open ${task.platform}`

        };


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


        <!-- ==================================
             STEP 1
        ================================== -->

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


                <!-- ==================================
                     NATIVE EXTERNAL LINK
                ================================== -->

                <a
    href="${task.link}"
    target="_blank"
    rel="noopener"
    class="task-open-btn"
    data-external-link="true"
>

                    <i class="${platform.icon}"></i>

                    ${platform.buttonText}

                    <i class="fa-solid fa-arrow-up-right-from-square"></i>

                </a>

            </div>

        </div>


        <!-- ==================================
             STEP 2
        ================================== -->

        <div class="task-step">

            <div class="task-step-number">
                2
            </div>


            <div class="task-step-content">

                <h3>
                    Enter your ${task.platform} name
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


        <!-- ==================================
             STEP 3
        ================================== -->

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


        <!-- ==================================
             REVIEW NOTICE
        ================================== -->

        <div class="review-notice">

            <i class="fa-solid fa-circle-info"></i>

            <p>
                Your submission will be reviewed before the SPARK
                is added to your account.
            </p>

        </div>


        <!-- ==================================
             SUBMIT
        ================================== -->

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

        const file =
            screenshotInput.files[0];


        if (!file) {

            screenshotReady = false;

            updateSubmitButton();

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

            updateSubmitButton();

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

            updateSubmitButton();

            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            event => {

                previewImage.src =
                    event.target.result;

                preview.style.display =
                    "block";

                screenshotReady =
                    true;

                updateSubmitButton();

            };


        reader.readAsDataURL(file);

    });


    /* ==================================
       Remove Screenshot
    ================================== */

    removeButton.addEventListener(
        "click",
        () => {

            screenshotInput.value =
                "";

            previewImage.src =
                "";

            preview.style.display =
                "none";

            screenshotReady =
                false;

            updateSubmitButton();

        }
    );


    /* ==================================
       Name Input
    ================================== */

    nameInput.addEventListener(
        "input",
        updateSubmitButton
    );


    /* ==================================
       Submit
    ================================== */

    submitButton.addEventListener(
        "click",
        () => {

            const name =
                nameInput.value.trim();

            const file =
                screenshotInput.files[0];


            if (
                !name ||
                !file
            ) {

                return;

            }


            /*
             * FRONTEND ONLY
             *
             * No SPARK is awarded.
             * Backend/admin validation comes later.
             */

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


            const uploadLabel =
                document.querySelector(
                    ".screenshot-upload"
                );


            if (uploadLabel) {

                uploadLabel.style.pointerEvents =
                    "none";

                uploadLabel.style.opacity =
                    ".6";

            }


            alert(
                "Your proof has been submitted for review."
            );

        }
    );


    /* ==================================
       Validate
    ================================== */

    function updateSubmitButton() {

        const validName =
            nameInput.value.trim().length >
            0;


        submitButton.disabled =
            !(
                validName &&
                screenshotReady
            );

    }

}


/* ======================================
   CLOSE MODAL
====================================== */

function closeTaskModal() {

    taskModal.classList.remove(
        "is-open"
    );

    document.body.style.overflow =
        "";

}


if (taskModalClose) {

    taskModalClose.addEventListener(
        "click",
        closeTaskModal
    );

}


/* ======================================
   CLOSE BACKDROP
====================================== */

if (taskModal) {

    taskModal.addEventListener(
        "click",
        event => {

            if (
                event.target === taskModal
            ) {

                closeTaskModal();

            }

        }
    );

}


/* ======================================
   ESC KEY
====================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            taskModal &&
            taskModal.classList.contains(
                "is-open"
            )
        ) {

            closeTaskModal();

        }

    }
);

/* ======================================
   EXTERNAL TASK LINK
   Native tap handling
====================================== */

document.addEventListener("click", function (event) {

    const link = event.target.closest(
        'a[data-external-link="true"]'
    );

    if (!link) return;

    event.stopPropagation();

}, true);
