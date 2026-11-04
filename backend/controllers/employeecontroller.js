const bcrypt = require("bcryptjs");
const db = require("../config/db");

const SELECT = "SELECT e.*, d.name AS department FROM employees e LEFT JOIN departments d ON d.id=e.department_id";

exports.list = async (req, res) => {
  const [rows] = await db.query(SELECT + " ORDER BY e.id");
  res.json(rows);
};

exports.get = async (req, res) => {
  const [rows] = await db.query(SELECT + " WHERE e.id=?", [req.params.id]);
  rows[0] ? res.json(rows[0]) : res.status(404).json({ message: "Employee not found." });
};

exports.create = async (req, res) => {
  const { name, email, phone, department_id, designation, basic_salary, join_date, status } = req.body;
  if (!name || !email || !join_date)
    return res.status(400).json({ message: "Name, email and joining date are required." });
  const [r] = await db.query(
    "INSERT INTO employees(name,email,phone,department_id,designation,basic_salary,join_date,status) VALUES(?,?,?,?,?,?,?,?)",
    [name, email, phone || null, department_id || null, designation || null, basic_salary || 0, join_date, status || "Active"]);
  // login for the new employee: username = email, temporary password
  await db.query("INSERT INTO users(username,password_hash,role,employee_id) VALUES(?,?,'Employee',?)",
    [email, await bcrypt.hash("welcome123", 10), r.insertId]);
  res.status(201).json({ id: r.insertId, message: "Employee added. Login is the email with password welcome123." });
};

exports.update = async (req, res) => {
  const { name, email, phone, department_id, designation, basic_salary, join_date, status } = req.body;
  const [r] = await db.query(
    "UPDATE employees SET name=?,email=?,phone=?,department_id=?,designation=?,basic_salary=?,join_date=?,status=? WHERE id=?",
    [name, email, phone || null, department_id || null, designation || null, basic_salary || 0, join_date, status || "Active", req.params.id]);
  r.affectedRows ? res.json({ message: "Employee updated." }) : res.status(404).json({ message: "Employee not found." });
};

exports.remove = async (req, res) => {
  const [r] = await db.query("DELETE FROM employees WHERE id=?", [req.params.id]);
  r.affectedRows ? res.json({ message: "Employee deleted." }) : res.status(404).json({ message: "Employee not found." });
};

// Employee's own profile
exports.me = async (req, res) => {
  const [rows] = await db.query(SELECT + " WHERE e.id=?", [req.user.employeeId]);
  res.json(rows[0]);
};

exports.updateMe = async (req, res) => {
  const { phone, address } = req.body;
  await db.query("UPDATE employees SET phone=?, address=? WHERE id=?", [phone || null, address || null, req.user.employeeId]);
  res.json({ message: "Profile updated." });
};
