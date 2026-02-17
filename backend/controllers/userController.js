const User = require("../models/User");
const Match = require("../models/Match");
const Like = require("../models/Like");
const Message = require("../models/Message");
const mongoose = require("mongoose");

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};

exports.updateProfile = async (req, res) => {
  const {
    bio,
    relationship_goal,
    denomination,
    church_involvement,
    interests,
    location,
    photos,
    gender,
    interested_in,
    date_of_birth,
    phoneNumber
  } = req.body;

  try {
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (bio) user.bio = bio;
    if (relationship_goal) user.relationship_goal = relationship_goal;
    if (denomination) user.denomination = denomination;
    if (church_involvement) user.church_involvement = church_involvement;
    if (interests) user.interests = interests;
    if (location) user.location = location;
    if (photos) user.photos = photos;
    if (gender) user.gender = gender;
    if (interested_in) user.interested_in = interested_in;
    if (date_of_birth) user.date_of_birth = date_of_birth;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    // Check if profile is complete based on mandatory fields
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

exports.discover = async (req, res) => {
  const { minAge, maxAge, denomination, relationship_goal, church_involvement, interests, location, gender, radius } = req.query;

  try {
    const currentUserId = req.user.id;

    // Get current user to check their preferences
    const currentUser = await User.findById(currentUserId);

    // Find all users that current user has already liked
    const likedUserIds = await Like.find({ from: currentUserId }).distinct('to');

    // Find all users that current user has matched with
    const matches = await Match.find({ users: currentUserId });
    const matchedUserIds = matches.flatMap(match =>
      match.users.filter(id => id.toString() !== currentUserId.toString())
    );

    // Combine liked and matched user IDs to exclude
    const excludedUserIds = [...likedUserIds, ...matchedUserIds, currentUserId];

    // Build the query object
    const query = {
      _id: { $nin: excludedUserIds },
      isProfileComplete: true
    };

    // Apply gender preference filter based on current user's interest
    if (currentUser.interested_in) {
      query.gender = currentUser.interested_in;
    }

    // Apply additional filters from query params
    if (gender) {
      query.gender = gender;
    }

    if (denomination) {
      query.denomination = denomination;
    }

    if (relationship_goal) {
      query.relationship_goal = relationship_goal;
    }

    if (church_involvement) {
      query.church_involvement = church_involvement;
    }

    // Age filter (requires calculating from date_of_birth)
    if (minAge || maxAge) {
      const today = new Date();
      if (maxAge) {
        const minDate = new Date(today.getFullYear() - maxAge - 1, today.getMonth(), today.getDate());
        query.date_of_birth = { $gte: minDate };
      }
      if (minAge) {
        const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
        query.date_of_birth = { ...query.date_of_birth, $lte: maxDate };
      }
    }

    // Find users matching the criteria, limit to 50 results
    const foundUsers = await User.find(query)
      .select("-password")
      .limit(50);

    // Calculate Match Score
    const usersWithScore = foundUsers.map(user => {
      let score = 60; // Base score

      // 1. Common Interests (up to 20 points)
      if (currentUser.interests && user.interests) {
        const commonInterests = currentUser.interests.filter(i => user.interests.includes(i));
        score += Math.min(commonInterests.length * 5, 20);
      }

      // 2. Denomination Match (10 points)
      if (currentUser.denomination && user.denomination && currentUser.denomination === user.denomination) {
        score += 10;
      }

      // 3. Relationship Goal Match (10 points)
      if (currentUser.relationship_goal && user.relationship_goal && currentUser.relationship_goal === user.relationship_goal) {
        score += 10;
      }

      // Ensure not over 100
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
    // 1. Check if already liked
    const existingLike = await Like.findOne({ from: currentUserId, to: userId });
    if (existingLike) {
      return res.json({ matched: false, msg: "Already liked" });
    }

    // 2. Create Like
    const newLike = new Like({ from: currentUserId, to: userId });
    await newLike.save();

    // 3. Check for mutual like
    const mutualLike = await Like.findOne({ from: userId, to: currentUserId });

    if (mutualLike) {
      // Create Match
      const match = new Match({
        users: [currentUserId, userId]
      });
      await match.save();
      return res.json({ matched: true, matchId: match._id });
    }

    res.json({ matched: false });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.getMatches = async (req, res) => {
  try {
    // PROTOTYPE: Return 3 dummy matches
    const users = await User.find({ _id: { $ne: req.user.id } }).limit(3).select("-password");
    const matches = users.map(user => ({
      _id: new mongoose.Types.ObjectId(),
      user: user,
      lastMessage: "Prototype Match 👋",
      lastMessageTime: new Date()
    }));
    res.json(matches);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    // Delete user and related data (optional: delete matches/likes/messages)
    await User.findByIdAndDelete(req.user.id);
    res.json({ msg: "Account deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
