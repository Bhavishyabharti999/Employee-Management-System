const router = require("express").Router();
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");
const c = require("../controllers/adminController");

router.use(verifyToken);
router.get("/departments", allowRoles("Admin", "HR Manager"), c.listDepartments);
router.post("/departments", allowRoles("Admin"), c.createDepartment);
router.get("/users", allowRoles("Admin"), c.listUsers);
router.post("/users", allowRoles("Admin"), c.createUser);
router.put("/users/:id/toggle", allowRoles("Admin"), c.toggleUser);

module.exports = router;
