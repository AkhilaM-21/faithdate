const Message = require("../models/Message");
const Match = require("../models/Match");
const User = require("../models/User");
const { createNotification } = require("./notificationController");

exports.sendMessage = async (req, res) => {
  const { matchId, text, type = "text", mediaUrl } = req.body;
  const senderId = req.user.id;
  const io = req.app.get("io");

  // Privacy Flagging (Simple Regex for Phone/Email)
  const phoneRegex = /\b\d{10,}\b|\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  // Check Premium for Images
  if (type === "image") {
    const user = await User.findById(senderId);
    if (!user.isPremium) {
      return res.status(403).json({ msg: "Upgrade to Premium to send photos! 📷" });
    }
  }

  const message = await Message.create({
    matchId,
    sender: senderId,
    text,
    type,
    mediaUrl,
    isFlagged,
    readBy: [senderId] // Sender has read their own message
  });

  // Find the other user in the match to notify them
  const match = await Match.findById(matchId);
  if (match) {
    const recipientId = match.users.find(u => u.toString() !== senderId);
    if (recipientId) {
      const sender = await User.findById(senderId).select("first_name");

      // Notify via Push/Notification Center
      await createNotification({
        recipient: recipientId,
        sender: senderId,
        type: "message",
        title: "New Message 💬",
        body: type === "image" ? "Sent a photo 📷" : type === "gif" ? "Sent a GIF 👾" : (text?.length > 50 ? text.substring(0, 50) + "..." : text),
        data: { matchId },
        io
      });

      // Emit socket event for real-time chat
      io.to(matchId.toString()).emit("receiveMessage", message);
    }
  }

  res.json(message);
};

exports.getMessages = async (req, res) => {
  const messages = await Message.find({
    matchId: req.params.matchId
  }).sort({ createdAt: 1 }); // Ensure correct order

  res.json(messages);
};

exports.markAsRead = async (req, res) => {
  const { matchId } = req.body;
  const userId = req.user.id;
  const io = req.app.get("io");

  await Message.updateMany(
    { matchId, readBy: { $ne: userId } },
    { $addToSet: { readBy: userId } }
  );

  io.to(matchId).emit("messagesRead", { matchId, userId });
  res.json({ msg: "Messages marked as read" });
};
