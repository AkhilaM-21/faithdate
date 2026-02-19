const Notification = require("../models/Notification");

// GET /api/notifications - Get all notifications for current user
exports.getNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 30;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ recipient: req.user.id })
            .populate("sender", "first_name photos")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const unreadCount = await Notification.countDocuments({
            recipient: req.user.id,
            isRead: false
        });

        const total = await Notification.countDocuments({ recipient: req.user.id });

        res.json({
            notifications,
            unreadCount,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// GET /api/notifications/unread-count - Get unread count only
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user.id,
            isRead: false
        });
        res.json({ unreadCount: count });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// PUT /api/notifications/:id/read - Mark single notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) return res.status(404).json({ msg: "Notification not found" });

        res.json(notification);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// PUT /api/notifications/read-all - Mark all as read
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { isRead: true }
        );
        res.json({ msg: "All notifications marked as read" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// DELETE /api/notifications/:id - Delete single notification
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            recipient: req.user.id
        });

        if (!notification) return res.status(404).json({ msg: "Notification not found" });

        res.json({ msg: "Notification deleted" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// DELETE /api/notifications - Clear all notifications
exports.clearAll = async (req, res) => {
    try {
        await Notification.deleteMany({ recipient: req.user.id });
        res.json({ msg: "All notifications cleared" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// ═══════════════════════════════════════════
// Helper: Create & emit notification (used by other controllers)
// ═══════════════════════════════════════════
exports.createNotification = async ({ recipient, sender, type, title, body, data, io }) => {
    try {
        const notification = await Notification.create({
            recipient,
            sender,
            type,
            title,
            body,
            data
        });

        // Populate sender info for the real-time event
        const populated = await notification.populate("sender", "first_name photos");

        // Emit via Socket.IO if available
        if (io) {
            io.to(`user_${recipient}`).emit("newNotification", populated);
        }

        return populated;
    } catch (err) {
        console.error("Notification create error:", err.message);
    }
};
