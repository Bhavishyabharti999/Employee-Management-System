
const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    createUser
} = require("../controllers/authController");

const {
    verifyToken,
    checkRole
} = require("../middleware/authMiddleware");

// Public employee registration
router.post("/register", registerUser);

// Public login
router.post("/login", loginUser);

// Admin and HR Manager can create users
router.post(
    "/create-user",
    verifyToken,
    checkRole("Admin", "HR Manager"),
    createUser
);

module.exports = router;
