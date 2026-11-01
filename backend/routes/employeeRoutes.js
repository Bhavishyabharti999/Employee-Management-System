
const express = require("express");

const router = express.Router();

const {
    addEmployee,
    getAllEmployees,
    updateEmployee,
    deleteEmployee
} = require("../controllers/employeeController");

// Add employee
router.post("/", addEmployee);

// Get all employees
router.get("/", getAllEmployees);

// Update employee
router.put("/:id", updateEmployee);

// Delete employee
router.delete("/:id", deleteEmployee);

module.exports = router;
