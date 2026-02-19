const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  first_name: String,
  email: { type: String, unique: true },
  password: String,
  gender: String,
  interested_in: String,
  date_of_birth: Date,
  bio: String,
  job: String,
  education: String,
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
  phoneVerified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,
  authProvider: { type: String, enum: ["email", "google", "facebook", "apple"], default: "email" },
  socialId: String,
  notificationsEnabled: { type: Boolean, default: true },
  isProfileComplete: { type: Boolean, default: false },
  isVisible: { type: Boolean, default: true }, // For "Hide Profile" feature

  // Preferences
  agePreference: {
    min: { type: Number, default: 18 },
    max: { type: Number, default: 50 }
  },
  distancePreference: { type: Number, default: 50 }, // km

  // Verification
  isVerified: { type: Boolean, default: false },
  verificationPhoto: String,

  // Premium & Limits
  isPremium: { type: Boolean, default: false },
  // Premium & Limits
  isPremium: { type: Boolean, default: false },
  dailySwipes: { type: Number, default: 0 },
  lastSwipeReset: { type: Date, default: Date.now },

  // 8️⃣ Hidden Algorithm Scores (Internal Use Only)
  desirabilityScore: { type: Number, default: 50 }, // ELO Score
  lastActive: { type: Date, default: Date.now },
  spamScore: { type: Number, default: 0 },
  isShadowBanned: { type: Boolean, default: false }, // Ghost visibility

  // Profile Views
  profileViews: [{
    viewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    viewedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema, "profile");
