
const express = require("express");
const cors = require("cors");

const db = require("./config/db");

const employeeRoutes = require("./routes/employeeRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Employee APIs
app.use("/api/employees", employeeRoutes);

// Authentication APIs
app.use("/api/auth", authRoutes);

// Home route
app.get("/", (req, res) => {
    res.send("Employee Management System Backend is Running!");
});

// Test route
app.get("/api/test", (req, res) => {
    res.json({
        message: "Backend API is working successfully!",
        status: "Success"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
