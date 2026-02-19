const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["like", "nope", "superlike"], default: "like" }
}, { timestamps: true });

module.exports = mongoose.model("Like", likeSchema);
