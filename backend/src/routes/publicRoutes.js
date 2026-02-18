const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { auth, optionalAuth } = require('../middleware/auth');

// Public
router.get('/offers/active', adminController.getActiveOffers);
router.get('/banners', adminController.getBanners);
router.post('/coupons/validate', optionalAuth, adminController.validateCoupon);

// Authenticated
router.get('/loyalty/history', auth, adminController.getLoyaltyHistory);
router.get('/notifications', auth, adminController.getNotifications);
router.put('/notifications/:id/read', auth, adminController.markNotificationRead);

module.exports = router;
