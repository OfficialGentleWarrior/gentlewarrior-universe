/* ======================================
   FACEBOOK TASK BUTTON
   Separate handler
====================================== */

document.addEventListener("click", function (event) {

    const link = event.target.closest(".task-open-btn");

    if (!link) return;

    const url = link.getAttribute("href");

    if (!url) return;

    if (!url.includes("facebook.com")) return;

    event.preventDefault();
    event.stopPropagation();

    window.location.assign(url);

}, true);
