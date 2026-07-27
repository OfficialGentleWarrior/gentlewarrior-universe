import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { db } from "../firebase.js";

// Generate unique short code
export async function generateUniqueShortCode(length = 6) {

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

    while (true) {

        let code = "";

        for (let i = 0; i < length; i++) {

            code += chars.charAt(
                Math.floor(Math.random() * chars.length)
            );

        }

        const docRef = doc(db, "links", code);

        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {

            return code;

        }

    }

}
