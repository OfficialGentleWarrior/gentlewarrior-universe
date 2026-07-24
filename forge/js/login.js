/* ==========================
   FORGE Login
========================== */

import {
    auth,
    googleProvider
} from "./firebase.js";

import {
    signInWithEmailAndPassword,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("form");

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {

    const isHidden = passwordInput.type === "password";

    passwordInput.type = isHidden ? "text" : "password";

    togglePassword.innerHTML = isHidden
        ? '<i class="fa-regular fa-eye-slash"></i>'
        : '<i class="fa-regular fa-eye"></i>';

});

    const loginBtn = document.querySelector(".login-btn");
    const facebookBtn = document.querySelector(".facebook-btn");
    const googleBtn = document.querySelector(".google-btn");


    /* ==========================
       Email Login
    ========================== */

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        loginBtn.disabled = true;
        loginBtn.textContent = "Signing In...";

        try {

            await signInWithEmailAndPassword(
                auth,
                emailInput.value.trim(),
                passwordInput.value
            );

            window.location.href = "dashboard.html";

        } catch (error) {

            console.error(error);

            switch (error.code) {

                case "auth/invalid-credential":
                    alert("Invalid email or password.");
                    break;

                case "auth/user-not-found":
                    alert("Account not found.");
                    break;

                case "auth/wrong-password":
                    alert("Incorrect password.");
                    break;

                case "auth/invalid-email":
                    alert("Invalid email.");
                    break;

                default:
                    alert(error.message);

            }

        } finally {

            loginBtn.disabled = false;
            loginBtn.textContent = "Sign In";

        }

    });


    /* ==========================
       Google Login
    ========================== */

    googleBtn.addEventListener("click", async () => {

        googleBtn.disabled = true;
        googleBtn.textContent = "Connecting...";

        try {

            await signInWithPopup(auth, googleProvider);

            window.location.href = "dashboard.html";

        } catch (error) {

            console.error(error);

            alert(error.message);

        } finally {

            googleBtn.disabled = false;
            googleBtn.textContent = "Continue with Google";

        }

    });


    /* ==========================
       Facebook Login
    ========================== */

    facebookBtn.addEventListener("click", () => {

        alert("Facebook Login coming soon.");

    });

});
