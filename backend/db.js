const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Post = require("./models/Post");

dotenv.config();

const seedPosts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "users" });
    console.log("MongoDB Connected...");
    console.log(`Target Database: ${mongoose.connection.name}`);
    console.log(`Target Collection: ${User.collection.name}`);

    // Fetch all users to assign as authors
    const users = await User.find();
    console.log(`Found ${users.length} users.`);
    
    if (users.length === 0) {
      console.log("No users found! Please register some users in the app first.");
      process.exit(1);
    }

    const postTypes = ["Discussion", "Prayer", "Event"];
    const postTemplates = [
      "Does anyone have recommendations for a good devotional?",
      "I'm struggling with anxiety lately, prayers appreciated.",
      "Who is going to the worship night on Friday?",
      "Just read an amazing book about faith.",
      "Looking for a gym partner in the area.",
      "What are you grateful for today?",
      "Has anyone tried the new Italian place?",
      "Bible study at my place this Tuesday!",
      "Feeling a bit lonely, anyone want to chat?",
      "God is good all the time!",
      "Can we talk about last Sunday's sermon?",
      "I need advice on relationships.",
      "Anyone interested in a hiking trip?",
      "Praying for everyone taking exams this week.",
      "Coffee meetup tomorrow morning?",
      "Just moved here, looking to make friends.",
      "What's your favorite worship song right now?",
      "Thinking about starting a book club.",
      "Happy birthday to my best friend!",
      "Life is beautiful."
    ];

    const sampleImages = [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=60"
    ];

    const posts = [];

    for (let i = 0; i < 200; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomType = postTypes[Math.floor(Math.random() * postTypes.length)];
      const randomContent = postTemplates[Math.floor(Math.random() * postTemplates.length)];
      const randomImage = Math.random() < 0.3 ? sampleImages[Math.floor(Math.random() * sampleImages.length)] : null;
      
      // Generate random likes
      const numLikes = Math.floor(Math.random() * 8);
      const likes = [];
      for (let j = 0; j < numLikes; j++) {
        const liker = users[Math.floor(Math.random() * users.length)];
        if (!likes.includes(liker._id)) {
          likes.push(liker._id);
        }
      }

      // Generate random comments
      const numComments = Math.floor(Math.random() * 4);
      const comments = [];
      for (let k = 0; k < numComments; k++) {
        const commenter = users[Math.floor(Math.random() * users.length)];
        comments.push({
          text: "This is a comment #" + Math.floor(Math.random() * 1000),
          author: commenter._id,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 100000000))
        });
      }

      posts.push({
        author: randomUser._id,
        content: `${randomContent} (Sample #${i + 1})`,
        image: randomImage,
        type: randomType,
        likes: likes,
        comments: comments,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)) // Random time in the past
      });
    }

    // Uncomment the line below if you want to clear existing posts before seeding
    await Post.deleteMany({}); 

    await Post.insertMany(posts);
    console.log("Successfully seeded 200 posts!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedPosts();
