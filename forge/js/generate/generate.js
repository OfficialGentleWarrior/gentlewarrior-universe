import { auth, db } from "../firebase.js";
import { validateGenerateRequest } from "./validate.js";
import { uploadImage } from "./uploadImage.js";
import { generateUniqueShortCode } from "./utils.js";
import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

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
        // Step 3 - Generate Short Code
        // ======================================

        alert("Generating Short Code");

const shortCode =
    await generateUniqueShortCode();

console.log("Short Code:", shortCode);

alert("Short Code Generated");

        // ======================================
// Step 4
// Create Firestore Document
// ======================================

alert("Saving Link");

await setDoc(
    doc(db, "links", shortCode),
    {

        shortCode: shortCode,

        uid: auth.currentUser.uid,

        destinationUrl: destinationUrl,

        previewImage: uploadResult.downloadURL,

        storagePath: uploadResult.storagePath,

        clicks: 0,

        isActive: true,

        createdAt: serverTimestamp()

    }
);

alert("Link Saved");

return;

        // Step 5
        // Deduct Spark

        // Step 6
        // Create creditHistory Record

        // Step 7
        // Return Generated Link

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}
