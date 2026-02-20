const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database Connected");

        // Drop stale index left over from old schema (username_1 unique index)
        try {
            await mongoose.connection.collection('users').dropIndex('username_1');
            console.log("Dropped stale 'username_1' index from users collection");
        } catch (_) {
            // Index doesn't exist — that's fine, ignore
        }
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }
};

module.exports = connectDB;
