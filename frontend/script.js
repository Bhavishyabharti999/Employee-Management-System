
const API_URL = "http://localhost:3000/api/employees";

// Check login status
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");

if (!token || !user) {
    window.location.href = "login.html";
}

// Get HTML elements
const employeeForm = document.getElementById("employeeForm");
const employeeTable = document.getElementById("employeeTable");
const searchInput = document.getElementById("searchInput");
const submitBtn = document.getElementById("submitBtn");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeUser = document.getElementById("welcomeUser");

let employees = [];
let editingId = null;

// Display logged-in user's name
welcomeUser.textContent = `Welcome, ${user.username}!`;

// Logout functionality
logoutBtn.addEventListener("click", function() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
});

// Add JWT token to API requests
async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            "Authorization": `Bearer ${token}`
        }
    });

    if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
        throw new Error("Session expired. Please login again.");
    }

    return response;
}

// Fetch all employees
async function fetchEmployees() {
    try {
        const response = await apiRequest(API_URL);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch employees");
        }

        employees = data.employees;
        displayEmployees(employees);

    } catch (error) {
        console.error("Error fetching employees:", error);
        alert(error.message);
    }
}

// Display employees in table
function displayEmployees(employeeList) {
    employeeTable.innerHTML = "";

    employeeList.forEach(employee => {
        const row = document.createElement("tr");

        const values = [
            employee.id,
            employee.employee_name,
            employee.email,
            employee.department || "-",
            employee.designation || "-",
            employee.contact || "-",
            employee.salary || "-"
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");

        if (user.role === "Employee") {
            actionCell.textContent = "View Only";
        } else {
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.className = "edit-btn";
            editButton.onclick = () => editEmployee(employee);

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-btn";
            deleteButton.onclick = () => deleteEmployee(employee.id);

            actionCell.appendChild(editButton);
            actionCell.appendChild(deleteButton);
        }

        row.appendChild(actionCell);
        employeeTable.appendChild(row);
    });
}

// Add or update employee
employeeForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (user.role === "Employee") {
        alert("You don't have permission to manage employees.");
        return;
    }

    const employee = {
        employee_name: document.getElementById("employee_name").value,
        email: document.getElementById("email").value,
        department: document.getElementById("department").value,
        designation: document.getElementById("designation").value,
        contact: document.getElementById("contact").value,
        salary: document.getElementById("salary").value
    };

    try {
        let response;

        if (editingId === null) {
            response = await apiRequest(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(employee)
            });
        } else {
            response = await apiRequest(`${API_URL}/${editingId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(employee)
            });
        }

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Operation failed!");
            return;
        }

        alert(result.message);

        employeeForm.reset();
        editingId = null;
        submitBtn.textContent = "Add Employee";

        fetchEmployees();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});

// Edit employee
function editEmployee(employee) {
    if (user.role === "Employee") {
        alert("You don't have permission to edit employees.");
        return;
    }

    editingId = employee.id;

    document.getElementById("employee_name").value = employee.employee_name;
    document.getElementById("email").value = employee.email;
    document.getElementById("department").value = employee.department || "";
    document.getElementById("designation").value = employee.designation || "";
    document.getElementById("contact").value = employee.contact || "";
    document.getElementById("salary").value = employee.salary || "";

    submitBtn.textContent = "Update Employee";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Delete employee
async function deleteEmployee(id) {
    if (user.role === "Employee") {
        alert("You don't have permission to delete employees.");
        return;
    }

    const confirmDelete = confirm(
        "Are you sure you want to delete this employee?"
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await apiRequest(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Delete failed!");
            return;
        }

        if (String(editingId) === String(id)) {
            employeeForm.reset();
            editingId = null;
            submitBtn.textContent = "Add Employee";
        }

        alert(result.message);
        fetchEmployees();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

// Search employees
searchInput.addEventListener("input", function() {
    const searchText = searchInput.value.toLowerCase();

    const filteredEmployees = employees.filter(employee => {
        return (
            employee.employee_name.toLowerCase().includes(searchText) ||
            employee.email.toLowerCase().includes(searchText) ||
            (employee.department || "").toLowerCase().includes(searchText)
        );
    });

    displayEmployees(filteredEmployees);
});

// Load employees when page opens
fetchEmployees();
