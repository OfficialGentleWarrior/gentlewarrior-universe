const welcomeScreen =
    document.getElementById("welcomeScreen");

const step1 =
    document.getElementById("step1");

const continueSetup =
    document.getElementById("continueSetup");

const step1Continue =
    document.getElementById("step1Continue");

const optionButtons =
    document.querySelectorAll(".option-button");

const journeyData = {

    journeyFor: null

};


// Welcome → Step 1

continueSetup.addEventListener("click", () => {

    welcomeScreen.classList.add("hidden");

    step1.classList.remove("hidden");

});


// Step 1 Selection

optionButtons.forEach(button => {

    button.addEventListener("click", () => {

        optionButtons.forEach(option => {

            option.classList.remove("selected");

        });

        button.classList.add("selected");

        journeyData.journeyFor =
    button.dataset.value;

        step1Continue.disabled = false;

        console.log(journeyData);

    });

});


// Continue

step1Continue.addEventListener("click", () => {

    console.log("Step 2");

    console.log(journeyData);

});
