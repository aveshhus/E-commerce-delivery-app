const DeliveryAgent = require('../models/DeliveryAgent');
const Order = require('../models/Order');
const User = require('../models/User');

// Get all delivery agents
exports.getAgents = async (req, res) => {
    try {
        const { isAvailable, isActive, isOnline } = req.query;
        const filter = {};
        if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (isOnline !== undefined) filter.isOnline = isOnline === 'true';

        const agents = await DeliveryAgent.find(filter).populate('user', 'name email phone').lean();
        res.json({ success: true, data: { agents } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create delivery agent
exports.createAgent = async (req, res) => {
    try {
        const { name, phone, email, vehicleType, vehicleNumber, licenseNumber, password } = req.body;

        // Create user account for agent
        let user = await User.findOne({ phone });
        if (!user) {
            user = await User.create({
                name,
                phone,
                email,
                password: password || 'delivery123',
                role: 'delivery',
                isVerified: true
            });
        } else {
            user.role = 'delivery';
            await user.save();
        }

        const agent = await DeliveryAgent.create({
            user: user._id,
            name,
            phone,
            email,
            vehicleType,
            vehicleNumber,
            licenseNumber
        });

        res.status(201).json({ success: true, message: 'Delivery agent created', data: { agent } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update agent
exports.updateAgent = async (req, res) => {
    try {
        const agent = await DeliveryAgent.findByIdAndUpdate(req.params.id, req.body, {
            new: true, runValidators: true
        });
        if (!agent) {
            return res.status(404).json({ success: false, message: 'Agent not found' });
        }
        res.json({ success: true, message: 'Agent updated', data: { agent } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update agent location
exports.updateLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const agent = await DeliveryAgent.findOneAndUpdate(
            { user: req.user._id },
            {
                currentLocation: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                }
            },
            { new: true }
        );
        res.json({ success: true, data: { agent } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle availability
exports.toggleAvailability = async (req, res) => {
    try {
        const agent = await DeliveryAgent.findOne({ user: req.user._id });
        if (!agent) {
            return res.status(404).json({ success: false, message: 'Agent not found' });
        }
        agent.isOnline = !agent.isOnline;
        if (!agent.isOnline) agent.isAvailable = false;
        else agent.isAvailable = true;
        await agent.save();
        res.json({ success: true, data: { agent } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get agent's current delivery
exports.getCurrentDelivery = async (req, res) => {
    try {
        const agent = await DeliveryAgent.findOne({ user: req.user._id });
        if (!agent || !agent.currentOrder) {
            return res.json({ success: true, data: { order: null } });
        }
        const order = await Order.findById(agent.currentOrder)
            .populate('user', 'name phone');
        res.json({ success: true, data: { order } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Complete delivery
exports.completeDelivery = async (req, res) => {
    try {
        const agent = await DeliveryAgent.findOne({ user: req.user._id });
        if (!agent) {
            return res.status(404).json({ success: false, message: 'Agent not found' });
        }

        const order = await Order.findById(agent.currentOrder);
        if (order) {
            order.status = 'delivered';
            order.actualDeliveryTime = new Date();
            order.paymentStatus = 'paid';
            order.statusHistory.push({ status: 'delivered', note: 'Delivered by agent' });
            await order.save();
        }

        agent.currentOrder = null;
        agent.isAvailable = true;
        agent.totalDeliveries += 1;
        agent.earnings.today += 30; // per delivery earning
        agent.earnings.total += 30;
        await agent.save();

        res.json({ success: true, message: 'Delivery completed', data: { order } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get nearby available agents
exports.getNearbyAgents = async (req, res) => {
    try {
        const { longitude, latitude, maxDistance = 4000 } = req.query;
        const agents = await DeliveryAgent.find({
            isAvailable: true,
            isActive: true,
            isOnline: true,
            currentLocation: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        });
        res.json({ success: true, data: { agents } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
