import { getStorage } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";
import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

import { auth } from "../firebase.js";

const storage = getStorage();

export async function uploadImage(imageFile) {

    const user = auth.currentUser;

    if (!user) {
        throw new Error("Please login first.");
    }

    if (!imageFile) {
        throw new Error("No image selected.");
    }

    const extension = imageFile.name.split(".").pop();

    const fileName =
        `${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const storageRef = ref(
        storage,
        `previews/${user.uid}/${fileName}`
    );

    await uploadBytes(storageRef, imageFile);

    const downloadURL = await getDownloadURL(storageRef);

    return {
        downloadURL,
        storagePath: storageRef.fullPath
    };

}
