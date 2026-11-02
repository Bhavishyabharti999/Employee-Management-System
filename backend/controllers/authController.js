
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();


// Register a new user
const registerUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        // Validate role
        // Public registration is allowed only for Employees
        if (role && role !== "Employee") {
            return res.status(403).json({
                message: "Only Admin can create privileged accounts"
            });
        }

        // Check whether email already exists
        db.query(
            "SELECT * FROM users WHERE email = ?",
            [email],
            async (err, results) => {
                if (err) {
                    return res.status(500).json({
                        message: "Database error"
                    });
                }

                if (results.length > 0) {
                    return res.status(409).json({
                        message: "Email already registered"
                    });
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);

                const sql = `
                    INSERT INTO users (username, email, password, role)
                    VALUES (?, ?, ?, ?)
                `;

                const values = [
                    username,
                    email,
                    hashedPassword,
                    "Employee"
                ];

                db.query(sql, values, (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            message: "Registration failed"
                        });
                    }

                    res.status(201).json({
                        message: "User registered successfully!",
                        userId: result.insertId
                    });
                });
            }
        );

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error during registration"
        });
    }
};


// Login user
const loginUser = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (results.length === 0) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            const user = results[0];

            const isMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!isMatch) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            res.status(200).json({
                message: "Login successful!",
                token: token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        }
    );
};


module.exports = {
    registerUser,
    loginUser
};
