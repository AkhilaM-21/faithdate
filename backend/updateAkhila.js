const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const updateAkhila = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "users" });
    console.log("MongoDB Connected...");

    // Find the user by name or email (case-insensitive)
    const user = await User.findOne({
      $or: [
        { first_name: { $regex: "Akhila", $options: "i" } },
        { email: { $regex: "akhila", $options: "i" } }
      ]
    });

    if (!user) {
      console.log("User 'Akhila' not found. Please register the user first.");
      process.exit(1);
    }

    console.log(`Found user: ${user.first_name} (${user.email})`);

    // Update Profile Details
    user.location = "London, UK";
    user.bio = "Hi, I'm Akhila! I love Jesus, traveling, and photography. Looking for a God-fearing man to share my life with.";
    user.interests = ["Photography", "Travel", "Music", "Cooking", "Reading"];
    user.church_involvement = "Very Active";
    user.denomination = "Pentecostal";
    user.relationship_goal = "Marriage";
    user.isProfileComplete = true;

    // Update Photos
    user.photos = [
      {
        url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=60",
        caption: "Profile Pic",
        location: "London, UK"
      },
      {
        url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=60",
        caption: "Travel",
        location: "Paris, France"
      },
      {
        url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=60",
        caption: "Smile",
        location: "London, UK"
      }
    ];

    await user.save();
    console.log("Successfully updated Akhila's profile!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

updateAkhila();