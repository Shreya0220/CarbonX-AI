const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CarbonX AI Backend is running 🚀",
    status: "OK"
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`CarbonX AI Backend running on http://localhost:${PORT}`);
});