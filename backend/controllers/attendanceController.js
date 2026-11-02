const db = require("../config/db");

exports.checkIn = async (req, res) => {
  const [r] = await db.query(
    "INSERT IGNORE INTO attendance(employee_id,work_date,check_in) VALUES(?,CURDATE(),CURTIME())", [req.user.employeeId]);
  r.affectedRows ? res.status(201).json({ message: "Checked in." }) : res.status(400).json({ message: "You already checked in today." });
};

exports.checkOut = async (req, res) => {
  const [r] = await db.query(
    "UPDATE attendance SET check_out=CURTIME() WHERE employee_id=? AND work_date=CURDATE() AND check_out IS NULL",
    [req.user.employeeId]);
  r.affectedRows ? res.json({ message: "Checked out." }) : res.status(400).json({ message: "Check in first, or you already checked out." });
};

exports.mine = async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM attendance WHERE employee_id=? ORDER BY work_date DESC LIMIT 31", [req.user.employeeId]);
  res.json(rows);
};

// HR: everyone's attendance for a date (default today), ?date=2026-11-02
exports.byDate = async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const [rows] = await db.query(
    "SELECT a.*, e.name FROM attendance a JOIN employees e ON e.id=a.employee_id WHERE a.work_date=?", [date]);
  res.json(rows);
};
