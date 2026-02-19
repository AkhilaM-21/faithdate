const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: "Match" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
  type: { type: String, enum: ["text", "image", "gif"], default: "text" },
  mediaUrl: String,
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isFlagged: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);