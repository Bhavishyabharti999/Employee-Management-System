
const express = require("express");

const router = express.Router();

const {
    addEmployee,
    getAllEmployees,
    getMyProfile,
    updateMyProfile,
    updateEmployee,
    deleteEmployee
} = require("../controllers/employeeController");

const {
    verifyToken,
    checkRole
} = require("../middleware/authMiddleware");

// Employee can view their own profile
router.get(
    "/my-profile",
    verifyToken,
    checkRole("Employee"),
    getMyProfile
);

// Employee can update only their own contact number
router.put(
    "/my-profile",
    verifyToken,
    checkRole("Employee"),
    updateMyProfile
);

// Admin and HR Manager can add employees
router.post(
    "/",
    verifyToken,
    checkRole("Admin", "HR Manager"),
    addEmployee
);

// All logged-in users can view employees based on their role
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

// Admin and HR Manager can delete employees
router.delete(
    "/:id",
    verifyToken,
    checkRole("Admin", "HR Manager"),
    deleteEmployee
);

module.exports = router;
