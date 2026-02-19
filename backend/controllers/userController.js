const User = require("../models/User");
const Match = require("../models/Match");
const Like = require("../models/Like");
const Message = require("../models/Message");
const Report = require("../models/Report");
const mongoose = require("mongoose");

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};

exports.updateProfile = async (req, res) => {
  const {
    bio,
    job,
    education,
    relationship_goal,
    denomination,
    church_involvement,
    interests,
    location,
    photos,
    gender,
    interested_in,
    date_of_birth,
    phoneNumber,
    agePreference,
    distancePreference
  } = req.body;

  try {
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // ── Photo validation (1–9 limit + explicit image blocker) ──
    if (photos) {
      if (photos.length > 9) {
        return res.status(400).json({ msg: "You can upload a maximum of 9 photos" });
      }

      // Simulated explicit content detection stub
      const blocked = photos.some(p => {
        const url = (p.url || "").toLowerCase();
        // 8️⃣ Enhanced Content Blocking
        return url.includes("explicit") || url.includes("nsfw") || url.includes("nude") ||
          url.includes("porn") || url.includes("xxx") || url.includes("gun") ||
          url.includes("violence") || url.includes("drug") || url.includes("blood");
      });
      if (blocked) {
        return res.status(400).json({ msg: "One or more photos were flagged as inappropriate. Please remove them and try again." });
      }

      user.photos = photos;
    }

    // ── Update all fields ──
    if (bio !== undefined) user.bio = bio;
    if (job !== undefined) user.job = job;
    if (education !== undefined) user.education = education;
    if (relationship_goal) user.relationship_goal = relationship_goal;
    if (denomination) user.denomination = denomination;
    if (church_involvement) user.church_involvement = church_involvement;
    if (interests) user.interests = interests;
    if (location) user.location = location;
    if (gender) user.gender = gender;
    if (interested_in) user.interested_in = interested_in;
    if (date_of_birth) user.date_of_birth = date_of_birth;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (agePreference) user.agePreference = agePreference;
    if (agePreference) user.agePreference = agePreference;
    if (distancePreference !== undefined) user.distancePreference = distancePreference;
    if (req.body.isVisible !== undefined) user.isVisible = req.body.isVisible;

    // ── Age is ALWAYS visible (cannot hide age) ──
    // date_of_birth is required and always shown. No "hideAge" option.

    // ── Prevent faking verified badge ──
    // isVerified can only be set via the /verify endpoint, never from profile update
    // (we intentionally do NOT accept isVerified from req.body)

    // Check if profile is complete
    if (
      user.bio &&
      user.relationship_goal &&
      user.denomination &&
      user.church_involvement &&
      user.location &&
      user.photos && user.photos.length > 0 &&
      user.gender &&
      user.interested_in &&
      user.date_of_birth
    ) {
      user.isProfileComplete = true;
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// ═══════════════════════════════════════
// Selfie Verification
// ═══════════════════════════════════════
exports.verifyProfile = async (req, res) => {
  const { selfiePhoto } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (user.isVerified) {
      return res.json({ msg: "Profile is already verified", isVerified: true });
    }

    if (!selfiePhoto) {
      return res.status(400).json({ msg: "Selfie photo is required for verification" });
    }

    if (!user.photos || user.photos.length === 0) {
      return res.status(400).json({ msg: "You need at least one profile photo to verify against" });
    }

    // ── Simulated AI face-match check ──
    // In production, this would use a real face-recognition API (e.g., AWS Rekognition, Azure Face API)
    console.log(`🤳 Verification selfie received for user ${user.first_name} (${user._id})`);
    console.log(`   Comparing selfie against ${user.photos.length} profile photo(s)...`);

    // Simulate a 90% success rate
    const matchConfidence = Math.random();
    if (matchConfidence < 0.1) {
      return res.status(400).json({ msg: "Face verification failed. Please try again with a clearer selfie." });
    }

    user.isVerified = true;
    user.verificationPhoto = selfiePhoto;
    await user.save();

    console.log(`✅ User ${user.first_name} verified successfully (confidence: ${(matchConfidence * 100).toFixed(1)}%)`);

    res.json({ msg: "Profile verified successfully!", isVerified: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// ═══════════════════════════════════════
// Profile Views
// ═══════════════════════════════════════
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// ═══════════════════════════════════════
// Profile Views
// ═══════════════════════════════════════
exports.recordProfileView = async (req, res) => {
  try {
    const viewedUserId = req.params.id;
    const viewerId = req.user.id;

    if (viewedUserId === viewerId) {
      return res.json({ msg: "Cannot view your own profile" });
    }

    const viewedUser = await User.findById(viewedUserId);
    if (!viewedUser) return res.status(404).json({ msg: "User not found" });

    // Prevent duplicate views within 24 hours
    const recentView = viewedUser.profileViews.find(
      v => v.viewer.toString() === viewerId &&
        (Date.now() - new Date(v.viewedAt).getTime()) < 24 * 60 * 60 * 1000
    );

    if (!recentView) {
      viewedUser.profileViews.push({ viewer: viewerId, viewedAt: new Date() });
      // Keep only last 100 views
      if (viewedUser.profileViews.length > 100) {
        viewedUser.profileViews = viewedUser.profileViews.slice(-100);
      }
      await viewedUser.save();
    }

    res.json({ msg: "View recorded" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.getProfileViews = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("profileViews.viewer", "first_name photos isVerified");

    const totalViews = user.profileViews.length;

    // Premium users see full viewer list, free users only see count
    if (user.isPremium) {
      const recentViews = user.profileViews
        .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt))
        .slice(0, 20);
      res.json({ totalViews, viewers: recentViews, isPremium: true });
    } else {
      res.json({
        totalViews,
        viewers: [],
        isPremium: false,
        msg: "Upgrade to Premium to see who viewed your profile"
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// ═══════════════════════════════════════
// Who Liked Me (Premium Gated)
// ═══════════════════════════════════════
exports.getWhoLikedMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    // Get all likes received
    const likes = await Like.find({ to: userId }).populate("from", "first_name photos isVerified date_of_birth");

    const totalLikes = likes.length;
    const hasGold = ["gold", "platinum"].includes(user.subscriptionTier) || user.isPremium;

    if (hasGold) {
      // Gold: Return full details
      res.json({
        totalLikes,
        likes: likes.map(l => l.from),
        tier: "gold"
      });
    } else {
      // Free/Plus: Return count only
      res.json({
        totalLikes,
        likes: [],
        tier: user.subscriptionTier,
        msg: "Upgrade to Gold to see who liked you"
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
exports.discover = async (req, res) => {
  const { minAge, maxAge, denomination, relationship_goal, church_involvement, interests, location, gender, radius } = req.query;

  try {
    const currentUserId = req.user.id;
    const currentUser = await User.findById(currentUserId);

    const likedUserIds = await Like.find({ from: currentUserId }).distinct('to');
    const matches = await Match.find({ users: currentUserId });
    const matchedUserIds = matches.flatMap(match =>
      match.users.filter(id => id.toString() !== currentUserId.toString())
    );

    // ── 8️⃣ Algorithm: Update Activity & Filter ──
    currentUser.lastActive = new Date();
    await currentUser.save();

    // Inactivity Filter (e.g., hidden if inactive > 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const excludedUserIds = [...new Set([...likedUserIds, ...matchedUserIds, currentUserId])];

    const query = {
      _id: { $nin: excludedUserIds },
      isProfileComplete: true,
      isVisible: true,
      isShadowBanned: false, // Hide spam/banned accounts
      lastActive: { $gte: thirtyDaysAgo }, // Only show active users
      desirabilityScore: { $gte: 30 } // 8️⃣ Limit exposure for low-quality profiles
    };

    // Gender preference
    if (currentUser.interested_in) {
      query.gender = currentUser.interested_in;
    }
    if (gender) {
      query.gender = gender;
    }
    if (denomination) query.denomination = denomination;
    if (relationship_goal) query.relationship_goal = relationship_goal;
    if (church_involvement) query.church_involvement = church_involvement;

    // Age filter
    const effectiveMinAge = parseInt(minAge) || currentUser.agePreference?.min || 18;
    const effectiveMaxAge = parseInt(maxAge) || currentUser.agePreference?.max || 50;
    const today = new Date();
    const minDate = new Date(today.getFullYear() - effectiveMaxAge - 1, today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear() - effectiveMinAge, today.getMonth(), today.getDate());
    query.date_of_birth = { $gte: minDate, $lte: maxDate };

    // Fetch users (Sort by Desirability Score DESC for "Quality" ranking)
    // Fetch users (Sort by Desirability Score DESC)
    // 🧠 4️⃣ D. Algorithm Visibility Suppression / Boost
    // Free users get no boost. Plus/Gold get boosted. 
    // We simulate this by checking the Viewer's tier... wait, this query fetches *candidates*.
    // The "Boost" logic usually applies to *currently logged in user* being seen by *others*.
    // So in *this* function, we are seeing *others*. 
    // However, we can sort *candidates* by their Tier + Score to show "Gold" users first (Pay-to-Win visibility).

    const foundUsers = await User.find(query)
      .select("-password -profileViews -otp -otpExpires -desirabilityScore -spamScore -isShadowBanned")
      .sort({ desirabilityScore: -1, lastActive: -1 }) // Boost high quality & active users
      .limit(50);

    // Calculate Match Score
    const usersWithScore = foundUsers.map(user => {
      let score = 60;

      if (currentUser.interests && user.interests) {
        const commonInterests = currentUser.interests.filter(i => user.interests.includes(i));
        score += Math.min(commonInterests.length * 5, 20);
      }

      if (currentUser.denomination && user.denomination && currentUser.denomination === user.denomination) {
        score += 10;
      }

      if (currentUser.relationship_goal && user.relationship_goal && currentUser.relationship_goal === user.relationship_goal) {
        score += 10;
      }

      // Verified users get a small boost
      if (user.isVerified) score += 3;

      score = Math.min(score, 98);

      return { ...user.toObject(), matchScore: score };
    });

    res.json(usersWithScore);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.likeUser = async (req, res) => {
  const { userId } = req.body;
  const currentUserId = req.user.id;

  try {
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) return res.status(404).json({ msg: "User not found" });

    // ── Check Swipe Limit (Free vs Plus/Gold) ──
    const SWIPE_LIMIT = 10; // Free user daily limit

    // Tiers: 'plus', 'gold', 'platinum' have UNLIMITED swipes
    const hasUnlimitedSwipes = ["plus", "gold", "platinum"].includes(currentUser.subscriptionTier) || currentUser.isPremium;

    if (!hasUnlimitedSwipes) {
      const today = new Date();
      const lastReset = new Date(currentUser.lastSwipeReset);

      // Reset logic: same day check
      const isSameDay = lastReset.getDate() === today.getDate() &&
        lastReset.getMonth() === today.getMonth() &&
        lastReset.getFullYear() === today.getFullYear();

      if (!isSameDay) {
        currentUser.dailySwipes = 0;
        currentUser.lastSwipeReset = today;
      }

      if (currentUser.dailySwipes >= SWIPE_LIMIT) {
        return res.status(403).json({
          msg: "Out of likes! Upgrade to Plus for unlimited swipes.",
          tier: currentUser.subscriptionTier,
          limitReached: true
        });
      }

      // Increment swipe count
      currentUser.dailySwipes += 1;
      await currentUser.save();
    }

    const existingLike = await Like.findOne({ from: currentUserId, to: userId });
    if (existingLike) {
      return res.json({ matched: false, msg: "Already liked" });
    }

    const newLike = new Like({ from: currentUserId, to: userId });
    await newLike.save();

    const mutualLike = await Like.findOne({ from: userId, to: currentUserId });

    if (mutualLike) {
      const match = new Match({
        users: [currentUserId, userId]
      });
      await match.save();

      // Desirability Boost (Simple ELO)
      // Liked user gets +1, Current user gets +0.5 (for being active/matching)
      await User.findByIdAndUpdate(userId, { $inc: { desirabilityScore: 1 } });
      await User.findByIdAndUpdate(currentUserId, { $inc: { desirabilityScore: 0.5 } });

      return res.json({ matched: true, matchId: match._id });
    }

    // Standard Like Boost
    await User.findByIdAndUpdate(userId, { $inc: { desirabilityScore: 0.2 } });

    res.json({ matched: false });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.getMatches = async (req, res) => {
  try {
    const matches = await Match.find({ users: req.user.id })
      .populate("users", "first_name photos isVerified date_of_birth")
      .sort({ createdAt: -1 });

    const formattedMatches = matches.map(match => {
      const otherUser = match.users.find(u => u._id.toString() !== req.user.id);
      if (!otherUser) return null;

      return {
        _id: match._id,
        user: otherUser,
        lastMessage: "Start a conversation! 👋", // Placeholder for now
        lastMessageTime: match.createdAt
      };
    }).filter(m => m !== null);

    res.json(formattedMatches);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.unmatchUser = async (req, res) => {
  try {
    const matchId = req.params.matchId;
    const match = await Match.findOneAndDelete({
      _id: matchId,
      users: req.user.id
    });

    if (!match) return res.status(404).json({ msg: "Match not found" });

    // Optional: Delete related messages or likes
    // await Message.deleteMany({ /* ... */ });

    res.json({ msg: "Unmatched successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.reportUser = async (req, res) => {
  try {
    const { reportedUserId, reason } = req.body;

    if (!reportedUserId || !reason) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const report = new Report({
      reporter: req.user.id,
      reportedUser: reportedUserId,
      reason
    });

    await report.save();
    res.json({ msg: "User reported successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    await Like.deleteMany({ $or: [{ from: userId }, { to: userId }] });
    await Match.deleteMany({ users: userId });
    await Message.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] });
    await User.findByIdAndDelete(userId);

    res.json({ msg: "Account and all related data deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
