const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const createOrUpdateAkhila = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: "users" });
        console.log("✅ MongoDB Connected...\n");

        const email = "akhila@test.com";

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            console.log(`📍 Found existing account: ${email}`);
        } else {
            console.log(`📍 Creating new account: ${email}`);
            const password = await bcrypt.hash("password123", 10);
            user = new User({
                email,
                password,
                first_name: "Akhila"
            });
        }

        // Update with complete profile
        user.first_name = "Akhila";
        user.gender = "Female";
        user.interested_in = "Male";
        user.date_of_birth = new Date(2000, 0, 15); // Jan 15, 2000 (age 26)
        user.bio = "Hey! I'm Akhila. I love connecting with genuine people who share similar values. Let's see where this goes! 💕";
        user.relationship_goal = "Long-term";
        user.denomination = "Non-denominational";
        user.church_involvement = "Moderate";
        user.location = "London, UK";
        user.interests = ["Reading", "Music", "Travel", "Cooking", "Photography"];
        user.phoneNumber = "+44 7700 900000";

        // Add photos
        user.photos = [
            {
                url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=60",
                caption: "Profile Pic",
                location: "London, UK"
            },
            {
                url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=60",
                caption: "Travel vibes",
                location: "Paris, France"
            },
            {
                url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=60",
                caption: "Sunday mood",
                location: "London, UK"
            }
        ];

        user.isProfileComplete = true;

        await user.save();

        console.log("✅ Akhila's profile created/updated successfully!\n");
        console.log("👤 Profile Details:");
        console.log(`   Name: ${user.first_name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Password: password123`);
        console.log(`   Gender: ${user.gender}`);
        console.log(`   Interested in: ${user.interested_in}`);
        console.log(`   Age: 26`);
        console.log(`   Bio: ${user.bio}`);
        console.log(`   Location: ${user.location}`);
        console.log(`   Denomination: ${user.denomination}`);
        console.log(`   Profile Complete: ✅ ${user.isProfileComplete}`);
        console.log(`   Photos: ${user.photos?.length || 0}`);
        console.log(`\n🔐 Login with: akhila@test.com / password123`);

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
};

createOrUpdateAkhila();
