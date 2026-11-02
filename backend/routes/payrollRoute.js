const router = require("express").Router();
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");
const c = require("../controllers/payrollController");

router.use(verifyToken);
router.post("/generate", allowRoles("HR Manager"), c.generate);
router.get("/", allowRoles("HR Manager"), c.list);
router.get("/me", allowRoles("Employee"), c.mine);

module.exports = router;
