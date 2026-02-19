const Like = require("../models/Like");
const Match = require("../models/Match");
const User = require("../models/User");
const { createNotification } = require("./notificationController");

exports.swipe = async (req, res) => {
  const { userId, type = "like" } = req.body; // type: like, nope, superlike
  const currentUserId = req.user.id;
  const io = req.app.get("io");

  // Prevent duplicates
  const existingSwipe = await Like.findOne({ from: currentUserId, to: userId });
  if (existingSwipe) {
    return res.json({ msg: "Already swiped" });
  }

  await Like.create({
    from: currentUserId,
    to: userId,
    type
  });

  if (type === "nope") {
    return res.json({ matched: false, type: "nope" });
  }

  // Handle Like / Superlike
  const currentUser = await User.findById(currentUserId).select("first_name isPremium subscriptionTier");

  // 👑 Premium Check for Super Like
  if (type === "superlike") {
    const isPremium = currentUser.isPremium || ["gold", "platinum"].includes(currentUser.subscriptionTier);
    if (!isPremium) {
      return res.status(403).json({ msg: "Super Like is a Premium Feature! 🌟 Upgrade to stand out." });
    }
  }

  // Notification for Superlike/Like
  if (type === "superlike" || type === "like") {
    await createNotification({
      recipient: userId,
      sender: currentUserId,
      type: type,
      title: type === "superlike" ? "Super Like! 🌟" : "New Like ❤️",
      body: `${currentUser.first_name} ${type === "superlike" ? "super liked" : "liked"} your profile!`,
      data: { userId: currentUserId },
      io
    });
  }

  // Check Mutual
  const mutualSwipe = await Like.findOne({
    from: userId,
    to: currentUserId,
    type: { $in: ["like", "superlike"] }
  });

  if (mutualSwipe) {
    const match = await Match.create({
      users: [currentUserId, userId]
    });

    const otherUser = await User.findById(userId).select("first_name");

    // Notify both
    const body = `You and ${otherUser.first_name} liked each other!`;
    const data = { matchId: match._id, userId };

    // ... (Use separate functionality or helper if complex, but inline is fine for now)
    // Send mutual notifications...
    await createNotification({ recipient: currentUserId, sender: userId, type: "match", title: "It's a Match! 🎉", body: `You and ${otherUser.first_name} liked each other!`, data: { matchId: match._id, userId }, io });
    await createNotification({ recipient: userId, sender: currentUserId, type: "match", title: "It's a Match! 🎉", body: `You and ${currentUser.first_name} liked each other!`, data: { matchId: match._id, userId: currentUserId }, io });

    return res.json({ matched: true, match });
  }

  res.json({ matched: false });
};

exports.rewind = async (req, res) => {
  const currentUserId = req.user.id;

  // Check Premium
  const user = await User.findById(currentUserId);
  if (!user.isPremium) {
    return res.status(403).json({ msg: "Rewind is a Premium feature 👑" });
  }

  // Find last swipe
  const lastSwipe = await Like.findOne({ from: currentUserId }).sort({ createdAt: -1 });

  if (!lastSwipe) {
    return res.status(404).json({ msg: "Nothing to rewind" });
  }

  // Check if it was a match? (If matched, maybe don't allow rewind or delete match too?)
  // For simplicity: allow rewind only if NOT matched? Or just delete swipe.
  // If matched, we should probably delete the match too.
  // Let's implement simple delete logic.

  await Like.findByIdAndDelete(lastSwipe._id);

  // If match existed, find and remove
  const match = await Match.findOne({ users: { $all: [currentUserId, lastSwipe.to] } });
  if (match) {
    await Match.findByIdAndDelete(match._id);
  }

  res.json({ msg: "Rewound last swipe ⏪", restoredUserId: lastSwipe.to });
};
