require('dotenv').config();
const mongoose = require('mongoose');
const Festival = require('./models/Festival');
const connectDB = require('./config/database');

const activateFestival = async () => {
    try {
        await connectDB();
        const festival = await Festival.findOne();
        if (festival) {
            festival.isActive = true;
            await festival.save();
            console.log(`Activated festival: ${festival.name}`);
        } else {
            console.log('No festival found to activate.');
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

activateFestival();
