const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Post = require("./models/Post");

dotenv.config();

const checkDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: "users" });
        console.log("✅ MongoDB Connected...");
        console.log(`📍 Database: ${mongoose.connection.name}`);

        const userCount = await User.countDocuments();
        const postCount = await Post.countDocuments();

        console.log(`\n📊 Database Status:`);
        console.log(`   Users: ${userCount}`);
        console.log(`   Posts: ${postCount}`);

        if (userCount > 0) {
            console.log(`\n👤 Sample user:`);
            const sampleUser = await User.findOne({}).select("-password");
            console.log(JSON.stringify(sampleUser, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
};

checkDatabase();
