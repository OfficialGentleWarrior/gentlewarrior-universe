document.addEventListener("click", function (event) {

    const card = event.target.closest(
        '.task-card[data-task="follow_baby_leam"]'
    );

    if (!card) return;

    alert("BABY LEAM CARD CLICK DETECTED");

}, true);
