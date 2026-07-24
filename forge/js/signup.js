// ======================================
// FORGE Signup
// ======================================

import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
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

            credits: 2,

            isActive: true,

            createdAt: serverTimestamp(),

            updatedAt: serverTimestamp()

        });


        // ======================================
        // Redirect
        // ======================================

        window.location.href = "dashboard.html";

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
