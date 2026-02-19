const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
        type: String,
        enum: ["like", "match", "message", "system"],
        required: true
    },
    title: String,
    body: String,
    data: {
        matchId: { type: mongoose.Schema.Types.ObjectId, ref: "Match" },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

// Index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
