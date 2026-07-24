/* ==========================
   FORGE Login
========================== */

document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("form");

    const loginBtn = document.querySelector(".login-btn");
    const facebookBtn = document.querySelector(".facebook-btn");
    const googleBtn = document.querySelector(".google-btn");

    /* ==========================
       Email Login
    ========================== */

    form.addEventListener("submit", (e) => {

        e.preventDefault();

        loginBtn.disabled = true;
        loginBtn.textContent = "Signing In...";

        setTimeout(() => {

            // TODO:
            // Replace with Firebase Email Login

            window.location.href = "dashboard.html";

        }, 1000);

    });

    /* ==========================
       Facebook Login
    ========================== */

    facebookBtn.addEventListener("click", () => {

        facebookBtn.disabled = true;
        facebookBtn.textContent = "Connecting...";

        setTimeout(() => {

            // TODO:
            // Firebase Facebook Authentication

            window.location.href = "dashboard.html";

        }, 1000);

    });

    /* ==========================
       Google Login
    ========================== */

    googleBtn.addEventListener("click", () => {

        googleBtn.disabled = true;
        googleBtn.textContent = "Connecting...";

        setTimeout(() => {

            // TODO:
            // Firebase Google Authentication

            window.location.href = "dashboard.html";

        }, 1000);

    });

});
