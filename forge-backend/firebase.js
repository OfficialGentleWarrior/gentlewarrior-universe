const { initializeApp, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

if (!getApps().length) {
    initializeApp({
        storageBucket: "gentle-warrior.firebasestorage.app",
    });
}

module.exports = {
    db: getFirestore(),
    bucket: getStorage().bucket(),
};