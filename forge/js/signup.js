const form = document.getElementById("signupForm");

const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

const errorMessage = document.getElementById("errorMessage");

const passwordToggle = document.getElementById("passwordToggle");
const confirmPasswordToggle = document.getElementById("confirmPasswordToggle");

function showError(message){

    errorMessage.textContent = message;

    errorMessage.style.display = "block";

}

function hideError(){

    errorMessage.textContent = "";

    errorMessage.style.display = "none";

}

form.addEventListener("submit", function(e){

    hideError();

    if(password.value.length < 8){

        e.preventDefault();

        showError("Password must be at least 8 characters.");

        password.focus();

        return;

    }

    if(password.value !== confirmPassword.value){

        e.preventDefault();

        showError("Passwords do not match.");

        confirmPassword.focus();

        return;

    }

});

password.addEventListener("input", hideError);

confirmPassword.addEventListener("input", hideError);


// =====================================
// Show / Hide Password
// =====================================

if(passwordToggle){

    passwordToggle.addEventListener("click", function(){

        if(password.type === "password"){

            password.type = "text";

            passwordToggle.classList.remove("fa-eye");

            passwordToggle.classList.add("fa-eye-slash");

        }else{

            password.type = "password";

            passwordToggle.classList.remove("fa-eye-slash");

            passwordToggle.classList.add("fa-eye");

        }

    });

}

if(confirmPasswordToggle){

    confirmPasswordToggle.addEventListener("click", function(){

        if(confirmPassword.type === "password"){

            confirmPassword.type = "text";

            confirmPasswordToggle.classList.remove("fa-eye");

            confirmPasswordToggle.classList.add("fa-eye-slash");

        }else{

            confirmPassword.type = "password";

            confirmPasswordToggle.classList.remove("fa-eye-slash");

            confirmPasswordToggle.classList.add("fa-eye");

        }

    });

}
