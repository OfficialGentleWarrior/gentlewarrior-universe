import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

import {
    app,
    auth
} from "../firebase.js";

// ======================================
// Firebase Storage
// ======================================

const storage = getStorage(app);

// ======================================
// Upload Preview Image
// ======================================

export async function uploadImage(imageFile) {

    const user = auth.currentUser;

    if (!user) {
        throw new Error("Please login first.");
    }

    if (!imageFile) {
        throw new Error("No image selected.");
    }

    const extension =
        imageFile.name.split(".").pop().toLowerCase();

    const fileName =
        `${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const storageRef = ref(
        storage,
        `previews/${user.uid}/${fileName}`
    );

    await uploadBytes(storageRef, imageFile);

    const downloadURL =
        await getDownloadURL(storageRef);

    return {
        downloadURL,
        storagePath: storageRef.fullPath
    };

}
