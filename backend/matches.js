const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
// Note: Adjust paths if your structure is different, but based on your controller these should be correct relative to backend/ folder
const User = require('./models/User');
const Match = require('./models/Match');

const seedMatches = async () => {
  try {
    // Connect to MongoDB
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is missing in .env file");
        process.exit(1);
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Get all users
    const users = await User.find();
    console.log(`Found ${users.length} users`);

    if (users.length < 2) {
      console.log('Need at least 2 users to create matches. Please register more users first.');
      process.exit();
    }

    let count = 0;

    // Create a match for every user with the next user in the list
    // This ensures every profile has at least one match
    for (let i = 0; i < users.length; i++) {
      const userA = users[i];
      // Pair with the next user in the array, wrapping around to the start for the last user
      const userB = users[(i + 1) % users.length]; 

      // Check if match already exists to avoid duplicates
      const exists = await Match.findOne({
        users: { $all: [userA._id, userB._id] }
      });

      if (!exists) {
        await Match.create({
          users: [userA._id, userB._id]
        });
        console.log(`Created match: ${userA.first_name} <-> ${userB.first_name}`);
        count++;
      }
    }

    console.log(`Done! Added ${count} new matches.`);
    process.exit();
  } catch (err) {
    console.error("Error seeding matches:", err);
    process.exit(1);
  }
};

seedMatches();
