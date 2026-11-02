const router = require("express").Router();
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");
const c = require("../controllers/leaveController");

router.use(verifyToken);
router.post("/", allowRoles("Employee"), c.apply);
router.get("/me", allowRoles("Employee"), c.mine);
router.get("/", allowRoles("HR Manager"), c.all);
router.put("/:id", allowRoles("HR Manager"), c.decide);

module.exports = router;
