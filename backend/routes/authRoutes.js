const router = require("express").Router();
const { register, login, socialLogin } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/social", socialLogin);

module.exports = router;
