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
        // Send Request to FORGE Backend
        // ======================================

        const formData = new FormData();

        formData.append("image", imageFile);
        formData.append("destinationUrl", destinationUrl);

        const response = await fetch(
            "https://forge.gentlewarrior.world/generate",
            {
                method: "POST",
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

        console.error(error);

        alert(error.message);

    }

}
