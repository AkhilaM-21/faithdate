const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
} = require("../controllers/notificationController");

router.get("/", auth, getNotifications);
router.get("/unread-count", auth, getUnreadCount);
router.put("/read-all", auth, markAllAsRead);
router.put("/:id/read", auth, markAsRead);
router.delete("/clear", auth, clearAll);
router.delete("/:id", auth, deleteNotification);

module.exports = router;
