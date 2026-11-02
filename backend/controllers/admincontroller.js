const bcrypt = require("bcryptjs");
const db = require("../config/db");

exports.listDepartments = async (req, res) => {
  const [rows] = await db.query(
    "SELECT d.*, (SELECT COUNT(*) FROM employees e WHERE e.department_id=d.id) AS staff FROM departments d ORDER BY d.name");
  res.json(rows);
};

exports.createDepartment = async (req, res) => {
  if (!req.body.name) return res.status(400).json({ message: "Department name is required." });
  const [r] = await db.query("INSERT INTO departments(name) VALUES(?)", [req.body.name]);
  res.status(201).json({ id: r.insertId, message: "Department added." });
};

exports.listUsers = async (req, res) => {
  const [rows] = await db.query("SELECT id, username, role, active FROM users ORDER BY role, username");
  res.json(rows);
};

// Admin creates Admin or HR Manager logins. Employee logins are created when HR adds an employee.
exports.createUser = async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !["Admin", "HR Manager"].includes(role))
    return res.status(400).json({ message: "Username, password and a role of Admin or HR Manager are required." });
  const [r] = await db.query("INSERT INTO users(username,password_hash,role) VALUES(?,?,?)",
    [username, await bcrypt.hash(password, 10), role]);
  res.status(201).json({ id: r.insertId, message: "User created." });
};

exports.toggleUser = async (req, res) => {
  if (Number(req.params.id) === req.user.id) return res.status(400).json({ message: "You cannot disable your own account." });
  await db.query("UPDATE users SET active=1-active WHERE id=?", [req.params.id]);
  res.json({ message: "User status changed." });
};
