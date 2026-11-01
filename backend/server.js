
const express = require("express");
const db = require("./config/db");
const employeeRoutes = require("./routes/employeeRoutes");

const app = express();

const PORT = 3000;

// Middleware
app.use(express.json());

app.use("/api/employees", employeeRoutes);

// Home route
app.get("/", (req, res) => {
    res.send("Employee Management System Backend is Running!");
});

// Test API
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
