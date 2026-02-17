const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");
const User = require("../models/User");

// Load .env from the backend root directory explicitly
dotenv.config({ path: path.join(__dirname, "../.env") });

const seedUsers = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ Error: MONGO_URI is undefined. Check your .env file.");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI, { dbName: "users" });
    console.log("✅ MongoDB Connected...");
    console.log(`📍 Target Database: ${mongoose.connection.name}`);
    console.log(`📍 Target Collection: ${User.collection.name}`);

    // Clear existing users
    console.log("🧹 Clearing existing data...");
    await User.deleteMany({});

    const genders = ["Male", "Female"];
    const goals = ["Marriage", "Long-term", "Dating"];
    const denominations = ["Catholic", "Protestant", "Orthodox", "Non-denominational", "Pentecostal"];
    const involvements = ["Very Active", "Moderate", "Occasional"];
    const interestsList = ["Music", "Hiking", "Reading", "Travel", "Cooking", "Sports", "Art", "Movies", "Volunteering", "Photography", "Writing", "Gaming", "Gardening", "Dancing"];
    const locations = [
      "London, UK", "Manchester, UK", "Birmingham, UK", "Leeds, UK", "Glasgow, UK", 
      "Southampton, UK", "Liverpool, UK", "Newcastle, UK", "Nottingham, UK", "Sheffield, UK", 
      "Bristol, UK", "Belfast, UK", "Leicester, UK", "Edinburgh, UK", "Cardiff, UK"
    ];

    const maleNames = [
      "James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", 
      "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua", "Kenneth",
      "Kevin", "Brian", "George", "Edward", "Ronald", "Timothy", "Jason", "Jeffrey", "Ryan", "Jacob"
    ];
    const femaleNames = [
      "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen", 
      "Nancy", "Lisa", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Donna", "Michelle",
      "Dorothy", "Carol", "Amanda", "Melissa", "Deborah", "Stephanie", "Rebecca", "Sharon", "Laura", "Cynthia"
    ];

    // Sample photos from Unsplash
    const malePhotos = [
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1480429370139-81bf48703b9c?auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=60"
    ];

    const femalePhotos = [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=60"
    ];

    const users = [];
    // All dummy users will have the password "password123"
    const password = await bcrypt.hash("password123", 10);

    for (let i = 0; i < 200; i++) {
      const gender = i % 2 === 0 ? "Male" : "Female";
      const firstName = gender === "Male" 
        ? maleNames[Math.floor(Math.random() * maleNames.length)] 
        : femaleNames[Math.floor(Math.random() * femaleNames.length)];
      
      const photoPool = gender === "Male" ? malePhotos : femalePhotos;

      // Generate 3 random photos
      const userPhotos = [];
      for (let j = 0; j < 3; j++) {
        userPhotos.push({
          url: photoPool[Math.floor(Math.random() * photoPool.length)],
          caption: j === 0 ? "Profile Pic" : (j === 1 ? "Travel" : "Smile"),
          location: locations[Math.floor(Math.random() * locations.length)]
        });
      }

      // Generate 5 random interests
      const userInterests = [];
      while (userInterests.length < 5) {
        const interest = interestsList[Math.floor(Math.random() * interestsList.length)];
        if (!userInterests.includes(interest)) {
          userInterests.push(interest);
        }
      }

      // Random age between 18 and 40
      const age = 18 + Math.floor(Math.random() * 23);
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - age);

      users.push({
        first_name: firstName,
        email: `${firstName.toLowerCase()}${i + 1}@test.com`,
        password: password,
        gender: gender,
        interested_in: gender === "Male" ? "Female" : "Male",
        date_of_birth: dob,
        relationship_goal: goals[Math.floor(Math.random() * goals.length)],
        denomination: denominations[Math.floor(Math.random() * denominations.length)],
        church_involvement: involvements[Math.floor(Math.random() * involvements.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        bio: `Hi, I'm ${firstName}! I love Jesus, ${userInterests[0].toLowerCase()}, and ${userInterests[1].toLowerCase()}. Looking for a partner to share my faith with.`,
        interests: userInterests,
        photos: userPhotos,
        isProfileComplete: true
      });
    }

    console.log("💾 Inserting 200 users...");
    await User.insertMany(users);
    
    const count = await User.countDocuments();
    console.log(`🎉 Success! ${count} users are now in the '${User.collection.name}' collection of the '${mongoose.connection.name}' database.`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedUsers();
