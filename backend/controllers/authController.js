const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await db.query("SELECT * FROM users WHERE username=? AND active=1", [username]);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(password || "", u.password_hash)))
    return res.status(401).json({ message: "Wrong username or password." });
  const token = jwt.sign(
    { id: u.id, role: u.role, employeeId: u.employee_id, username: u.username },
    process.env.JWT_SECRET, { expiresIn: "8h" });
  res.json({ token, user: { id: u.id, username: u.username, role: u.role, employeeId: u.employee_id } });
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const [rows] = await db.query("SELECT password_hash FROM users WHERE id=?", [req.user.id]);
  if (!newPassword || newPassword.length < 6 || !(await bcrypt.compare(oldPassword || "", rows[0].password_hash)))
    return res.status(400).json({ message: "Old password is wrong or the new one is shorter than 6 characters." });
  await db.query("UPDATE users SET password_hash=? WHERE id=?", [await bcrypt.hash(newPassword, 10), req.user.id]);
  res.json({ message: "Password changed." });
};
