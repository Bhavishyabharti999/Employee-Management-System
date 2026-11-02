const router = require("express").Router();
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");
const c = require("../controllers/attendanceController");

router.use(verifyToken);
router.post("/check-in", allowRoles("Employee"), c.checkIn);
router.post("/check-out", allowRoles("Employee"), c.checkOut);
router.get("/me", allowRoles("Employee"), c.mine);
router.get("/", allowRoles("HR Manager"), c.byDate);

module.exports = router;
