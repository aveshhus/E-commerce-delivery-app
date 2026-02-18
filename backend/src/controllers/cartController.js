const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// Get cart
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product', 'name images price mrp discount stock isActive')
            .populate('coupon');

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        res.json({ success: true, data: { cart } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add to cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1, variant } = req.body;

        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ success: false, message: 'Insufficient stock' });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        const itemPrice = variant?.price || product.price;
        const existingIndex = cart.items.findIndex(
            item => item.product.toString() === productId &&
                JSON.stringify(item.variant) === JSON.stringify(variant)
        );

        if (existingIndex > -1) {
            cart.items[existingIndex].quantity += quantity;
            cart.items[existingIndex].price = itemPrice;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                price: itemPrice,
                variant
            });
        }

        await cart.save();
        await cart.populate('items.product', 'name images price mrp discount stock isActive');

        res.json({ success: true, message: 'Item added to cart', data: { cart } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update cart item
exports.updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { itemId } = req.params;

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        const item = cart.items.id(itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }

        if (quantity <= 0) {
            cart.items.pull(itemId);
        } else {
            const product = await Product.findById(item.product);
            if (product.stock < quantity) {
                return res.status(400).json({ success: false, message: 'Insufficient stock' });
            }
            item.quantity = quantity;
        }

        await cart.save();
        await cart.populate('items.product', 'name images price mrp discount stock isActive');

        res.json({ success: true, message: 'Cart updated', data: { cart } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Remove from cart
exports.removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        cart.items.pull(req.params.itemId);
        await cart.save();
        await cart.populate('items.product', 'name images price mrp discount stock isActive');

        res.json({ success: true, message: 'Item removed', data: { cart } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Clear cart
exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            cart.coupon = undefined;
            cart.couponDiscount = 0;
            await cart.save();
        }
        res.json({ success: true, message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Apply coupon
exports.applyCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Invalid coupon code' });
        }

        const subtotal = cart.items.reduce((sum, item) => {
            return sum + (item.variant?.price || item.price) * item.quantity;
        }, 0);

        const validation = coupon.isValid(req.user._id, subtotal);
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: validation.message });
        }

        const discount = coupon.calculateDiscount(subtotal);

        cart.coupon = coupon._id;
        cart.couponDiscount = discount;
        await cart.save();

        res.json({
            success: true,
            message: `Coupon applied! You save ₹${discount}`,
            data: { cart, discount }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Remove coupon
exports.removeCoupon = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.coupon = undefined;
            cart.couponDiscount = 0;
            await cart.save();
        }
        res.json({ success: true, message: 'Coupon removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
