// Run once:  npm run createadmin
const bcrypt = require("bcryptjs");
const db = require("./config/db");

(async () => {
  await db.query("INSERT IGNORE INTO users(username,password_hash,role) VALUES('admin',?,'Admin')",
    [await bcrypt.hash("admin123", 10)]);
  console.log("Admin ready -> username: admin  password: admin123");
  process.exit(0);
})();
