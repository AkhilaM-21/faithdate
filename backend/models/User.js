const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  first_name: String,
  email: { type: String, unique: true },
  password: String,
  gender: String,
  interested_in: String,
  date_of_birth: Date,
  bio: String,
  relationship_goal: String,
  denomination: String,
  church_involvement: String,
  interests: [String],
  location: String,
  photos: [{
    url: String,
    caption: String,
    location: String
  }],
  phoneNumber: String,
  isProfileComplete: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema, "profile");
