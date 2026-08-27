/* ======================================
   FACEBOOK TASK — DIRECT TEST
====================================== */

document.addEventListener("click", function (event) {

    const card = event.target.closest(
        '.task-card[data-task="follow_baby_leam"]'
    );

    if (!card) return;

    setTimeout(function () {

        openTask("follow_baby_leam");

        setTimeout(function () {

            const modal =
                document.getElementById("taskModal");

            alert(
                "AFTER openTask\n\n" +
                "Modal class: " +
                modal.className
            );

        }, 300);

    }, 100);

}, true);
