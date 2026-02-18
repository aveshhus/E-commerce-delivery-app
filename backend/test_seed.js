require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');

async function test() {
    try {
        await connectDB();

        const User = require('./src/models/User');
        try {
            await User.collection.drop();
            console.log('Collection dropped (indexes cleared)');
        } catch (e) {
            console.log('Collection drop skipped (maybe not exist)');
        }
        const count = await User.countDocuments();
        console.log('Current user count:', count);

        // Try creating the admin
        const admin = new User({
            name: 'Admin',
            email: 'admin@krishnamarketing.com',
            phone: '9999999999',
            password: 'admin123',
            role: 'superadmin',
            isVerified: true
        });

        const validationError = admin.validateSync();
        if (validationError) {
            console.log('VALIDATION ERROR:', validationError.message);
        } else {
            console.log('Validation passed, saving...');
            await admin.save();
            console.log('SUCCESS! Admin created:', admin.email);
        }

        process.exit(0);
    } catch (e) {
        console.log('ERROR NAME:', e.name);
        console.log('ERROR MSG:', e.message);
        if (e.code) console.log('ERROR CODE:', e.code);
        if (e.keyPattern) console.log('KEY PATTERN:', JSON.stringify(e.keyPattern));
        process.exit(1);
    }
}
test();
