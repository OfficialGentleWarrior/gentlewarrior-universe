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
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");

const previewTitle = document.getElementById("previewTitle");
const previewDescription = document.getElementById("previewDescription");
const previewDomain = document.getElementById("previewDomain");

const titleCount = document.getElementById("titleCount");
const descriptionCount = document.getElementById("descriptionCount");

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

    }

    reader.readAsDataURL(file);

    validateForm();

});


// ======================================
// Live Title
// ======================================

titleInput.addEventListener("input", () => {

    previewTitle.textContent =
        titleInput.value || "Your Title";

    titleCount.textContent =
        titleInput.value.length;

    validateForm();

});


// ======================================
// Live Description
// ======================================

descriptionInput.addEventListener("input", () => {

    previewDescription.textContent =
        descriptionInput.value || "Your description will appear here.";

    descriptionCount.textContent =
        descriptionInput.value.length;

});


// ======================================
// URL Preview
// ======================================

urlInput.addEventListener("input", () => {

    let value = urlInput.value.trim();

    if(value){

        try{

            const domain = new URL(value);

            previewDomain.textContent = domain.hostname;

        }

        catch{

            previewDomain.textContent =
                "forge.link/example";

        }

    }

    else{

        previewDomain.textContent =
            "forge.link/example";

    }

    validateForm();

});


// ======================================
// URL Validation
// ======================================

function isValidURL(url){

    try{

        new URL(url);

        return true;

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

    const hasTitle =
        titleInput.value.trim() !== "";

    const hasURL =
        isValidURL(urlInput.value);

    generateBtn.disabled =
        !(hasImage && hasTitle && hasURL);

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
