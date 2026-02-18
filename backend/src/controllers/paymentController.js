const Order = require('../models/Order');
const Payment = require('../models/Payment');

// Create Razorpay order
exports.createRazorpayOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // In production, use Razorpay SDK
        // const Razorpay = require('razorpay');
        // const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
        // const razorpayOrder = await razorpay.orders.create({ amount: order.totalAmount * 100, currency: 'INR', receipt: order.orderNumber });

        const payment = await Payment.create({
            order: order._id,
            user: req.user._id,
            amount: order.totalAmount,
            method: 'razorpay',
            status: 'pending',
            gatewayOrderId: `rzp_${Date.now()}` // Replace with actual Razorpay order ID
        });

        res.json({
            success: true,
            data: {
                payment,
                razorpayKeyId: process.env.RAZORPAY_KEY_ID,
                amount: order.totalAmount * 100,
                currency: 'INR',
                orderId: payment.gatewayOrderId
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verify Razorpay payment
exports.verifyRazorpayPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // In production, verify signature
        // const crypto = require('crypto');
        // const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        //   .update(razorpay_order_id + '|' + razorpay_payment_id).digest('hex');
        // if (generated_signature !== razorpay_signature) throw new Error('Invalid signature');

        const payment = await Payment.findOneAndUpdate(
            { gatewayOrderId: razorpay_order_id },
            {
                status: 'completed',
                gatewayPaymentId: razorpay_payment_id,
                gatewaySignature: razorpay_signature
            },
            { new: true }
        );

        if (payment) {
            await Order.findByIdAndUpdate(payment.order, { paymentStatus: 'paid' });
        }

        res.json({ success: true, message: 'Payment verified', data: { payment } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create Stripe payment intent
exports.createStripePaymentIntent = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // In production, use Stripe SDK
        // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        // const paymentIntent = await stripe.paymentIntents.create({
        //   amount: Math.round(order.totalAmount * 100),
        //   currency: 'inr',
        //   metadata: { orderId: order._id.toString(), orderNumber: order.orderNumber }
        // });

        const payment = await Payment.create({
            order: order._id,
            user: req.user._id,
            amount: order.totalAmount,
            method: 'stripe',
            status: 'pending',
            stripePaymentIntentId: `pi_${Date.now()}`, // Replace with actual Stripe PI ID
            stripeClientSecret: `pi_${Date.now()}_secret` // Replace with actual client secret
        });

        res.json({
            success: true,
            data: {
                payment,
                clientSecret: payment.stripeClientSecret,
                publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Confirm Stripe payment
exports.confirmStripePayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        const payment = await Payment.findOneAndUpdate(
            { stripePaymentIntentId: paymentIntentId },
            { status: 'completed' },
            { new: true }
        );

        if (payment) {
            await Order.findByIdAndUpdate(payment.order, { paymentStatus: 'paid' });
        }

        res.json({ success: true, message: 'Payment confirmed', data: { payment } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get payment history
exports.getPaymentHistory = async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user._id })
            .populate('order', 'orderNumber totalAmount status')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: { payments } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
