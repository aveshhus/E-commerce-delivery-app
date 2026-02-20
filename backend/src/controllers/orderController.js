const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const LoyaltyPoints = require('../models/LoyaltyPoints');
const Address = require('../models/Address');
const { calculateLoyaltyPoints, pointsToRupees } = require('../utils/helpers');

// Create order
exports.createOrder = async (req, res) => {
    try {
        const { addressId, paymentMethod, loyaltyPointsToUse = 0, notes } = req.body;

        // Get cart
        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product')
            .populate('coupon');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        // Get address
        const address = await Address.findById(addressId);
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        // Validate stock and build items
        const orderItems = [];
        let subtotal = 0;

        for (const item of cart.items) {
            const product = await Product.findById(item.product._id || item.product);
            if (!product || !product.isActive) {
                return res.status(400).json({
                    success: false,
                    message: `Product "${item.product.name || 'Unknown'}" is no longer available`
                });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for "${product.name}"`
                });
            }

            const itemPrice = item.variant?.price || product.price;
            const itemTotal = itemPrice * item.quantity;
            subtotal += itemTotal;

            const orderPayloadItem = {
                product: product._id,
                name: product.name,
                image: product.images[0]?.url || '',
                quantity: item.quantity,
                price: itemPrice,
                total: itemTotal
            };
            if (item.variant && item.variant.name) {
                orderPayloadItem.variant = {
                    name: item.variant.name,
                    value: item.variant.value,
                    price: item.variant.price
                };
            }
            orderItems.push(orderPayloadItem);
        }

        // Calculate totals
        const deliveryCharge = subtotal >= 500 ? 0 : 30;
        const couponDiscount = cart.couponDiscount || 0;

        // Loyalty points
        let loyaltyPointsDiscount = 0;
        if (loyaltyPointsToUse > 0) {
            const user = await User.findById(req.user._id);
            const maxPoints = Math.min(loyaltyPointsToUse, user.loyaltyPoints);
            loyaltyPointsDiscount = pointsToRupees(maxPoints);
        }

        const totalAmount = Math.max(0, subtotal + deliveryCharge - couponDiscount - loyaltyPointsDiscount);

        // Generate order number
        const orderNumber = Order.generateOrderNumber();

        // Create order
        const order = await Order.create({
            orderNumber,
            user: req.user._id,
            items: orderItems,
            deliveryAddress: {
                fullName: address.fullName,
                phone: address.phone,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2,
                landmark: address.landmark,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                location: address.location
            },
            subtotal,
            deliveryCharge,
            couponDiscount,
            loyaltyPointsUsed: loyaltyPointsToUse,
            loyaltyPointsDiscount,
            totalAmount,
            paymentMethod,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
            notes,
            coupon: cart.coupon?._id,
            estimatedDeliveryTime: new Date(Date.now() + 20 * 60 * 1000)
        });

        // Reduce stock
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity, totalSold: item.quantity }
            });
        }

        // Deduct loyalty points
        if (loyaltyPointsToUse > 0) {
            await User.findByIdAndUpdate(req.user._id, {
                $inc: { loyaltyPoints: -loyaltyPointsToUse }
            });
            await LoyaltyPoints.create({
                user: req.user._id,
                type: 'redeemed',
                points: -loyaltyPointsToUse,
                order: order._id,
                description: `Redeemed ${loyaltyPointsToUse} points for order ${orderNumber}`
            });
        }

        // Clear cart
        cart.items = [];
        cart.coupon = undefined;
        cart.couponDiscount = 0;
        await cart.save();

        // Earn loyalty points (on payment completion or COD delivery)
        if (paymentMethod === 'cod') {
            const pointsEarned = calculateLoyaltyPoints(totalAmount);
            if (pointsEarned > 0) {
                await User.findByIdAndUpdate(req.user._id, {
                    $inc: { loyaltyPoints: pointsEarned }
                });
                await LoyaltyPoints.create({
                    user: req.user._id,
                    type: 'earned',
                    points: pointsEarned,
                    order: order._id,
                    description: `Earned ${pointsEarned} points for order ${orderNumber}`
                });
            }
        }

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: { order }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const filter = { user: req.user._id };
        if (status) filter.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Order.countDocuments(filter);

        const orders = await Order.find(filter)
            .populate('deliveryAgent', 'name phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        res.json({
            success: true,
            data: {
                orders,
                pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single order
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            $or: [{ _id: req.params.id }, { orderNumber: req.params.id }],
            user: req.user._id
        })
            .populate('deliveryAgent', 'name phone currentLocation')
            .populate('items.product', 'name images');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, data: { order } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
    try {
        const { reason } = req.body;
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (!['placed', 'confirmed'].includes(order.status)) {
            return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
        }

        order.status = 'cancelled';
        order.cancelReason = reason;
        order.statusHistory.push({ status: 'cancelled', note: reason || 'Cancelled by customer' });

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity, totalSold: -item.quantity }
            });
        }

        // Refund loyalty points used
        if (order.loyaltyPointsUsed > 0) {
            await User.findByIdAndUpdate(req.user._id, {
                $inc: { loyaltyPoints: order.loyaltyPointsUsed }
            });
            await LoyaltyPoints.create({
                user: req.user._id,
                type: 'refunded',
                points: order.loyaltyPointsUsed,
                order: order._id,
                description: `Refunded ${order.loyaltyPointsUsed} points for cancelled order`
            });
        }

        await order.save();

        res.json({ success: true, message: 'Order cancelled', data: { order } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Reorder
exports.reorder = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product && product.isActive && product.stock >= 1) {
                const existing = cart.items.findIndex(i => i.product.toString() === item.product.toString());
                if (existing > -1) {
                    cart.items[existing].quantity = item.quantity;
                } else {
                    cart.items.push({
                        product: item.product,
                        quantity: Math.min(item.quantity, product.stock),
                        price: product.price,
                        variant: item.variant
                    });
                }
            }
        }

        await cart.save();
        await cart.populate('items.product', 'name images price mrp discount stock');

        res.json({ success: true, message: 'Items added to cart', data: { cart } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, startDate, endDate } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Order.countDocuments(filter);

        const orders = await Order.find(filter)
            .populate('user', 'name phone email')
            .populate('deliveryAgent', 'name phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        res.json({
            success: true,
            data: {
                orders,
                pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.status = status;
        order.statusHistory.push({ status, note });

        if (status === 'delivered') {
            order.actualDeliveryTime = new Date();
            order.paymentStatus = 'paid';
        }

        await order.save();

        res.json({ success: true, message: 'Order status updated', data: { order } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Assign delivery agent
exports.assignDeliveryAgent = async (req, res) => {
    try {
        const { agentId } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                deliveryAgent: agentId,
                status: 'out_for_delivery',
                $push: { statusHistory: { status: 'out_for_delivery', note: 'Delivery agent assigned' } }
            },
            { new: true }
        ).populate('deliveryAgent', 'name phone');

        res.json({ success: true, message: 'Delivery agent assigned', data: { order } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
