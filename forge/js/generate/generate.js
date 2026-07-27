import { auth, db } from "../firebase.js";
import { validateGenerateRequest } from "./validate.js";
import { uploadImage } from "./uploadImage.js";
import { generateUniqueShortCode } from "./utils.js";
import {
    doc,
    collection,
    setDoc,
    runTransaction,
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

        /// ======================================
// Step 4
// Transaction
// Create Link + Deduct Spark
// ======================================

alert("Starting Transaction");

await runTransaction(db, async (transaction) => {

    const userRef = doc(db, "users", auth.currentUser.uid);

    const linkRef = doc(db, "links", shortCode);

    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists()) {
        throw new Error("User not found.");
    }

    const userData = userSnap.data();

    if (userData.credits < 1) {
        throw new Error("Not enough Sparks.");
    }

    // Create Link
    transaction.set(linkRef, {

        shortCode: shortCode,

        uid: auth.currentUser.uid,

        destinationUrl: destinationUrl,

        previewImage: uploadResult.downloadURL,

        storagePath: uploadResult.storagePath,

        clicks: 0,

        isActive: true,

        createdAt: serverTimestamp()

    });

    // Deduct 1 Spark
    transaction.update(userRef, {

        credits: userData.credits - 1

    });

});

alert("Transaction Complete");

// ======================================
// Step 5 - Create Credit History
// ======================================

alert("Saving Credit History");

const historyRef =
    doc(collection(db, "creditHistory"));

await setDoc(historyRef, {

    uid: auth.currentUser.uid,

    type: "debit",

    amount: -1,

    reason: "Generate Link",

    shortCode: shortCode,

    createdAt: serverTimestamp()

});

alert("Credit History Saved");

// ======================================
// Step 6 - Return Generated Link
// ======================================

const generatedLink =
    `https://gentlewarrior.world/l/${shortCode}`;

console.log("Generated Link:", generatedLink);

alert(`Link Generated!\n\n${generatedLink}`);

return generatedLink;

        // Step 7
        // Return Generated Link

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}
