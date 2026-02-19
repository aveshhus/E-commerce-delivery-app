const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

router.use(auth);

// Wallet
router.get('/wallet', userController.getWallet);
router.post('/wallet/add', userController.addMoney);

// Notifications
router.get('/notifications', userController.getNotifications);

// Favorites
router.get('/favorites', userController.getFavorites);
router.post('/favorites/toggle', userController.toggleFavorite);

module.exports = router;
