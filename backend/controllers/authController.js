
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Register a new Employee
const registerUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        // Public registration only allows Employees
        if (role && role !== "Employee") {
            return res.status(403).json({
                message: "Only Employee registration is allowed"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Start database transaction
        db.beginTransaction((err) => {
            if (err) {
                return res.status(500).json({
                    message: "Transaction failed"
                });
            }

            // Create user account
            const userSql = `
                INSERT INTO users (username, email, password, role)
                VALUES (?, ?, ?, 'Employee')
            `;

            db.query(
                userSql,
                [username, email, hashedPassword],
                (err, userResult) => {

                    if (err) {
                        return db.rollback(() => {
                            if (err.code === "ER_DUP_ENTRY") {
                                return res.status(409).json({
                                    message: "Email already registered"
                                });
                            }

                            return res.status(500).json({
                                message: "Registration failed"
                            });
                        });
                    }

                    const userId = userResult.insertId;

                    // Create linked employee profile
                    const employeeSql = `
                        INSERT INTO employees
                        (employee_name, email, user_id)
                        VALUES (?, ?, ?)
                    `;

                    db.query(
                        employeeSql,
                        [username, email, userId],
                        (err) => {

                            if (err) {
                                return db.rollback(() => {
                                    console.error(err);

                                    res.status(500).json({
                                        message: "Employee profile creation failed"
                                    });
                                });
                            }

                            // Save both records
                            db.commit((err) => {
                                if (err) {
                                    return db.rollback(() => {
                                        res.status(500).json({
                                            message: "Registration could not be completed"
                                        });
                                    });
                                }

                                res.status(201).json({
                                    message: "Employee registered successfully!",
                                    userId: userId
                                });
                            });
                        }
                    );
                }
            );
        });

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

// Admin and HR Manager can create user accounts
const createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check required fields
        if (!username || !email || !password || !role) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        // Validate role
        if (!["Employee", "HR Manager"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        // Only Admin can create HR Manager
        if (role === "HR Manager" && req.user.role !== "Admin") {
            return res.status(403).json({
                message: "Only Admin can create HR Manager accounts"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.beginTransaction((err) => {
            if (err) {
                return res.status(500).json({
                    message: "Transaction failed"
                });
            }

            const userSql = `
                INSERT INTO users (username, email, password, role)
                VALUES (?, ?, ?, ?)
            `;

            db.query(
                userSql,
                [username, email, hashedPassword, role],
                (err, result) => {
                    if (err) {
                        return db.rollback(() => {
                            if (err.code === "ER_DUP_ENTRY") {
                                return res.status(409).json({
                                    message: "Email already registered"
                                });
                            }

                            res.status(500).json({
                                message: "User creation failed"
                            });
                        });
                    }

                    const userId = result.insertId;

                    const employeeSql = `
                        INSERT INTO employees
                        (employee_name, email, user_id)
                        VALUES (?, ?, ?)
                    `;

                    db.query(
                        employeeSql,
                        [username, email, userId],
                        (err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error(err);

                                    res.status(500).json({
                                        message: "Employee profile creation failed"
                                    });
                                });
                            }

                            db.commit((err) => {
                                if (err) {
                                    return db.rollback(() => {
                                        res.status(500).json({
                                            message: "User creation failed"
                                        });
                                    });
                                }

                                res.status(201).json({
                                    message: "User created successfully!",
                                    userId: userId,
                                    role: role
                                });
                            });
                        }
                    );
                }
            );
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    createUser
};
