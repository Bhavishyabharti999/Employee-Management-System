
const express = require("express");

const router = express.Router();

const {
    addEmployee,
    getAllEmployees,
    updateEmployee,
    deleteEmployee
} = require("../controllers/employeeController");

const {
    verifyToken,
    checkRole
} = require("../middleware/authMiddleware");

// Admin and HR Manager can add employees
router.post(
    "/",
    verifyToken,
    checkRole("Admin", "HR Manager"),
    addEmployee
);

// All logged-in users can view employees for now
router.get(
    "/",
    verifyToken,
    getAllEmployees
);

// Admin and HR Manager can update employees
router.put(
    "/:id",
    verifyToken,
    checkRole("Admin", "HR Manager"),
    updateEmployee
);

// Only Admin and HR Manager can delete employees
router.delete(
    "/:id",
    verifyToken,
    checkRole("Admin", "HR Manager"),
    deleteEmployee
);

module.exports = router;
