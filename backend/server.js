require("dotenv").config();
require("express-async-errors"); // lets async controllers send errors to the handler below
const express = require("express");
const cors = require("cors");

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/leaves", require("./routes/leaveRoutes"));
app.use("/api/payroll", require("./routes/payrollRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

app.use((req, res) => res.status(404).json({ message: "Route not found." }));

app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "That value already exists." });
  res.status(500).json({ message: "Server error." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`EMS backend running on http://localhost:${PORT}`));
