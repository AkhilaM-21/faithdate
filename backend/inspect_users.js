const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('inspect_output.txt', msg + '\n');
};

const checkUsers = async () => {
    try {
        let uri = process.env.MONGO_URI;
        if (!uri) {
            log("MONGO_URI is missing from .env");
            process.exit(1);
        }

        // Force connection to 'users' database
        if (!uri.endsWith('/users')) {
            if (uri.endsWith('/')) {
                uri += 'users';
            } else {
                uri += '/users';
            }
        }

        log(`Connecting to: ${uri}`);
        await mongoose.connect(uri);
        log('Connected to MongoDB');

        // Explicitly define schema to match 'profile' collection
        const userSchema = new mongoose.Schema({}, { strict: false });
        const User = mongoose.model('User', userSchema, 'profile');

        const totalUsers = await User.countDocuments();
        log(`Total Users in 'users.profile': ${totalUsers}`);

        if (totalUsers > 0) {
            const users = await User.find({}).limit(5);
            log(`Found ${users.length} sample users.`);
            for (const u of users) {
                // Access _doc or direct properties depending on mongoose version/object state
                const data = u._doc || u;
                log(`User: ${data.first_name || 'No Name'} (${data._id})`);
                log(`  isProfileComplete: ${data.isProfileComplete}`);
                log(`  isVisible: ${data.isVisible}`);
                log(`  isShadowBanned: ${data.isShadowBanned}`);
                log(`  lastActive: ${data.lastActive}`);
                log(`  desirabilityScore: ${data.desirabilityScore}`);
                log('-------------------------');
            }
        } else {
            log("No users found in 'users' database 'profile' collection.");
        }

        process.exit(0);
    } catch (err) {
        log("Error: " + err);
        process.exit(1);
    }
};

fs.writeFileSync('inspect_output.txt', ''); // Clear file
checkUsers();
