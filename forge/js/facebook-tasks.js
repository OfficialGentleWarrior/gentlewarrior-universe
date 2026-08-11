/* ======================================
   FACEBOOK TASK DIAGNOSTIC
====================================== */

document.addEventListener("click", function (event) {

    const card = event.target.closest(
        '.task-card[data-task="follow_baby_leam"]'
    );

    if (!card) return;

    alert(
        "CARD FOUND\n\nopenTask type: " +
        typeof openTask
    );

}, true);
