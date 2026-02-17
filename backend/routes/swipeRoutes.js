const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { likeUser } = require("../controllers/swipeController");

router.post("/like", auth, likeUser);

module.exports = router;
