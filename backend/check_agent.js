require('dotenv').config();
const connectDB = require('./src/config/database');
const DeliveryAgent = require('./src/models/DeliveryAgent');

async function test() {
    await connectDB();
    const agents = await DeliveryAgent.find().populate('currentOrder');
    console.log(JSON.stringify(agents, null, 2));
    process.exit(0);
}
test();
