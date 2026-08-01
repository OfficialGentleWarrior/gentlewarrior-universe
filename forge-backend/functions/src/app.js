const express = require("express");

const app = express();

// Parse JSON requests
app.use(express.json());

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    service: "FORGE Backend",
    version: "1.0.0",
    status: "online",
  });
});

module.exports = app;