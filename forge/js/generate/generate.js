import { auth, db } from "../firebase.js";
import { validateGenerateRequest } from "./validate.js";
import { uploadImage } from "./uploadImage.js";

export async function generateLink() {

    alert("Generate Clicked");

    try {

        const imageFile =
            document.getElementById("previewImage").files[0];

        const destinationUrl =
            document.getElementById("destinationUrl").value.trim();

        alert("Before Validation");

        // ======================================
        // Step 1 - Validate
        // ======================================

        const validation = await validateGenerateRequest({
            auth,
            db,
            imageFile,
            destinationUrl
        });

        alert("After Validation");

        console.log("Validation Passed:", validation);

        // ======================================
        // Step 2 - Upload Image
        // ======================================

        alert("Before Upload");

        const uploadResult =
            await uploadImage(imageFile);

        alert("After Upload");

        console.log("Upload Success");

        console.log("Download URL:", uploadResult.downloadURL);

        console.log("Storage Path:", uploadResult.storagePath);

        // ======================================
        // Step 3
        // Generate Short Code
        // ======================================

        // Step 4
        // Create Firestore Document

        // Step 5
        // Deduct Spark

        // Step 6
        // Return Link

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}
