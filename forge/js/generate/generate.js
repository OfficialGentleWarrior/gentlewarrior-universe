import { auth, db } from "../firebase.js";
import { validateGenerateRequest } from "./validate.js";
import { uploadImage } from "./uploadImage.js";

export async function generateLink() {

    try {

        const imageFile =
            document.getElementById("previewImage").files[0];

        const destinationUrl =
            document.getElementById("destinationUrl").value.trim();

        // ======================================
        // Step 1 - Validate
        // ======================================

        const validation = await validateGenerateRequest({
            auth,
            db,
            imageFile,
            destinationUrl
        });

        console.log("Validation Passed:", validation);

        // ======================================
        // Step 2 - Upload Image
        // ======================================

        console.log("Uploading image...");

        const uploadResult =
            await uploadImage(imageFile);

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
