require('dotenv').config();
const mongoose = require('mongoose');
const Festival = require('./models/Festival');
const connectDB = require('./config/database');

const checkFestivals = async () => {
    try {
        await connectDB();
        const count = await Festival.countDocuments();
        const active = await Festival.findOne({ isActive: true });
        console.log(`Total Festivals: ${count}`);
        console.log('Active Festival:', active ? active.name : 'None');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkFestivals();
