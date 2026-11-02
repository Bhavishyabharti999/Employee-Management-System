const db = require("../config/db");

exports.dashboard = async (req, res) => {
  const [[a]] = await db.query("SELECT COUNT(*) n FROM employees WHERE status='Active'");
  const [[b]] = await db.query("SELECT COUNT(*) n FROM attendance WHERE work_date=CURDATE()");
  const [[c]] = await db.query("SELECT COUNT(*) n FROM leaves WHERE status='Pending'");
  res.json({ activeEmployees: a.n, presentToday: b.n, pendingLeaves: c.n });
};

exports.summary = async (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  const start = month + "-01";
  const [attendance] = await db.query(
    "SELECT e.name, COUNT(a.id) AS days_present FROM employees e LEFT JOIN attendance a ON a.employee_id=e.id " +
    "AND a.work_date>=? AND a.work_date<DATE_ADD(?, INTERVAL 1 MONTH) GROUP BY e.id", [start, start]);
  const [departments] = await db.query(
    "SELECT d.name, COUNT(e.id) AS staff, COALESCE(SUM(e.basic_salary),0) AS total_basic FROM departments d " +
    "LEFT JOIN employees e ON e.department_id=d.id GROUP BY d.id");
  const [leaves] = await db.query("SELECT status, COUNT(*) AS total FROM leaves GROUP BY status");
  const [[pay]] = await db.query("SELECT COALESCE(SUM(net),0) AS total FROM payroll WHERE month=?", [month]);
  res.json({ month, attendance, departments, leaves, payrollTotal: pay.total });
};
