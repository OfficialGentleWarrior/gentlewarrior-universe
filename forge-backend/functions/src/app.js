const express = require("express");

const app = express();

// Parse JSON body
// app.use(express.json());

// Import Generate Route
const generateRoute = require("./generate");

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.json({
    success: true,
    service: "FORGE Backend",
    version: "1.0.0",
    status: "online",
  });
});

/*
|--------------------------------------------------------------------------
| Generate Link API
|--------------------------------------------------------------------------
*/
app.use((req, res, next) => {
  console.log(req.method, req.url, req.headers["content-type"]);
  next();
});

app.use("/api/generate", generateRoute);

module.exports = app;