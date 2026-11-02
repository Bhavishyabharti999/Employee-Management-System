
const db = require("../config/db");

// Add a new employee
const addEmployee = (req, res) => {
    const {
        employee_name,
        email,
        department,
        designation,
        contact,
        salary
    } = req.body;

    const sql = `
        INSERT INTO employees
        (employee_name, email, department, designation, contact, salary)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
        employee_name,
        email,
        department,
        designation,
        contact,
        salary
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to add employee"
            });
        }

        res.status(201).json({
            message: "Employee added successfully!",
            employeeId: result.insertId
        });
    });
};


// Get employees based on user role
const getAllEmployees = (req, res) => {
    let sql;
    let values = [];

    if (
        req.user.role === "Admin" ||
        req.user.role === "HR Manager"
    ) {
        sql = "SELECT * FROM employees";
    } else if (req.user.role === "Employee") {
        sql = "SELECT * FROM employees WHERE user_id = ?";
        values = [req.user.id];
    } else {
        return res.status(403).json({
            message: "Access denied"
        });
    }

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch employees"
            });
        }

        res.status(200).json({
            message: "Employees fetched successfully!",
            employees: results
        });
    });
};


// Get logged-in employee's own profile
const getMyProfile = (req, res) => {
    const sql = `
        SELECT id, employee_name, email, department,
               designation, contact, salary, created_at, user_id
        FROM employees
        WHERE user_id = ?
    `;

    db.query(sql, [req.user.id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch profile"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Employee profile not found"
            });
        }

        res.status(200).json({
            message: "Profile fetched successfully!",
            profile: results[0]
        });
    });
};


// Update logged-in employee's contact number only
const updateMyProfile = (req, res) => {
    const { contact } = req.body;

    if (!contact || !String(contact).trim()) {
        return res.status(400).json({
            message: "Contact number is required"
        });
    }

    const sql = `
        UPDATE employees
        SET contact = ?
        WHERE user_id = ?
    `;

    db.query(sql, [contact, req.user.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to update profile"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Employee profile not found"
            });
        }

        res.status(200).json({
            message: "Contact number updated successfully!"
        });
    });
};


// Update employee (Admin and HR Manager)
const updateEmployee = (req, res) => {
    const { id } = req.params;

    const {
        employee_name,
        email,
        department,
        designation,
        contact,
        salary
    } = req.body;

    const sql = `
        UPDATE employees
        SET employee_name = ?,
            email = ?,
            department = ?,
            designation = ?,
            contact = ?,
            salary = ?
        WHERE id = ?
    `;

    const values = [
        employee_name,
        email,
        department,
        designation,
        contact,
        salary,
        id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to update employee"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.status(200).json({
            message: "Employee updated successfully!"
        });
    });
};


// Delete employee
const deleteEmployee = (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM employees WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to delete employee"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.status(200).json({
            message: "Employee deleted successfully!"
        });
    });
};


// Export functions
module.exports = {
    addEmployee,
    getAllEmployees,
    getMyProfile,
    updateMyProfile,
    updateEmployee,
    deleteEmployee
};
