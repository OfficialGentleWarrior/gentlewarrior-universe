const { setGlobalOptions } = require("firebase-functions/v2");
const { onRequest } = require("firebase-functions/v2/https");

const app = require("./src/app");

// Global configuration
setGlobalOptions({
  maxInstances: 10,
  region: "asia-southeast1",
});

// Main FORGE API
exports.api = onRequest(app);