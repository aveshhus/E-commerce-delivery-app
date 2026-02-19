const User = require('../models/User');
const Product = require('../models/Product');

// Get User Wallet
exports.getWallet = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Mock history for now (could be stored in a Transaction model)
        const history = [
            { id: 1, type: 'Credit', amount: 500, desc: 'Welcome Bonus', date: '2023-11-01' }
        ];

        res.json({
            success: true,
            data: {
                balance: user.walletBalance || 0,
                history: history
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add Money (Mock)
exports.addMoney = async (req, res) => {
    try {
        const { amount } = req.body;
        const user = await User.findById(req.user._id);

        user.walletBalance = (user.walletBalance || 0) + Number(amount);
        await user.save();

        res.json({ success: true, message: 'Money added successfully', balance: user.walletBalance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Notifications
exports.getNotifications = async (req, res) => {
    try {
        // Mock notifications
        const notifications = [
            { id: 1, title: 'Welcome!', desc: 'Thanks for joining GroceryApp.', date: 'Just now', read: false, type: 'System' }
        ];
        res.json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle Favorite
exports.toggleFavorite = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user._id);

        const index = user.favorites.products.indexOf(productId);
        let status = '';

        if (index === -1) {
            user.favorites.products.push(productId);
            status = 'added';
        } else {
            user.favorites.products.splice(index, 1);
            status = 'removed';
        }

        await user.save();
        res.json({ success: true, message: `Product ${status} from favorites`, status });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Favorites
exports.getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('favorites.products');
        res.json({ success: true, data: user.favorites.products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
