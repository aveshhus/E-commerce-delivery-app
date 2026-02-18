const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Offer = require('../models/Offer');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const LoyaltyPoints = require('../models/LoyaltyPoints');

// Dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalOrders, todayOrders, totalRevenue, todayRevenue, totalCustomers, totalProducts, pendingOrders, lowStockProducts] = await Promise.all([
            Order.countDocuments(),
            Order.countDocuments({ createdAt: { $gte: today } }),
            Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
            Order.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: today } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
            User.countDocuments({ role: 'customer' }),
            Product.countDocuments({ isActive: true }),
            Order.countDocuments({ status: { $in: ['placed', 'confirmed', 'preparing'] } }),
            Product.countDocuments({ isActive: true, $expr: { $lte: ['$stock', '$lowStockThreshold'] } })
        ]);

        res.json({
            success: true,
            data: {
                stats: {
                    totalOrders,
                    todayOrders,
                    totalRevenue: totalRevenue[0]?.total || 0,
                    todayRevenue: todayRevenue[0]?.total || 0,
                    totalCustomers,
                    totalProducts,
                    pendingOrders,
                    lowStockProducts
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Sales graph data
exports.getSalesGraph = async (req, res) => {
    try {
        const { period = '7days' } = req.query;
        let startDate = new Date();

        if (period === '7days') startDate.setDate(startDate.getDate() - 7);
        else if (period === '30days') startDate.setDate(startDate.getDate() - 30);
        else if (period === '12months') startDate.setMonth(startDate.getMonth() - 12);

        const salesData = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
            {
                $group: {
                    _id: { $dateToString: { format: period === '12months' ? '%Y-%m' : '%Y-%m-%d', date: '$createdAt' } },
                    orders: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({ success: true, data: { salesData } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Top selling products
exports.getTopProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true })
            .sort({ totalSold: -1 })
            .limit(10)
            .select('name images price totalSold stock')
            .lean();
        res.json({ success: true, data: { products } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all customers
exports.getCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const filter = { role: 'customer' };
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await User.countDocuments(filter);
        const customers = await User.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        res.json({
            success: true,
            data: {
                customers,
                pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Offer CRUD
exports.getOffers = async (req, res) => {
    try {
        const offers = await Offer.find().sort({ createdAt: -1 });
        res.json({ success: true, data: { offers } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getActiveOffers = async (req, res) => {
    try {
        const now = new Date();
        const offers = await Offer.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).sort({ sortOrder: 1 });
        res.json({ success: true, data: { offers } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getBanners = async (req, res) => {
    try {
        const now = new Date();
        const banners = await Offer.find({
            isActive: true,
            isBanner: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).sort({ sortOrder: 1 });
        res.json({ success: true, data: { banners } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createOffer = async (req, res) => {
    try {
        const offer = await Offer.create(req.body);
        res.status(201).json({ success: true, message: 'Offer created', data: { offer } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateOffer = async (req, res) => {
    try {
        const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, message: 'Offer updated', data: { offer } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteOffer = async (req, res) => {
    try {
        await Offer.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Offer deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Coupon CRUD
exports.getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json({ success: true, data: { coupons } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json({ success: true, message: 'Coupon created', data: { coupon } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, message: 'Coupon updated', data: { coupon } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Coupon deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Validate coupon (public)
exports.validateCoupon = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Invalid coupon code' });
        }
        const validation = coupon.isValid(req.user?._id, orderAmount);
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: validation.message });
        }
        const discount = coupon.calculateDiscount(orderAmount);
        res.json({ success: true, data: { coupon: { code: coupon.code, type: coupon.type, value: coupon.value, discount } } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Loyalty Points
exports.getLoyaltyHistory = async (req, res) => {
    try {
        const history = await LoyaltyPoints.find({ user: req.user._id })
            .populate('order', 'orderNumber totalAmount')
            .sort({ createdAt: -1 })
            .limit(50);
        const user = await User.findById(req.user._id);
        res.json({ success: true, data: { balance: user.loyaltyPoints, history } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            $or: [{ user: req.user._id }, { isBroadcast: true }]
        })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({ success: true, data: { notifications } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.markNotificationRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.sendNotification = async (req, res) => {
    try {
        const { title, body, type, userId, isBroadcast, image } = req.body;
        const notification = await Notification.create({
            user: userId,
            title,
            body,
            type,
            isBroadcast: isBroadcast || false,
            image
        });
        res.status(201).json({ success: true, message: 'Notification sent', data: { notification } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
