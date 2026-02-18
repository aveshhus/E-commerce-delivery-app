const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth, authorize('admin', 'superadmin'));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);
router.get('/sales-graph', adminController.getSalesGraph);
router.get('/top-products', adminController.getTopProducts);

// Customers
router.get('/customers', adminController.getCustomers);

// Offers
router.get('/offers', adminController.getOffers);
router.post('/offers', adminController.createOffer);
router.put('/offers/:id', adminController.updateOffer);
router.delete('/offers/:id', adminController.deleteOffer);

// Coupons
router.get('/coupons', adminController.getCoupons);
router.post('/coupons', adminController.createCoupon);
router.put('/coupons/:id', adminController.updateCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);

// Notifications
router.post('/notifications', adminController.sendNotification);

module.exports = router;
