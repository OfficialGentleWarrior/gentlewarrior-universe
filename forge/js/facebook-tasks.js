/* ======================================
   FACEBOOK TASK
   Directly open existing task modal
====================================== */

document.addEventListener("click", function (event) {

    const card = event.target.closest(
        '.task-card[data-task="follow_baby_leam"]'
    );

    if (!card) return;

    if (typeof openTask === "function") {

        openTask("follow_baby_leam");

    } else {

        alert("openTask() NOT FOUND");

    }

}, true);
