// ======================================
// FORGE Generate Link
// Version 1
// ======================================

// Elements

const uploadBox = document.getElementById("uploadBox");
const imageInput = document.getElementById("previewImage");
const imagePreview = document.getElementById("imagePreview");

const previewCardImage = document.getElementById("previewCardImage");
const previewPlaceholder = document.getElementById("previewPlaceholder");

const urlInput = document.getElementById("destinationUrl");
const previewDomain = document.getElementById("previewDomain");

const generateBtn = document.getElementById("generateBtn");


// ======================================
// Upload Image
// ======================================

uploadBox.addEventListener("click", () => {
    imageInput.click();
});

imageInput.addEventListener("change", (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(event){

        imagePreview.src = event.target.result;
        imagePreview.style.display = "block";

        previewCardImage.src = event.target.result;
        previewCardImage.style.display = "block";

        previewPlaceholder.style.display = "none";

    };

    reader.readAsDataURL(file);

    validateForm();

});


// ======================================
// URL Preview
// ======================================

urlInput.addEventListener("input", () => {

    const value = urlInput.value.trim();

    if(value){

        try{

            const domain = new URL(value);

            previewDomain.textContent = domain.hostname;

        }

        catch{

            previewDomain.textContent =
                "gentlewarrior.world";

        }

    }

    else{

        previewDomain.textContent =
            "gentlewarrior.world";

    }

    validateForm();

});


// ======================================
// URL Validation
// ======================================

function isValidURL(url){

    try{

        const parsed = new URL(url);

        return parsed.protocol === "http:" ||
               parsed.protocol === "https:";

    }

    catch{

        return false;

    }

}


// ======================================
// Enable Generate Button
// ======================================

function validateForm(){

    const hasImage =
        imageInput.files.length > 0;

    const hasURL =
        isValidURL(urlInput.value.trim());

    if(hasURL){
        urlInput.classList.remove("input-error");
    }else if(urlInput.value.trim() !== ""){
        urlInput.classList.add("input-error");
    }else{
        urlInput.classList.remove("input-error");
    }

    generateBtn.disabled =
        !(hasImage && hasURL);

}


// ======================================
// Generate Button (Temporary)
// ======================================

generateBtn.addEventListener("click", () => {

    generateBtn.disabled = true;

    generateBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';

    setTimeout(() => {

        generateBtn.innerHTML =
            '<i class="fa-solid fa-check"></i> Ready for Firebase';

    },1500);

});
