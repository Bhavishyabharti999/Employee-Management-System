const router = require("express").Router();
const { verifyToken } = require("../middleware/authMiddleware");
const c = require("../controllers/authController");

router.post("/login", c.login);
router.put("/password", verifyToken, c.changePassword);

module.exports = router;
