const mongoose = require('mongoose');
require('dotenv').config();

const migrate = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI is missing from .env");
            process.exit(1);
        }
        console.log(`Connecting to: ${process.env.MONGO_URI}`);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Define Schema for 'profile' collection
        const userSchema = new mongoose.Schema({
            isVisible: Boolean,
            isShadowBanned: Boolean,
            desirabilityScore: Number,
            lastActive: Date,
            isProfileComplete: Boolean
        }, { strict: false });

        const User = mongoose.model('User', userSchema, 'profile');

        console.log("Starting migration...");

        // Update all users missing 'isVisible' (or just update all to be safe for defaults)
        const result = await User.updateMany(
            { isVisible: { $exists: false } },
            {
                $set: {
                    isVisible: true,
                    isShadowBanned: false,
                    desirabilityScore: 60, // Give them a decent starting score
                    lastActive: new Date(),
                    isProfileComplete: true // Assume imported users are complete enough
                }
            }
        );

        console.log(`Migration complete. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

migrate();
