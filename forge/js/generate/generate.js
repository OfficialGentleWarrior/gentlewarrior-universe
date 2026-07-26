import { auth, db } from "../firebase.js";
import { validateGenerateRequest } from "./validate.js";

export async function generateLink() {

    alert("Step 1");

    try {

        const imageFile = document.getElementById("previewImage").files[0];
        const destinationUrl = document.getElementById("destinationUrl").value.trim();

        alert("Step 2");

        const validation = await validateGenerateRequest({
            auth,
            db,
            imageFile,
            destinationUrl
        });

        alert("Step 3");

        console.log("Validation Passed:", validation);

        // Step 2
        // Upload Image

        // Step 3
        // Generate Short Code

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
