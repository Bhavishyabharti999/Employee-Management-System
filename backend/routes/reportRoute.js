const router = require("express").Router();
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");
const c = require("../controllers/reportController");

router.use(verifyToken, allowRoles("Admin", "HR Manager"));
router.get("/dashboard", c.dashboard);
router.get("/summary", c.summary);

module.exports = router;
