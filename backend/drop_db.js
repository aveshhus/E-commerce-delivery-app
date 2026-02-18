require('dotenv').config();
const mongoose = require('mongoose');

async function drop() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected');
        await mongoose.connection.db.dropDatabase();
        console.log('Database dropped');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
drop();
