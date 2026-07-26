import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export async function validateGenerateRequest({
    auth,
    db,
    imageFile,
    destinationUrl
}) {
    // Check if user is logged in
    const user = auth.currentUser;

    if (!user) {
        throw new Error("Please sign in first.");
    }

    // Check if image is selected
    if (!imageFile) {
        throw new Error("Please upload an image.");
    }

    // Check destination URL
    if (!destinationUrl.trim()) {
        throw new Error("Destination URL is required.");
    }

    try {
        new URL(destinationUrl);
    } catch {
        throw new Error("Invalid destination URL.");
    }

    // Get user data
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        throw new Error("User account not found.");
    }

    const userData = userSnap.data();

    // Check Sparks
    if ((userData.credits ?? 0) < 1) {
        throw new Error("You don't have enough Sparks.");
    }

    // Return validated data
    return {
        uid: user.uid,
        credits: userData.credits
    };
}
