/* ==========================
   FORGE Login
========================== */

import {
    auth,
    db,
    googleProvider,
} from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    signInWithEmailAndPassword,
    signInWithPopup,
    getRedirectResult,
    signOut,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", async () => {

    try {

        const result = await getRedirectResult(auth);

        if (result) {

            const user = result.user;

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {

                await setDoc(userRef, {

                    fullName: user.displayName || user.email?.split("@")[0] || "",

                    email: (user.email || "").toLowerCase(),

                    role: "user",

                    credits: 0,

                    welcomeClaimed: false,

                    isActive: true,

                    createdAt: serverTimestamp(),

                    updatedAt: serverTimestamp()

                });

            }

            window.location.href = "dashboard.html";
            return;

        }

    } catch (error) {

        console.error(error);

    }

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
    const googleBtn = document.querySelector(".google-btn");
    const forgotPassword = document.getElementById("forgotPassword");

    /* ==========================
       Email Login
    ========================== */

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        loginBtn.disabled = true;
        loginBtn.textContent = "Signing In...";

        try {

            const userCredential = await signInWithEmailAndPassword(
                auth,
                emailInput.value.trim(),
                passwordInput.value
            );

            const user = userCredential.user;

            await user.reload();

            if (!user.emailVerified) {

                await signOut(auth);

                alert(`Please verify your email address before logging in.

Email Address:

${user.email}

A verification email was sent when you created your FORGE account.

Please check your inbox (or Spam folder) and click the verification link before signing in.`);

                return;

            }

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

            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {

                await setDoc(userRef, {

                    fullName: user.displayName || user.email?.split("@")[0] || "",
                    email: (user.email || "").toLowerCase(),
                    role: "user",
                    credits: 0,
                    welcomeClaimed: false,
                    isActive: true,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()

                });

            }

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
       Forgot Password
    ========================== */

    forgotPassword.addEventListener("click", async (e) => {

        e.preventDefault();

        const email = emailInput.value.trim();

        if (!email) {

            alert("Please enter your email address first.");
            return;

        }

        try {

            await sendPasswordResetEmail(auth, email);

            alert("A password reset email has been sent for your FORGE account.\n\nPlease check your inbox and follow the instructions to reset your password.");

        } catch (error) {

            console.error(error);
            alert(error.message);

        }

    });

});
