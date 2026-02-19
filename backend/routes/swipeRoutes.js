const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { swipe, rewind } = require("../controllers/swipeController");

router.post("/", auth, swipe);
router.post("/rewind", auth, rewind);

module.exports = router;
