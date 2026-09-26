const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CarbonX AI Backend is running 🚀",
    status: "OK"
  });
});


// ==========================================
// DATABASE TEST
// ==========================================

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "CarbonX AI database connected successfully 🗄️",
      time: result.rows[0].now
    });

  } catch (error) {

    console.error("Database test failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message
    });
  }
});


// ==========================================
// GET ALL PROJECTS
// ==========================================

app.get("/api/projects", async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT
        id,
        project_name,
        owner,
        claimed_area,
        claimed_carbon_benefit,
        restoration_date,
        latitude,
        longitude,
        status,
        created_at
      FROM projects
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      projects: result.rows
    });

  } catch (error) {

    console.error("Error fetching projects:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: error.message
    });
  }
});


// ==========================================
// CREATE NEW PROJECT
// ==========================================

app.post("/api/projects", async (req, res) => {

  try {

    const {
      projectName,
      owner,
      claimedArea,
      carbonBenefit,
      restorationDate,
      latitude,
      longitude,
      geojson
    } = req.body;


    // Basic validation
    if (
      !projectName ||
      !owner ||
      !claimedArea ||
      !carbonBenefit ||
      !restorationDate ||
      latitude === undefined ||
      longitude === undefined
    ) {

      return res.status(400).json({
        success: false,
        message: "Please provide all required project details"
      });
    }


    // Insert project
    const result = await pool.query(
      `
      INSERT INTO projects (
        project_name,
        owner,
        claimed_area,
        claimed_carbon_benefit,
        restoration_date,
        latitude,
        longitude,
        geojson,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Pending')
      RETURNING
        id,
        project_name,
        owner,
        claimed_area,
        claimed_carbon_benefit,
        restoration_date,
        latitude,
        longitude,
        geojson,
        status,
        created_at
      `,
      [
        projectName,
        owner,
        claimedArea,
        carbonBenefit,
        restorationDate,
        latitude,
        longitude,
        geojson ? JSON.stringify(geojson) : null
      ]
    );


    res.status(201).json({
      success: true,
      message: "Project created successfully 🌱",
      project: result.rows[0]
    });

  } catch (error) {

    console.error("Error creating project:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create project",
      error: error.message
    });
  }
});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

  console.log(
    `CarbonX AI Backend running on http://localhost:${PORT}`
  );

});