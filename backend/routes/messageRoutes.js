const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { sendMessage, getMessages, markAsRead } = require("../controllers/messageController");

router.post("/", auth, sendMessage);
// router.post("/", auth, sendMessage); // Already exists
router.post("/read", auth, markAsRead);
router.get("/:matchId", auth, getMessages);

module.exports = router;
