
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


// Get all employees
const getAllEmployees = (req, res) => {
    const sql = "SELECT * FROM employees";

    db.query(sql, (err, results) => {
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


// Update employee
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
    updateEmployee,
    deleteEmployee
};
