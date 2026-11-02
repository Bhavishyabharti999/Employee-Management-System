const db = require("../config/db");
const WORKING_DAYS = 26; // working days assumed per month

// Net pay = basic + 20% allowance - 12% PF - basic/30 for each absent day
exports.generate = async (req, res) => {
  const month = req.body.month; // "2026-11"
  if (!/^\d{4}-\d{2}$/.test(month || "")) return res.status(400).json({ message: "Month must look like 2026-11." });
  const start = month + "-01";
  const [emps] = await db.query("SELECT id, basic_salary FROM employees WHERE status='Active'");
  for (const e of emps) {
    const [[a]] = await db.query(
      "SELECT COUNT(*) n FROM attendance WHERE employee_id=? AND work_date>=? AND work_date<DATE_ADD(?, INTERVAL 1 MONTH)",
      [e.id, start, start]);
    const [[l]] = await db.query(
      "SELECT COALESCE(SUM(DATEDIFF(to_date,from_date)+1),0) n FROM leaves WHERE employee_id=? AND status='Approved' " +
      "AND from_date>=? AND from_date<DATE_ADD(?, INTERVAL 1 MONTH)", [e.id, start, start]);
    const absent = Math.max(0, WORKING_DAYS - Number(a.n) - Number(l.n));
    const basic = Number(e.basic_salary);
    const allowances = +(basic * 0.2).toFixed(2);
    const deductions = +(basic * 0.12 + (basic / 30) * absent).toFixed(2);
    await db.query("REPLACE INTO payroll(employee_id,month,basic,allowances,deductions,net) VALUES(?,?,?,?,?,?)",
      [e.id, month, basic, allowances, deductions, +(basic + allowances - deductions).toFixed(2)]);
  }
  res.json({ message: `Payroll generated for ${month}.`, employees: emps.length });
};

exports.list = async (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  const [rows] = await db.query(
    "SELECT p.*, e.name FROM payroll p JOIN employees e ON e.id=p.employee_id WHERE p.month=?", [month]);
  res.json(rows);
};

exports.mine = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM payroll WHERE employee_id=? ORDER BY month DESC", [req.user.employeeId]);
  res.json(rows);
};
