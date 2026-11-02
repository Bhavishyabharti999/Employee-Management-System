const db = require("../config/db");

exports.apply = async (req, res) => {
  const { leave_type, from_date, to_date, reason } = req.body;
  if (!leave_type || !from_date || !to_date) return res.status(400).json({ message: "Leave type and both dates are required." });
  if (to_date < from_date) return res.status(400).json({ message: "End date must be on or after the start date." });
  await db.query("INSERT INTO leaves(employee_id,leave_type,from_date,to_date,reason) VALUES(?,?,?,?,?)",
    [req.user.employeeId, leave_type, from_date, to_date, reason || null]);
  res.status(201).json({ message: "Leave request sent to HR." });
};

exports.mine = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM leaves WHERE employee_id=? ORDER BY id DESC", [req.user.employeeId]);
  res.json(rows);
};

exports.all = async (req, res) => {
  const [rows] = await db.query(
    "SELECT l.*, e.name FROM leaves l JOIN employees e ON e.id=l.employee_id ORDER BY l.status='Pending' DESC, l.id DESC");
  res.json(rows);
};

exports.decide = async (req, res) => {
  const { status } = req.body; // "Approved" or "Rejected"
  if (!["Approved", "Rejected"].includes(status)) return res.status(400).json({ message: "Status must be Approved or Rejected." });
  const [r] = await db.query("UPDATE leaves SET status=?, decided_by=? WHERE id=? AND status='Pending'",
    [status, req.user.id, req.params.id]);
  r.affectedRows ? res.json({ message: `Leave ${status.toLowerCase()}.` }) : res.status(400).json({ message: "Request not found or already decided." });
};
