alert("NEW SIGNUP JS LOADED");

// ======================================
// FORGE Signup
// ======================================

import {
    auth,
    db,
    googleProvider,
    facebookProvider
} from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ======================================
// Elements
// ======================================

const form = document.getElementById("signupForm");

const fullName = document.getElementById("fullname");

const email = document.getElementById("email");

const password = document.getElementById("password");

const confirmPassword = document.getElementById("confirmPassword");

const signupBtn = document.getElementById("signupBtn");

const errorMessage = document.getElementById("errorMessage");

const passwordToggle = document.getElementById("passwordToggle");

const confirmPasswordToggle = document.getElementById("confirmPasswordToggle");

const googleBtn = document.querySelector(".google-btn");

const facebookBtn = document.querySelector(".facebook-btn");


// ======================================
// Error Messages
// ======================================

function showError(message){

    errorMessage.textContent = message;

    errorMessage.style.display = "block";

}

function hideError(){

    errorMessage.textContent = "";

    errorMessage.style.display = "none";

}


// ======================================
// Validation
// ======================================

form.addEventListener("submit", async function(e){

    e.preventDefault();

    hideError();

    if(password.value.length < 8){

        showError("Password must be at least 8 characters.");

        password.focus();

        return;

    }

    if(password.value !== confirmPassword.value){

        showError("Passwords do not match.");

        confirmPassword.focus();

        return;

    }

    signupBtn.disabled = true;

    signupBtn.textContent = "Creating Account...";

    try{

        // Firebase Authentication

        const userCredential =
            await createUserWithEmailAndPassword(

                auth,

                email.value,

                password.value

            );

        const user = userCredential.user;

// ======================================
// Save User to Firestore
// ======================================

        await setDoc(doc(db, "users", user.uid), {

            fullName: fullName.value.trim(),

            email: email.value.trim().toLowerCase(),

            role: "user",

            credits: 0,

welcomeClaimed: false,

isActive: true,

            createdAt: serverTimestamp(),

            updatedAt: serverTimestamp()

        });
// Send verification email

await sendEmailVerification(user);

        // ======================================
        // Redirect
        // ======================================

        alert(
`Account created successfully!

A verification email has been sent for your FORGE account.

Email Address:

${user.email}

Please check your inbox and click the verification link before logging in.`
);

// Sign out after signup
await auth.signOut();

window.location.href = "login.html";

    }catch(error){

    alert(error.code);
    alert(error.message);

    let message = "Something went wrong. Please try again.";


        switch(error.code){

            case "auth/email-already-in-use":

                message = "This email is already registered.";

                break;


            case "auth/invalid-email":

                message = "Please enter a valid email address.";

                break;


            case "auth/weak-password":

                message = "Password is too weak.";

                break;


            case "auth/network-request-failed":

                message = "No internet connection.";

                break;

        }

        showError(message);

    }finally{

        signupBtn.disabled = false;

        signupBtn.textContent = "Create Account";

    }

});


// =====================================
// Hide Error While Typing
// =====================================

password.addEventListener("input", hideError);

confirmPassword.addEventListener("input", hideError);

email.addEventListener("input", hideError);

fullName.addEventListener("input", hideError);


// =====================================
// Show / Hide Password
// =====================================

if(passwordToggle){

    passwordToggle.addEventListener("click", function(){

        if(password.type === "password"){

            password.type = "text";

            passwordToggle.classList.replace("fa-eye","fa-eye-slash");

        }else{

            password.type = "password";

            passwordToggle.classList.replace("fa-eye-slash","fa-eye");

        }

    });

}

if(confirmPasswordToggle){

    confirmPasswordToggle.addEventListener("click", function(){

        if(confirmPassword.type === "password"){

            confirmPassword.type = "text";

            confirmPasswordToggle.classList.replace("fa-eye","fa-eye-slash");

        }else{

            confirmPassword.type = "password";

            confirmPasswordToggle.classList.replace("fa-eye-slash","fa-eye");

        }



    });

}

// =====================================
// Google Signup
// =====================================

googleBtn.addEventListener("click", async () => {

    googleBtn.disabled = true;
    googleBtn.textContent = "Connecting...";

    try {

        // Google Authentication
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if Firestore user already exists
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        // Create only if first login
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
        showError(error.message);

    } finally {

        googleBtn.disabled = false;
        googleBtn.textContent = "Continue with Google";

    }

});

// =====================================
// Facebook Signup
// =====================================

facebookBtn.addEventListener("click", async () => {

    facebookBtn.disabled = true;
    facebookBtn.textContent = "Connecting...";

    try {

        const result = await signInWithPopup(auth, facebookProvider);
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
        showError(error.message);

    } finally {

        facebookBtn.disabled = false;
        facebookBtn.textContent = "Continue with Facebook";

    }

});
