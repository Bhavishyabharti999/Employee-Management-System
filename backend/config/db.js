const mysql = require("mysql2/promise");
require("dotenv").config();

module.exports = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "ems",
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true, // dates come back as "2026-11-02" text
});
