document.addEventListener("click", function (event) {

    const card = event.target.closest(
        '.task-card[data-task="follow_baby_leam"]'
    );

    if (!card) return;

    const modal = document.getElementById("taskModal");
    const content = document.getElementById("taskModalContent");

    if (!modal) {
        alert("taskModal NOT FOUND");
        return;
    }

    if (!content) {
        alert("taskModalContent NOT FOUND");
        return;
    }

    alert(
        "FOUND BOTH\n\n" +
        "Modal class: " + modal.className
    );

}, true);
