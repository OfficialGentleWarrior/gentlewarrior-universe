import { auth, db } from "../firebase.js";
import { validateGenerateRequest } from "./validate.js";

export async function generateLink() {

    try {

        // ======================================
        // Get Form Values
        // ======================================

        const imageFile =
            document.getElementById("previewImage").files[0];

        const destinationUrl =
            document.getElementById("destinationUrl").value.trim();

        // ======================================
        // Validate
        // ======================================

        await validateGenerateRequest({
            auth,
            db,
            imageFile,
            destinationUrl
        });

        // ======================================
        // Show Loading
        // ======================================

        document.getElementById("loadingModal").style.display = "flex";

        // ======================================
        // Send Request to FORGE Backend
        // ======================================

        const formData = new FormData();

        formData.append("image", imageFile);
formData.append("destinationUrl", destinationUrl);

const token = await auth.currentUser.getIdToken();

const response = await fetch(
    "https://forge.gentlewarrior.world/generate",
    {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    }
);

        const result = await response.json();

        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                result.error ||
                "Failed to generate link."
            );

        }

        // ======================================
        // Hide Loading
        // ======================================

        document.getElementById("loadingModal").style.display = "none";

        // ======================================
        // Success
        // ======================================

        console.log("FORGE Response:", result);

        const generatedLink = result.shortUrl;

        // Notify UI
        window.dispatchEvent(
            new CustomEvent("forge:link-generated", {
                detail: {
                    link: generatedLink,
                    remainingSparks: result.remainingSparks
                }
            })
        );

        return generatedLink;

    }

    catch (error) {

        // ======================================
        // Hide Loading
        // ======================================

        document.getElementById("loadingModal").style.display = "none";

        console.error(error);

        alert(error.message);

    }

}
